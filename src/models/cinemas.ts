import { Schema, model } from "mongoose";
import { generate } from "shortid";
import {IMovies} from "./movies";


export interface ICinema {
    _id: string;
    cid: string;
    name: string;
    location: string;
    seatsAvailable: number;
    movie : IMovies | string;
}

const schema = new Schema({
    cid: {
        type: String,
        default: generate,
        index: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    seatsAvailable: {
        type: Number,
        required: true,
    },
    movie:{
        type: Schema.Types.ObjectId,
        ref: "movies",
        required: true,
    },
});

export default model<ICinema>("cinemas", schema);