import { Schema, model } from "mongoose";
import { generate } from "shortid";

export interface IUser {
    _id: string;
    uid: string;
    name: string;
    email: string;
    password: string;
    status: string;
}

const schema = new Schema({
    uid: {
        type: String,
        default: generate,
        index: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "User",
    },
});

export default model<IUser>("users", schema);
