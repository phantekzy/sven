import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { login } from "../lib/api"
import { ShipWheelIcon } from "lucide-react"

/* Login page component */
const LoginPage = () => {
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    })
    const queryClient = useQueryClient()
    const { mutate: loginMutation, isPending, error } = useMutation({
        mutationFn: login,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] })
    })
    const handleLogin = (e) => {
        e.preventDefault()
        loginMutation(loginData)
    }
    return (
        <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 " data-theme="business">
            <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
                {/* Login form section */}
                <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
                    <div className="mb-4 flex items-center justify-start gap-2">
                        <ShipWheelIcon className="text-primary size-9" />
                        <span className="text-3xl font-bold font-mono bg-clip-text text-transparent 
                            bg-gradient-to-tr from-primary to-secondary tracking-wider">
                            Sven
                        </span>
                    </div>

                    {/* Error message display */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error.response.data.message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
/* Export section */
export default LoginPage
