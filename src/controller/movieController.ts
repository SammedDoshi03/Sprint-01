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
    static async findAll(page: number, limit: number, byName, byShowTime): Promise<IMovies[]> {
        //to get regional date time value
        let date = new Date()
        let userTimezoneOffset = date.getTimezoneOffset() * 60000;
        let m= new Date(date.getTime() - userTimezoneOffset);
        let bn, bs;

        if(byShowTime == 0 || isNaN(byShowTime))  bs=1;
        else bs=-1;
        if(byName == 0 || isNaN(byName))  bn=1;
        else bn=-1;

        const mov= await movies.aggregate([
            {  //@ts-ignore
                $sort: {showTime: +bs, name: +bn},
            },
            {
                $skip: page * limit,
            },
            {
                $limit: limit,
            },
            {
                $match:
                    {showTime: {$gte: m}},
            }
        ]).exec();
        //for ascending order by name
        if(byName == 0 && isNaN(byShowTime))
        {   mov.sort((a, b) => {
            let fa = a.name.toLowerCase(), fb = b.name.toLowerCase();
            if (fa < fb) return -1;
            if (fa > fb) return 1;
            return 0;
        });
        }
        //for descending order by name
        else if(byName == 1 && isNaN(byShowTime))
        {   mov.sort((a, b) => {
            let fa = a.name.toLowerCase(), fb = b.name.toLowerCase();
            if (fa < fb) return 1;
            if (fa > fb) return -1;
            return 0;
        });
        }
        return mov;
    }
}