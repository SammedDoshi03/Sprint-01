/**
 * @info schema for movies
 */

 import { Schema, model } from "mongoose";

 export interface IMovies {
     _id: string;
     name: string;
     showTime: Date;
 }
 
 const schema = new Schema({
     name: {
         type: String,
         required: true,
         index: true,
     },
     showTime: {
         type: Date,
         required: true,
         index: true,
     },
 });
 
 export default model<IMovies>("movies", schema);