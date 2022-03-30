/**
 * @info the main entry point of express server
 */

import express, { Request, Response } from "express";

import bodyParser from "body-parser";
import responseToPostman from "../middleware/responseToPostman";

import expressLog from "../middleware/expressLog";

import Joi from "joi";
import session from "express-session";
import MongoStore from "connect-mongo";

import userController from "../controller/userController";
import adminController from "../controller/adminController";
import cinemaController from "../controller/cinemaController";
import movieController from "../controller/movieController";

export default class Server {
    app = express();

    async start() {
        console.log("Server started");
        this.app.listen(process.env.PORT);
        console.log("Server listening on port: " + process.env.PORT);

        this.middleware();
        this.routes();
        this.defRoutes();
    }

    /**
     * @info middleware
     */
    middleware() {
        this.app.use(expressLog);
        this.app.use(bodyParser.urlencoded({ extended: false }));

        this.app.use(
            session({
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
                store: new MongoStore({
                    mongoUrl: process.env.SESSION_MONGODB_URL,
                    collectionName: "sessions",
                }),
                cookie: {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                },
            }),
        );
        // adminController.create();
    }

    /**
     * @info define all routes
     */

    routes() {
        this.app.get("/", (req: Request, res: Response) => {
            console.log("GET /");
            res.send("Welcome to Movie Booking Platform");
        });

        /**
         * @info admin routes
         */

        // authenticate admin
        this.app.post(
            "/admin/auth",
            responseToPostman(async (req: Request) => {
                // create joi schema
                const schema = Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                });

                // validating req.body
                await schema.validateAsync(req.body);

                // authenticate admin
                const adm = await adminController.adminAuth(req.body.email, req.body.password);

                // set the admin session
                // @ts-ignore
                req.session.admin = adm;
                // @ts-ignore
                req.session.user = null;

                return "Admin authenticated";
            }),
        );

        // logging out user or admin
        this.app.post(
            "/logout",
            responseToPostman((req: Request) => {
                // destroy session
                req.session.destroy(() => {});

                // return success to user/admin
                return { success: true, message: "User/admin is logged out" };
            }),
        );

        //Add cinema
        this.app.post(
            "/admin/addCinema",
            responseToPostman(async (req: Request) => {
                // create joi schema
                const schema = Joi.object({
                    //movie: Joi.string().required(),
                    movie: Joi.string().required(),
                    name: Joi.string().required(),
                    location: Joi.string().required(),
                    seatsAvailable: Joi.number().min(10).max(100).required(),
                });

                // validating req.body
                await schema.validateAsync(req.body);

                // @ts-ignore
                if (req.session && req.session.admin) {
                    await adminController.addCinema(req.body);
                    return "Cinema added";
                } else {
                    throw new Error("You are not authorized to perform this action");
                }
            }),
        );

        //Add movie

        this.app.post(
            "/admin/addMovie",
            responseToPostman(async (req: Request) => {
                //@ts-ignore
                if (req.session && req.session.admin) {
                    const schema = Joi.object({
                        name: Joi.string().required(),
                        showTime: Joi.date().iso().required(),
                    });

                    // validate req.body
                   const data = await schema.validateAsync(req.body);

                    // create the book
                    await movieController.create(data);
                    return "Movie added";
                } else  throw new Error("You are not authorized to perform this action");
            }),
        );

        /**
         * @info user routes
         */

        /**
         * creating a user
         */
        this.app.post(
            "/users/create",
            responseToPostman(async (req: Request, resp: Response) => {
                // create joi schema
                const schema = Joi.object({
                    name: Joi.string().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                });

                // validating req.body
                await schema.validateAsync(req.body);
                // creating user
                // @ts-ignore
                if (req.session && req.session.admin) {
                   const user =  await userController.create(req.body);
                   if(user) {
                       return "User created";
                   } else {
                       throw new Error("User is not created");
                   }
                } else {
                    throw new Error("You are not authorized to perform this action");
                }
            }),
        );

        /**
         * authorization
         */
        this.app.post(
            "/users/auth",
            responseToPostman(async (req: Request, resp: Response) => {
                // create joi schema
                const schema = Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                });

                // validating req.body
                await schema.validateAsync(req.body);

                // authenticate user
                const user = await userController.auth(req.body.email, req.body.password);
                if(user) {
                    // set the user session
                    // @ts-ignore
                    req.session.user = user;
                    // @ts-ignore
                    req.session.admin = null;
                    return "User authenticated successfully";
                } else {
                    throw new Error("User is not authenticated");
                }
            }),
        );

        // book a ticket
        this.app.post(
            "/users/book",
            responseToPostman(async (req: Request) => {
                // create joi schema
                const schema = Joi.object({
                    cid: Joi.string().required(),
                    mid: Joi.string().required(),
                    seats: Joi.number().min(1).required(),
                });

                // validating req.body
                await schema.validateAsync(req.body);

                // @ts-ignore

                if (req.session && req.session.user ) {
                    let data = {
                        // @ts-ignore
                        userid: req.session.user._id,
                        cid: req.body.cid,
                        mid: req.body.mid,
                        seats: req.body.seats,
                    };

                    return await userController.bookTicket(data);
                } else {
                    throw new Error("You need to login to perform this action");
                }
            }),
        );

        // get all bookings
        this.app.get(
            "/users/bookings",
            responseToPostman(async (req: Request) => {
                // @ts-ignore
                if (req.session && req.session.user) {
                    // @ts-ignore
                    return await userController.getBookings(req.session.user._id);
                } else {
                    throw new Error("You need to login to perform this action");
                }
            }),
        );

        // get ticket confirmation
        this.app.get(
            "/users/ticket/:id",
            responseToPostman(async (req: Request) => {
                // @ts-ignore
                if (req.session && req.session.user ) {
                    // @ts-ignore
                    return await userController.getTicket(req.session.user._id, req.params.id);
                } else {
                    throw new Error("You need to login to perform this action");
                }
            }),
        );

        /**
         * unauthenticated routes
         */
        // fetch all cinemas
        this.app.get(
            "/cinemas",
            responseToPostman(async (req: Request) => {
                return await cinemaController.getCinemas();
            }),
        );

        // fetch all movies
        this.app.get(
            "/movies",
            responseToPostman(async (req: Request) => {
                const schema = Joi.object({
                    page: Joi.number().integer().default(0),
                    limit: Joi.number().integer().default(10),
                    nameOrder: Joi.string().regex(/^[0-1]$/),
                    showTimeOrder: Joi.string().regex(/^[0-1]$/),
                });

                // validate page and limit value
                const data = await schema.validateAsync(req.query);

                // For Ascending order nameOrder = 0, for descending order nameOrder = 1
                //For Ascending order showTimeOrder = 0, for descending order showTimeOrder = 1
                return movieController.findAll(data.page, data.limit, data.nameOrder, data.showTimeOrder);
            }),
        );

        //fetch all cinemas for single movie
        this.app.get(
            '/movie/:movie',
            responseToPostman(async  (req:Request) => {
                const schema = Joi.object({
                    movie: Joi.string().required(),
                });
                const data = await schema.validateAsync(req.params);
                return await cinemaController.getCinemasByMovie(data.movie);
            }),
        );
    }

    /**
     * @info define the default routes
     */

    defRoutes() {
        // check if server running
        this.app.all("/", (req, resp) => {
            resp.status(200).send({ success: true, message: "Server is working" });
        });

        this.app.all("*", (req, resp) => {
            resp.status(404).send({ success: false, message: `given route [${req.method}] ${req.path} not found` });
        });
    }
}
