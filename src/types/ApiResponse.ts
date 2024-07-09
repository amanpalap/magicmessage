import { Message } from "@/model/User.model";

export interface ApiResponse {
    success: boolean,
    message: string,
    isAcceptingmessage?: boolean
    messages?: Message 
}