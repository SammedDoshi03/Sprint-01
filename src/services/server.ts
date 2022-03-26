/**
 * @info the main entry point of express server
 */

import express, { Request, Response } from "express";

import bodyParser from "body-parser";
import responseToPostman from "../middleware/responseToPostman";

import Log from "../config/log";
import expressLog from "../middleware/expressLog";




import Joi from "joi";
import   morgan  from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";

import userController from "../controller/userController";
import adminController from "../controller/adminController";
import cinemaController from "../controller/cinemaController";
import movieController from "../controller/movieController";


export default class Server{
    app = express();

    async start(){
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
    middleware(){
        this.app.use(morgan("combined"));
        this.app.use(expressLog);
        this.app.use(bodyParser.urlencoded({ extended: false }));

        this.app.use(
            session({
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
                store: new MongoStore({
                    mongoUrl: process.env.SESSION_MONGODB_URL,
                    collectionName: "sessions"
                }),
                cookie: {
                    maxAge: 7 * 24 * 60 * 60 * 1000
                },
            }),
        );
    }


    /**
     * @info define all routes
     */

    routes() {
        this.app.get("/",
            ( req: Request, res: Response) => {
                console.log("GET /");
                res.send("Hello world");
                }
            );


        /**
         * @info admin routes
         */

        // create admin temporary
        this.app.post("/admin/create",
            responseToPostman(async  (req: Request) => {
            console.log("create admin");
                return adminController.createUser(req.body);
              })
        );

        this.app.post(
            "/admin/auth",
            responseToPostman(async (req: Request) => {
                // create joi schema
                const schema = Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().required()
                });

                // validating req.body
                await schema.validateAsync(req.body);

                const admin =  await  adminController.auth(req.body.email, req.body.password);

                // set the admin session
                // @ts-ignore
                req.session.admin = admin;
                return admin;
            }),
        );

        //Add cinema
        this.app.post(
            "/admin/addCinema",
            responseToPostman(async (req: Request) => {
                // create joi schema
                const schema = Joi.object({
                    movie: Joi.string().required(),
                    name: Joi.string().required(),
                    location: Joi.string().required(),
                    seatsAvailable: Joi.number().required()
                });

                // validating req.body
                await schema.validateAsync(req.body);

                // @ts-ignore
                if(req.session && req.session.admin && req.session.admin.status === "Admin"){
                        return await adminController.addCinema(req.body);
                }
                else{
                    throw new Error("You are not authorized to perform this action");
                }
            }),
        );

        //Add movie
        this.app.post(
            "/admin/addMovie",
            responseToPostman(async (req: Request) => {
                // create joi schema
                const schema = Joi.object({
                    // mid: Joi.string().required(),
                    name:Joi.string().required(),
                    showTime: Joi.date().required(),
                });

                // validating req.body
                await schema.validateAsync(req.body);

                // @ts-ignore
                if(req.session && req.session.admin && req.session.admin.status === "Admin"){
                        return await adminController.addMovie(req.body);
                }
                else{
                    throw new Error("You are not authorized to perform this action");
                }
            }),
        );

        /**
         * @info user routes
          */

        // Creating a new user
        this.app.post(
            "/users/create",
            responseToPostman(async (req: Request) => {

                // create joi schema
                const schema = Joi.object({
                    name: Joi.string().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                    status: Joi.string().default("User")
                });

                // validating req.body
                await schema.validateAsync(req.body);
                // creating user
                return await userController.createUser(req.body);
            }),
        );

        // Authenticating a user
        this.app.post(
            "/users/auth",
            responseToPostman(async (req: Request) => {
                // create joi schema
                const schema = Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().required()
                });

                // validating req.body
                await schema.validateAsync(req.body);

                // authenticating user
                 const  user = await userController.auth(req.body.email, req.body.password);

                // set the user session
                // @ts-ignore
                req.session.user = user;

                return user;
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
                    showTime: Joi.date().required(),
                    seats: Joi.number().required()
                });

                // validating req.body
                await schema.validateAsync(req.body);

                // @ts-ignore

                if (req.session && req.session.user && req.session.user.status === "User") {
                   let data = {
                        // @ts-ignore
                        userid: req.session.user._id,
                        cid: req.body.cid,
                        mid: req.body.mid,
                        showTime: req.body.showTime,
                        seats: req.body.seats
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
                if (req.session && req.session.user && req.session.user.status === "User") {
                    // @ts-ignore
                    return await userController.getBookings(req.session.user._id);
                } else {
                    throw new Error("You need to login to perform this action");
                }
            }),
        );

        /**
         * unauthenticated routes
         */
        // get all cinemas
        this.app.get(
            "/cinemas",
            responseToPostman(async (req: Request) => {
                return await cinemaController.getCinemas();
            }),
        );

        this.app.get(
            "/movies",
            responseToPostman(async (req: Request) => {
                return await movieController.getAllMovies();
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
