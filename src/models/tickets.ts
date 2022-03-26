import { Schema, model } from "mongoose";
import { generate } from "shortid";
import {IUser} from "./users";
import {IMovies} from "./movies";
import {ICinema} from "./cinemas";


export interface ITickets {
    _id : string;
    tid : string;
    seats : number,
    cinema : ICinema | string;
    movie : IMovies | string;
    user : IUser | string;
}

const schema = new Schema({
    tid: {
        type: String,
        default: generate,
        index: true,
        unique: true,
    },
    seats: {
      type: Number,
    },
    cinema: {
        type: Schema.Types.ObjectId,
        ref: "cinemas",
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

export default model<ITickets>("tickets", schema);