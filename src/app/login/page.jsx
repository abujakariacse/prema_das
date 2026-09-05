"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirectTo = searchParams.get("redirect");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Decide where to send the user after a successful login.
    // - Admins always land in AdminDashboard (unless the intended route
    //   they were trying to reach was already an admin route).
    // - Normal users always land in UserDashboard (unless the intended
    //   route they were trying to reach was already a user route).
    // - Any non-dashboard intended route (e.g. a recipe details page)
    //   is respected as-is for both roles.
    const getPostLoginRoute = (role) => {
        const adminHome = "/private/AdminDashboard";
        const userHome = "/private/UserDashboard";

        if (redirectTo) {
            const isAdminRoute = redirectTo.startsWith("/private/AdminDashboard");
            const isUserRoute = redirectTo.startsWith("/private/UserDashboard");

            // If the intended route belongs to the other role's dashboard,
            // don't honor it — send them to their own dashboard instead.
            if (isAdminRoute && role !== "admin") {
                return userHome;
            }
            if (isUserRoute && role === "admin") {
                return adminHome;
            }

            // Otherwise the intended route is safe to honor
            // (matches their role's dashboard, or isn't a dashboard route at all).
            return redirectTo;
        }

        // No intended route — default per role
        return role === "admin" ? adminHome : userHome;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.password) {
            setError("Please enter both email and password.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // httpOnly cookie পাঠানো/গ্রহণ করার জন্য বাধ্যতামূলক
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Login failed. Please try again.");
                setError(data.error || "Login failed. Please try again.");
                setLoading(false);
                return;
            }

            toast.success("Login successful!");

            const destination = getPostLoginRoute(data.user?.role);
            router.push(destination);
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    // Called by the GoogleLogin component with a credential (Google ID token)
    const handleGoogleSuccess = async (credentialResponse) => {
        setError("");
        setLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ credential: credentialResponse.credential }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Google login failed. Please try again.");
                setError(data.error || "Google login failed. Please try again.");
                setLoading(false);
                return;
            }

            toast.success("Login successful!");

            const destination = getPostLoginRoute(data.user?.role);
            router.push(destination);
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error("Google login failed. Please try again.");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Login
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Welcome back — enter your details to continue.
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <a
                                    href="/forgot-password"
                                    className="text-xs font-medium text-gray-500 hover:text-gray-900 transition"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-gray-900 text-white text-sm font-medium py-2.5 mt-2 hover:bg-gray-800 active:bg-gray-950 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-400">OR</span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* Google login — real Google-rendered button (required so we get a verifiable ID token) */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            width="100%"
                            text="continue_with"
                            shape="rectangular"
                        />
                    </div>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="font-medium text-gray-900 hover:underline">

                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}