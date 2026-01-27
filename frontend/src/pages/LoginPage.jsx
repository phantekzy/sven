import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { login } from "../lib/api";
import { ShipWheelIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Link } from "react-router";

/* Login page component */
const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const queryClient = useQueryClient();
    const { mutate: loginMutation, isPending, error } = useMutation({
        mutationFn: login,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] })
    });

    const handleLogin = (e) => {
        e.preventDefault();
        loginMutation(loginData);
    };

    return (
        <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="business">
            <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">

                {/* Login form section */}
                <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
                    <div className="mb-4 flex items-center justify-start gap-2">
                        <ShipWheelIcon className="text-primary size-9" />
                        <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-tr from-primary to-secondary tracking-wider">
                            Sven
                        </span>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error.response?.data?.message || "Something went wrong"}</span>
                        </div>
                    )}

                    <div className="w-full">
                        <form onSubmit={handleLogin}>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold">Navigate Your Learning with Sven</h2>
                                    <p className="text-sm opacity-70">Ready for your next session? Log in to Sven.</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* Email Field */}
                                <div className="form-control w-full space-y-2">
                                    <label className="label">
                                        <span className="label-text">Email</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Ferchouch@gmail.com"
                                        className="input input-bordered w-full"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="form-control w-full space-y-2">
                                    <label className="label">
                                        <span className="label-text">Password</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="input input-bordered w-full pr-10"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/50 hover:text-primary"
                                        >
                                            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="btn btn-primary w-full mt-2" disabled={isPending}>
                                    {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Login"}
                                </button>

                                <div className="text-center mt-2">
                                    <p className="text-sm opacity-80">
                                        Don't have an account?{" "}
                                        <Link to="/signup" className="text-primary hover:underline font-medium">
                                            Create Sven account
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Image section */}
                <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
                    <div className="max-w-md p-8">
                        <div className="relative aspect-square max-w-sm mx-auto">
                            <img src="/3.jfif" alt="Login branding" className="w-full h-full object-cover rounded-lg shadow-2xl" />
                        </div>
                        <div className="text-center space-y-3 mt-6">
                            <h2 className="text-xl font-semibold">Real talk. Real people. Worldwide.</h2>
                            <p className="opacity-70">Bridge the gap between learning and speaking.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
