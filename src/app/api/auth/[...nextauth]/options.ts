import { NextAuthOptions } from "next-auth";
import bcrypt from 'bcryptjs'
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User.model";
import { promises } from "dns";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials: any): Promise<any> {
                try {
                    await dbConnect();
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.idendifier },
                            { username: credentials.identifier }
                        ]
                    });
                    if (!user) {
                        throw new Error('No user found')
                    }
                    if (!user.isVerified) {
                        throw new Error('User not verified')
                    }
                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    if (isPasswordCorrect) {
                        return user;
                    }
                } catch (error: any) {
                    throw new Error(error)
                }
            }
        })
    ]
}



