import movies, { IMovies } from '../models/movies';

export default class movieController{

    // get all movies
    public static async getAllMovies(): Promise<IMovies[]> {
        return await movies.find({
            "showTime": {
                "$gte": new Date()
            }
        });
    }
}