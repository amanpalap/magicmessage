import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmails";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail (
    email: string,
    username: string,
    verifycode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: "Magic Message | Verification Code",
            react: VerificationEmail({username, otp: verifycode})
        })
        
        return{success: true, message: "Failed to send Verification email"}
    } catch (emailError) {
        
        console.log("Failed to send Verification email")
        return{success: true, message: "Failed to send Verification email"}
    }
}