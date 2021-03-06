import cinemas, { ICinema }  from "../models/cinemas";
import mongoose from "mongoose";

export default class cinemaController{


    /**
     * Find all cinemas
     */
     static async getCinemas(): Promise<ICinema[]> {
        const cinemasList = await cinemas.aggregate([
            {
                $lookup: {
                    from: "movies",
                    localField: "movie",
                    foreignField: "_id",
                    as: "movie"
                }
            }
        ]).exec();

        if (cinemasList.length > 0) {
            //filter out the movies that are out of date
            const cinema = cinemasList.filter(cinema => {
                const movie = cinema.movie[0];
                return new Date(movie.showTime) > new Date();
            })
            if(cinema.length > 0)
                return cinema;
            else throw new Error("No cinemas found")
        } else {
            throw new Error("No cinemas found");
        }
    }


    /**
     * GET NUMBER OF SEATS AVAILABLE
     * @param cinemaId
     */
    static async getSeatsAvailable(cinemaId: string): Promise<number> {
        const cinema = await cinemas.findOne({_id: cinemaId});
        return cinema.seatsAvailable;
    }

    /**
     * get cinemas by movie
     * @param movieId
     */

    // get all cinemas for a movie
    static async getCinemasByMovie(movie) : Promise<ICinema[]> {
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
        if (cinemasList.length > 0) {
            //filter out the movies that are out of date
            const cinema = cinemasList.filter(cinema => {
                const movie = cinema.movie[0];
                return new Date(movie.showTime) > new Date();
            })
            if(cinema.length > 0)
                return cinema;
            else throw new Error("No cinemas found")
        } else {
            throw new Error("No cinemas found");
        }
    }
}