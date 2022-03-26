import { Schema, model } from "mongoose";
import { generate } from "shortid";

export interface IAdmin {
    _id: string;
    aid: string;
    email: string;
    password: string;
    status: string;
}

const schema = new Schema({
    aid: {
        type: String,
        default: generate,
        index: true,
        unique: true,
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
        default: "Admin",
    },
});

export default model<IAdmin>("admins", schema);
