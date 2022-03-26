import { Schema, model } from "mongoose";
import { generate } from "shortid";
import {IUser} from "./users";
import {IMovies} from "./movies";
import {ICinema} from "./cinemas";
import {ITickets} from "./tickets";

export interface IBooked {
    _id : string;
    bid : string;
    cinema : ICinema | string;
    ticket : ITickets | String;
    movie : IMovies | string;
    user : IUser | string;
}

const schema = new Schema({
    bid: {
        type: String,
        default: generate,
        index: true,
        unique: true,
    },
    cinema: {
        type: Schema.Types.ObjectId,
        ref: "cinemas",
        required: true,
    },
    ticket: {
        type: Schema.Types.ObjectId,
        ref: "tickets",
        required: true,
    },
    movie:{
        type: Schema.Types.ObjectId,
        ref: "movies",
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
});

export default model<IBooked>("booked", schema);