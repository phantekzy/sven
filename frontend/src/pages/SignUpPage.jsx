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
        <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:-p-8" data-theme="garden">
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

                    <div className="w-full">
                        <form onSubmit={handleSignup}>
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold">Create Sven Account</h2>
                                    <p className="text-sm opacity-70">Join Sven and start learning the language you want !</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">Full Name</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ferchechou"
                                            className="input input-bordered w-full"
                                            value={signupData.fullName}
                                            onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">Email</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="Ferchechou@gmail.com"
                                            className="input input-bordered w-full"
                                            value={signupData.email}
                                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Sven Password"
                                            className="input input-bordered w-full"
                                            value={signupData.password}
                                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                            required
                                        />
                                        <p className="text-xs opacity-70 mt-1">
                                            Password must be at least 6 characters long
                                        </p>
                                    </div>


                                </div>
                            </div>
                        </form>
                    </div>

                </div>

            </div>
        </div>
    )
}
/* Export section */
export default SignUpPage
