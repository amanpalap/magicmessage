import {z} from 'zod'

export const usernameValidation = z
    .string()
    .min(4, "Username must be atleast of 4 characters")
    .max(20, "Username must leass then 20 characters") 
    .regex(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers")

export const signUpSchema =z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password atleast be of 6 characters"})
})