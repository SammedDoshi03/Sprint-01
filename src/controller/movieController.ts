/**
 * @info perform CRUD on movies
 */
import movies, { IMovies } from "../models/movies";


export default class movieController {
    /**
     * creating a new movie
     * @param body
     */
    static async create(body: any): Promise<IMovies> {
        const data = {
            name: body.name,
            showTime: new Date(body.showTime),
        }
        return movies.create(data);
    }

    /**
     * find movies by both name and showOrder
     * @param page - the page number (starting from 0)
     * @param limit - no of documents to be returned per page
     * @param byName - to get movie in ordered list by name
     * @param byShowTime - to get movie in ordered list by showtime
     * @param option - option number
     */
    static async findAll(page: number, limit: number, byName: number, byShowTime: number, option: number): Promise<IMovies[]> {
        let m = new Date();
        let bn,bs;
        if(option==1)
        {   console.log("Option 1");
            if(byName==0) bn=1;
            else bn=-1;

            return movies.
            aggregate([
                {  //@ts-ignore
                    $sort: {name:+bn},
                },
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                {
                    $match:
                        {showTime: { $gte : m}},
                }
            ])
                .exec();

        }
        else if(option === 2){
            console.log("Option 2");
            if(byShowTime === 0) bs=1;
            else bs=-1;

            return movies.
            aggregate([
                {  //@ts-ignore
                    $sort: {showTime:+bs},
                },
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                {
                    $match:
                        {showTime: { $gte : m}},
                }
            ])
                .exec();
        }

        else if (option === 3)
        {
            console.log("Option 3")
            if ( byShowTime===0 && byName===0 ) {bs=1;bn=1;}
            else if(byShowTime===0 && byName===1) {bs=1;bn=-1;}
            else if(byShowTime===1 && byName===0) {bs=-1;bn=1;}
            else {bs=-1;bn=-1;}

            return movies.
            aggregate([
                {  //@ts-ignore
                    $sort: {showTime:+bs,name:+bn},
                },
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                {
                    $match:
                        {showTime: { $gte : m}},
                }
            ])
                .exec();
        }
        else{
            console.log("Option 4")
            return movies.
            aggregate([
                {  //@ts-ignore
                    $sort: {showTime:1,name:1},
                },
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                {
                    $match:
                        {showTime: { $gte : m}},
                }
            ])
                .exec();
        }
    }
}