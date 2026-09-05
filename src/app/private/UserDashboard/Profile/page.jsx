"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

// Backend base URL — set NEXT_PUBLIC_API_URL in your .env.local
// e.g. NEXT_PUBLIC_API_URL=http://localhost:5000
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    // Fetch the logged-in user's info on mount
    useEffect(() => {
        let isMounted = true;

        async function fetchUser() {
            try {
                const res = await fetch(`${API_URL}/api/me`, {
                    method: "GET",
                    credentials: "include", // sends the httpOnly token cookie
                });

                if (res.status === 401) {
                    // not logged in / token expired — send to login
                    router.push("/login");
                    return;
                }

                if (!res.ok) {
                    throw new Error("Failed to load profile");
                }

                const data = await res.json();
                if (isMounted) {
                    setUser(data.user);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) {
                    setLoadError("Couldn't load your profile. Please refresh the page.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchUser();
        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleSignOut = async () => {
        setLogoutError("");
        setLoggingOut(true);
        try {
            const res = await fetch(`${API_URL}/api/logout`, {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Logout failed");
            }

            router.push("/"); // change to your actual login route if different
            router.refresh();
        } catch (err) {
            console.error(err);
            setLogoutError("Couldn't sign out. Please try again.");
            setLoggingOut(false);
        }
    };

    return (
        <div>
            <div className="mb-7">
                <p className="text-[12.5px] font-semibold tracking-wide text-green-700 uppercase mb-1.5">
                    User Dashboard
                </p>
                <h1 className="text-[26px] font-bold text-[#2B2118]">Profile</h1>
            </div>

            <div className="rounded-2xl border border-[#E5D9BE] bg-white px-6 py-6 max-w-md">
                {loading ? (
                    <div className="flex items-center gap-2 text-[13.5px] text-[#4A3B2C]/60 py-4">
                        <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
                        Loading profile...
                    </div>
                ) : loadError ? (
                    <p className="text-[13px] text-red-600">{loadError}</p>
                ) : (
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-[#2B2118] text-white flex items-center justify-center text-[16px] font-semibold shrink-0 overflow-hidden">
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.name?.charAt(0)?.toUpperCase() || "U"
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[14.5px] font-semibold text-[#2B2118] truncate">
                                {user?.name}
                            </p>
                            <p className="text-[12.5px] text-[#4A3B2C]/60 truncate">
                                {user?.email}
                            </p>
                            {user?.role === "admin" && (
                                <span className="inline-block mt-1 text-[10.5px] font-semibold uppercase tracking-wide text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="h-px bg-[#E5D9BE] mb-5" />

                <button
                    onClick={handleSignOut}
                    disabled={loggingOut}
                    className="flex items-center justify-center gap-2 w-full text-[13.5px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 hover:bg-red-100 hover:border-red-300 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loggingOut ? (
                        <>
                            <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
                            Signing out...
                        </>
                    ) : (
                        <>
                            <LogOut size={16} strokeWidth={2.25} />
                            Sign Out
                        </>
                    )}
                </button>

                {logoutError && (
                    <p className="text-[12.5px] text-red-600 mt-3 text-center">{logoutError}</p>
                )}
            </div>
        </div>
    );
}