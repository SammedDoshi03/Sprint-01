import tickets, {ITickets} from "../models/tickets";

export default class ticketController{

    // Get all tickets
     static async getAllTickets(): Promise<ITickets[]>{
            return tickets.find();
    }
}