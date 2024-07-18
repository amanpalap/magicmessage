import dbConnect from "@/lib/dbconnect";
import UserModel, { Message } from "@/model/User.model";

export async function POST(request: Request) {
    await dbConnect()
    const { username, content } = await request.json()

    try {
        const user = await UserModel.findOne({ username })
        if (!user) {
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

        //is user accepting messages
        if (!user.isAcceptingMessage) {
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages",
                },
                {
                    status: 403,
                }
            )
        }

        const newMessage = { content, createdAt: new Date() }
        user.messages.push(newMessage as Message)
        await user.save()


        return Response.json(
            {
                success: true,
                message: "Message sent successfully",
            },
            {
                status: 401,
            }
        )

    } catch (error) {
        console.log("failed to send messages", error)
        return Response.json(
            {
                success: false,
                message: "Something went wrong",
            },
            {
                status: 500,
            }
        )
    }
}