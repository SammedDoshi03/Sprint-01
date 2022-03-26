
import users, { IUser } from "../models/users";
import Bcrypt from "../services/bcrypt";
import tickets, {ITickets} from "../models/tickets";
import cinemas from "../models/cinemas";
import cinemaController from "./cinemaController";
import mongoose from "mongoose";

export default class userController {
    /**
     * creating a new user
     * @param body
     * @returns {Promise<IUser>}
     */
    static async createUser(body: IUser): Promise<IUser> {
        const user = await users.findOne({email: body.email});
        if (user) {
            throw new Error("User already exists");
        }
        const hashedPassword = await Bcrypt.hashing(body.password);
        const newUser = await users.create({
            ...body,
            password: hashedPassword,
        });
        return newUser;
    }
    /**
     * authenticating a user
     * @param email
     * @param password
     * @returns {Promise<IUser>}
     */

    static async auth(email: string, password: string): Promise<IUser> {

        return users.findOne({email}).lean().then((user: IUser) => {
            if (!user) {
                throw new Error("User not found");
            }
            if (!Bcrypt.comparing(password, user.password)) {
                throw new Error("Password is incorrect");
            }
            return user;
        });
    }

    // book tickets
    static async bookTicket(data): Promise<ITickets> {
        const {userid, cid, mid, showTime,  seats} = data;
        const user = await users.findOne({_id: userid});
        const cinema = await cinemas.findOne({_id: cid});
        console.log(cinema);
        if(!user || !cinema || !seats) {
            throw  new Error("User or cinema/movieid not found");
        }
        const seatsAvailable = await cinemaController.getSeatsAvailable(cid);
        if(seatsAvailable < 1 && seatsAvailable < seats){
            throw new Error("No seats available");
        }
        const ticket = await tickets.create({
            user: userid,
            cinema: cid,
            movie: mid,
            seats: seats
        })
        await cinema.updateOne({
            $inc: {seatsAvailable: - seats}
        })
        return ticket;
    }

    // get all tickets
        static async getBookings(userId): Promise<ITickets[]> {

        return tickets.aggregate([
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

        ]).exec();
    }
}