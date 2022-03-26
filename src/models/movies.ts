import { Schema, model } from "mongoose";
import { generate } from "shortid";



export interface IMovies {
    _id: string;
    mid: string;
    name: string
    showTime: Date;
}

const schema = new Schema({
    mid: {
        type: String,
        default: generate,
        index: true,
        unique: true,
    },
    name: {
      type: String,
    },
   showTime:{
        type: Date,
   },
});

export default model<IMovies>("movies", schema);