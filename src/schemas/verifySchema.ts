import {z} from 'zod'

export const verifySchema = z.object({
    code: z.string().length(6, "Verification code must be six digit long")

})

export const signInSchema = z.object({
    identifier: z.string(),
    password: z.string()
    
})