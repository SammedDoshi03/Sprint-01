import cinemas, { ICinema }  from "../models/cinemas";

export default class cinemaController{


    /**
     * Find all cinemas
     */
     static async getCinemas(): Promise<ICinema[]> {
        console.log("getCinemas");
        return cinemas.aggregate([
            {
                $lookup: {
                    from: "movies",
                    localField: "movie",
                    foreignField: "_id",
                    as: "movie"
                }
            }
        ]).exec();
       
    }


    /**
     * GET NUMBER OF SEATS AVAILABLE
     */
    static async getSeatsAvailable(cinemaId: string): Promise<number> {
        const cinema = await cinemas.findOne({_id: cinemaId});
        return cinema.seatsAvailable;
    }
}