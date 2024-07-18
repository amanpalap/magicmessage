import dbConnect from "@/lib/dbconnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User.model";
import { User } from "next-auth";
import mongoose from "mongoose";
import { group } from "console";

export async function GET(request: Request) {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = await session?.user as User

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated",
            },
            {
                status: 401,
            }
        )
    }

    const userId = new mongoose.Types.ObjectId(user._id)
    try {
        const user = await UserModel.aggregate([
            { $match: { id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$id', messages: { $push: '$messages' } } }
        ])

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 401,
                }
            )
        }
        return Response.json(
            {
                success: true,
                messages: user[0].messages,
            },
            {
                status: 401,
            }
        )

    } catch (error) {
        console.log("Aggregation error", error)
        return Response.json(
            {
                success: false,
                message: "Aggregation Failed",
            },
            {
                status: 500,
            }
        )
    }
}