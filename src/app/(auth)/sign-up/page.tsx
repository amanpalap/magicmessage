'use client'
import * as z from "zod"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from 'axios'
import { useForm } from "react-hook-form"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { signUpSchema } from "@/schemas/signUpSchema"
import { set } from "mongoose"
import { ApiResponse } from "@/types/ApiResponse"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function Component() {
    const { toast } = useToast()
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [isCheckUsername, setIsCheckingUsername] = useState(false)
    const [usernameMessage, setUsernameMessage] = useState('')
    const [issubmitting, setIsSubmitting] = useState(false)
    const debounced = useDebounceCallback(setUsername, 300)

    //Zod implementation

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        }
    })

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (username) {
                setIsCheckingUsername(true)
            }
            setUsernameMessage('')
            try {
                const response = await axios.get(`/api/check-username-unique?username=${username}`)

                setUsernameMessage(response.data.message)
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
            } finally {
                setIsCheckingUsername(false)
            }
        }
        checkUsernameUnique()
    }, [username])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data)
            toast({
                title: 'Success',
                description: response.data.message,
            })
            router.replace(`/verify/${username}`)
            setIsSubmitting(false)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message
            toast({
                title: 'Success',
                description: errorMessage,
                variant: "destructive"
            })
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Welcome Back to True Feedback
                    </h1>
                    <p className="mb-4">Sign in to continue your secret conversations</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Username" {...field}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                debounced(e.target.value)
                                            }}
                                        />
                                    </FormControl>
                                    {isCheckUsername && <Loader2 className="animate-spin" />}
                                    <p className={`text-xs ${usernameMessage === "Username is available" ? "text-green-500" : "text-red-500"}`}>
                                        {usernameMessage}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="email" {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="password" {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={issubmitting}>
                            {
                                issubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Signup"
                            }
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>
                        Not a member yet?{' '}
                        <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div >
    )

}