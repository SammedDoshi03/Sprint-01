

import Bcrypt from "../services/bcrypt";
import admins, {IAdmin} from "../models/admins";
import cinemas, {ICinema} from "../models/cinemas";
import movies, {IMovies} from "../models/movies";


export default class adminController {

    /**
     * authenticating a user
     * @param email
     * @param password
     * @returns {Promise<IAdmin>}
     */

    static async auth(email: string, password: string): Promise<IAdmin> {

        return admins.findOne({email}).lean().then((admin: IAdmin) => {
            if (!admin) {
                throw new Error("Admin not found");
            }
            if (!Bcrypt.comparing(password, admin.password)) {
                throw new Error("Password is incorrect");
            }
            return admin;
        });
    }

    // Add a new cinema
    static async addCinema(cinema: ICinema): Promise<ICinema> {
        return await cinemas.create(cinema);
    }

    //Add a new Movie
    static async addMovie(movie: IMovies): Promise<IMovies> {
        return await movies.create(movie);
    }

    static createUser(data: IAdmin): Promise<IAdmin> {
        return admins.create(data);
    }
}