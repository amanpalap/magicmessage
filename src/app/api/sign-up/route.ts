import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User.model";
import bcryptjs from 'bcryptjs'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, email, password } = await request.json()
        const existingUserVerifiedByEmail = await UserModel.findOne({
            email,
            isVerified: true
        })

        if (existingUserVerifiedByEmail) {
            return Response.json(
                {
                    success: false,
                    message: "User already exists"
                },
                {
                    status: 400
                })
        }

        const existingUserByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random() * 9000000).toString()

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json(
                    {
                        success: true,
                        message: "User already exists with this email"
                    },
                    {
                        status: 201
                    })
            } else {
                const hashedPassword = await bcryptjs.hash(password, 10)
                existingUserByEmail.password = hashedPassword
                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
            }

        } else {
            const hashedPassword = await bcryptjs.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
        }

        //Send Verification Email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if (!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: "Failed to send verification email"
                },
                {
                    status: 500
                })
        }

        return Response.json(
            {
                success: true,
                message: "User Registered successfully Please verify your email"
            },
            {
                status: 201
            })

    } catch (error) {
        console.log("Error registering user")
        return Response.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        )
    }
}