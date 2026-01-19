import { ShipWheelIcon } from "lucide-react"
import { useState } from "react"

/* Signup component */
const SignUpPage = () => {
    const [signupData, setSignupData] = useState({
        fullName: "",
        email: "",
        password: "",
    })

    const handleSignup = (e) => {
        e.preventDefault()

    }
    return (
        <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:-p-8" data-theme="coffee">
            <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100
                rounded-xl shadow-lg overflow-hidden">
                {/* LEFT SIDE */}
                <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
                    {/* LOGO */}
                    <div className="mb-4 flex items-center justify-start gap-2 ">
                        <ShipWheelIcon className="size-9 text-primary" />
                        <span className="text-3xl font-bold font-mono bg-clip-text text-transparent
                            bg-gradient-to-r from-primary to-secondary tracking-wider">
                            Sven
                        </span>
                    </div>
                </div>

            </div>
        </div>
    )
}
/* Export section */
export default SignUpPage
