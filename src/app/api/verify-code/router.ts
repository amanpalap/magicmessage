import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User.model";
import { date } from "zod";


export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, code } = await request.json()

        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({ username: decodedUsername })
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 500 }
            )
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()
            return Response.json(
                {
                    success: true,
                    message: "verified successfully"
                },
                { status: 200 }
            )
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Code Expired Please sign-up again"
                },
                { status: 500 }
            )
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Code is Incorrect"
                },
                { status: 500 }
            )
        }

    } catch (error) {
        console.log("Error checking username", error)
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            { status: 500 }
        )
    }
}