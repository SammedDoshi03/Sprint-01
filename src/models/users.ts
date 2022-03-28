import {Schema, model} from "mongoose"
import {generate} from "shortid"
import { EmitAndSemanticDiagnosticsBuilderProgram } from "typescript";


export interface IUser {
    _id: string;
    uid: string;
    name: string;
    email: string;
    password: string;
}

const schema = new Schema({
    uid:{
        type:String,
        unique:true,
        default: generate,
        index: true
    },
    name:{
        type: String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        index:true,
        required: true
    },
    password:{
        type:String,
        required:true
    }
})
// class admin{
// const admin = [
//     { id: 1, username: 'admin', password: 'admin', role: 'Admin' },]}

export default model<IUser>("users",schema)
