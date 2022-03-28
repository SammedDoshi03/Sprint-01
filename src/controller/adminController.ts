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

    /**
     * creating a new admin
     */
     static async create(): Promise<void> {
        const email = "admin2@gmail.com";
        const pwd = "admin123"
        const hash = await Bcrypt.hashing(pwd);
        const data = {
            email: email,
            password: hash,
        };
        const auth = await admins.create(data);
        console.log(auth);
    }

    /**
     * authenticating an admin
     * @param email
     * @param password
     */
    static async adminAuth(email: string, password: string): Promise<IAdmin> {
        // fetch admin from database
        const adm = await admins.findOne({ email }).lean();

        // if admin exists or not
        if (adm) {
            // verify the password
            const result = await Bcrypt.comparing(password, adm.password);

            // if password is correct or not
            // if correct, return the admin
            if (result) return adm;
            // throw error
            else throw new Error("Password doesn't match");
        }
        // throw error
        else throw new Error("Admin doesn't exist");
    }


    /**
     * Adding a new cinema
     * @param cinema
     */
    static async addCinema(cinema: ICinema): Promise<ICinema> {
        const moviePresent = await movies.findOne({ _id: cinema.movie });
        if (moviePresent.showTime > new Date())
            return await cinemas.create(cinema);
        else throw new Error("Movie Showtime is over");
    }

    /**
     * Adding a new movie
     * @param movie
     */
    static async addMovie(movie: IMovies): Promise<IMovies> {
        return await movies.create(movie);
    }

    
}