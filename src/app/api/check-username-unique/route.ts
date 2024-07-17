import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User.model";
import { z } from 'zod'
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernmaeQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        //validate with zod
        const result = UsernmaeQuerySchema.safeParse(queryParam)
        console.log(result)

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid Query Parameters",
            }, { status: 400 })
        }

        const { username } = result.data
        const existingVerifiedUser = await UserModel.findOne({
            username, isVerified: true
        })

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "Username already exists",
            }, { status: 400 })
        }

        return Response.json({
            success: true,
            message: "Username is available",
        }, { status: 200 })

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