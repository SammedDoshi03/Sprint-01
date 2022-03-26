import cinemas, { ICinema }  from "../models/cinemas";

export default class cinemaController{


    /**
     * Remove a cinema having seatAvailibility than than  0
     */
    static async removeCinema(cinemaId: string): Promise<ICinema> {
        const cinema = await cinemas.findByIdAndRemove(cinemaId);
        return cinema;
    }
    /**
     * Find all cinemas
     */
     static async getCinemas(): Promise<ICinema[]> {
        console.log("getCinemas");
        const cinemasList =  await  cinemas.aggregate([
            {
                $lookup: {
                    from: "movies",
                    localField: "movie",
                    foreignField: "_id",
                    as: "movie"
                }
            }
        ]);
        //filter cinemans greater than and equals to seatAvailibility by 0
        const cinemasWithSeats = cinemasList.filter(ele => ele.seatsAvailable >= 0);
        const cinemasWithoutSeats = cinemasList.filter(ele => ele.seatsAvailable < 0);
        const finalCinemanList = await  cinemasWithoutSeats.map(ele => {
           this.removeCinema(ele._id);
        });
        return cinemasWithSeats;
    }


    /**
     * decrease the number of seats in a cinema
     */
    static async decreaseSeats(cinemaId: string, numberOfSeats: number): Promise<ICinema> {
        const cinema = await cinemas.findOne({_id: cinemaId});
        cinema.seatsAvailable -= numberOfSeats;
        return await cinema.save();
    }
    /**
     * GET NUMBER OF SEATS AVAILABLE
     */
    static async getSeatsAvailable(cinemaId: string): Promise<number> {
        const cinema = await cinemas.findOne({_id: cinemaId});
        return cinema.seatsAvailable;
    }
}