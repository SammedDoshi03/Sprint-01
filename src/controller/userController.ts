
import users, { IUser } from "../models/users";
import Bcrypt from "../services/bcrypt";
import tickets, {ITickets} from "../models/tickets";
import cinemas, {ICinema} from "../models/cinemas";
import cinemaController from "./cinemaController";
import mongoose from "mongoose";
import movies from "../models/movies";

export default class userController {
     /**
     * 
     * @param body 
     * @returns 
     */
      static async create(body:any): Promise<IUser> {
        const hash = await Bcrypt.hashing(body.password);
        const data = {
            ...body,
            password: hash,
    };
   
    return users.create(data);
    
}
    /**
     * 
     * @param email 
     * @param password 
     * @returns 
     */
    static async auth(email:string,password:string): Promise<IUser> {
        //fetch data from database
        const user=  await users.findOne({email}).lean()
        //check user is exists or not
        if (user)
        {
                //comparing the password with hash
            const res= await Bcrypt.comparing(password, user.password);
                //check correct or not
                if(res) return user;
                else throw new Error("wrong password")
        }
        else throw new Error("user not exists");
       
    }



    // book tickets
    static async bookTicket(data): Promise<ITickets> {
        const {userid, cid, mid, showTime,  seats} = data;
        const user = await users.findOne({_id: userid});
        const cinema = await cinemas.findOne({_id: cid});
        
        let st1 = new Date(showTime);
                   
        
        
        console.log(cinema);

        if(!user) {
            throw  new Error("User not found");
        }
        if(!cinema) {
            throw  new Error("cinema not found");
        }
        const movieId = cinema.movie; 
        const movie = await movies.findOne({_id : movieId})
        if(movieId != mid){
            throw new Error("This movie doesn't exists in given cinema theatre");
        }
        const st = movie.showTime;
        console.log(st, st1);
        if(st.getTime() !== st1.getTime()){ 
            throw new Error("Given showtime not available for movie");
        }
        
        
        const seatsAvailable = await cinemaController.getSeatsAvailable(cid);
        if(seatsAvailable < 1 || seatsAvailable < seats){
            throw new Error("No seats available");
        }
        const ticket = await tickets.create({
            user: userid,
            cinema: cid,
            movie: mid,
            seats: seats
        })

        if(!ticket){
            throw new Error("Ticket is not created");
        }
        await cinema.updateOne({
            $inc: {seatsAvailable: - seats}
        })
        return ticket;
    }

    // get all tickets
        static async getBookings(userId): Promise<ITickets[]> {

            const ticketsBooks = await tickets.aggregate([
                {
                    $match: { user: new mongoose.Types.ObjectId(userId) },
                },
                {
                    $lookup: {
                        from: "cinemas",
                        localField: "cinema",
                        foreignField: "_id",
                        as: "cinema"
                    }
                },
                {
                    $lookup: {
                        from: "movies",
                        localField: "movie",
                        foreignField: "_id",
                        as: "movie"
                    },
    
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    },
    
                },
            ]).exec();
    
                ticketsBooks.filter(ticket => {
                    return ticket.movie.showTime > Date.now();
                })
            return ticketsBooks;
    }
    static async getTicket(userId, tid): Promise<ITickets> {

        const result= await tickets.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(userId),
                _id: new mongoose.Types.ObjectId(tid) },
            },
            {
                $lookup: {
                    from: "cinemas",
                    localField: "cinema",
                    foreignField: "_id",
                    as: "cinema"
                }
            },
            {
                $lookup: {
                    from: "movies",
                    localField: "movie",
                    foreignField: "_id",
                    as: "movie"
                },

            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                },

            },
        ]).exec();
        
        // if result is empty or not
        if (result.length > 0) return result[0];
        else throw new Error("ticket not found");
}

    static async getCinemas(movie) : Promise<ICinema[]> {
        const cinemasList = await cinemas.aggregate(
            [
                {
                    $match: { movie: new mongoose.Types.ObjectId(movie) },
                },
                {
                    $lookup: {
                        from: "movies",
                        localField: "movie",
                        foreignField: "_id",
                        as: "movie"
                    },

                },
            ]).exec();
        return cinemasList;
    }
}