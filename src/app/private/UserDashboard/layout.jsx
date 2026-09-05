"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutGrid,
    BookOpen,
    CirclePlus,
    Heart,
    ShoppingBag,
    User,
    Sparkles,
    ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/private/UserDashboard", key: "overview", label: "Overview", icon: LayoutGrid },
    { href: "/private/UserDashboard/MyRecipe", key: "my-recipes", label: "My Recipes", icon: BookOpen },
    { href: "/private/UserDashboard/AddRecipe", key: "add-recipe", label: "Add Recipe", icon: CirclePlus },
    { href: "/private/UserDashboard/Favorites", key: "favorites", label: "My Favorites", icon: Heart },
    { href: "/private/UserDashboard/Purchased", key: "purchased", label: "My Purchased Recipes", icon: ShoppingBag },
    { href: "/private/UserDashboard/Profile", key: "profile", label: "Profile", icon: User },
];

const RECIPE_LIMIT = 2;
const RECIPES_USED = 1; // placeholder, wire up later

// Backend base URL — set NEXT_PUBLIC_API_URL in your .env.local
// e.g. NEXT_PUBLIC_API_URL=http://localhost:5000
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UserDashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    // Fetch the logged-in user's info once — shared across every dashboard page
    useEffect(() => {
        let isMounted = true;

        async function fetchUser() {
            try {
                const res = await fetch(`${API_URL}/api/me`, {
                    method: "GET",
                    credentials: "include", // sends the httpOnly token cookie
                });

                if (res.status === 401) {
                    router.push("/login");
                    return;
                }

                if (!res.ok) {
                    throw new Error("Failed to load user");
                }

                const data = await res.json();
                if (isMounted) {
                    setUser(data.user);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setUserLoading(false);
            }
        }

        fetchUser();
        return () => {
            isMounted = false;
        };
    }, [router]);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-[268px] shrink-0">
                        <div className="md:sticky md:top-6 rounded-2xl border border-[#E5D9BE] bg-white overflow-hidden">
                            {/* Mini profile header */}
                            <div className="px-5 pt-6 pb-5 border-b border-[#E5D9BE]/80">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-[#2B2118] text-white flex items-center justify-center text-[15px] font-semibold shrink-0 overflow-hidden">
                                        {userLoading ? (
                                            ""
                                        ) : user?.image ? (
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
                                            {userLoading ? "Loading..." : user?.name || "User"}
                                        </p>
                                        <p className="text-[12.5px] text-[#4A3B2C]/60 truncate">
                                            {userLoading ? "" : user?.email || ""}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Nav */}
                            <nav className="px-3 py-3 flex flex-col gap-1">
                                {NAV_ITEMS.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors duration-150 text-left ${isActive
                                                ? "bg-[#F0EADA] text-[#2B2118]"
                                                : "text-[#4A3B2C]/75 hover:bg-[#F7F3E9] hover:text-[#2B2118]"
                                                }`}
                                        >
                                            <span
                                                className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-green-600 transition-opacity duration-150 ${isActive ? "opacity-100" : "opacity-0"
                                                    }`}
                                            />
                                            <Icon
                                                size={17}
                                                strokeWidth={2}
                                                className={isActive ? "text-green-700" : "text-[#4A3B2C]/50 group-hover:text-[#4A3B2C]/80"}
                                            />
                                            <span className="flex-1">{item.label}</span>

                                            {item.key === "add-recipe" && (
                                                <span className="flex items-center gap-[3px] shrink-0">
                                                    {Array.from({ length: RECIPE_LIMIT }).map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`w-[6px] h-[6px] rounded-full ${i < RECIPES_USED ? "bg-green-600" : "bg-[#E5D9BE]"
                                                                }`}
                                                        />
                                                    ))}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Recipe quota note */}
                            <div className="px-4 pb-4 pt-1">
                                <p className="text-[11.5px] leading-relaxed text-[#4A3B2C]/60 px-1">
                                    A normal user can add {RECIPE_LIMIT} recipes ({RECIPES_USED}/{RECIPE_LIMIT} used).
                                </p>
                            </div>

                            {/* Premium upsell card */}
                            <div className="mx-4 mb-5 rounded-xl bg-[#2B2118] p-4 relative overflow-hidden">
                                <Sparkles
                                    size={70}
                                    strokeWidth={1}
                                    className="absolute -right-4 -bottom-4 text-white/[0.06]"
                                />
                                <p className="text-[13px] font-semibold text-white mb-1 relative">
                                    Go Premium
                                </p>
                                <p className="text-[11.5px] text-white/60 leading-relaxed mb-3 relative">
                                    Unlock unlimited recipe uploads and more.
                                </p>
                                <button className="relative flex items-center gap-1 text-[12px] font-semibold text-[#2B2118] bg-white rounded-lg px-3 py-1.5 hover:bg-white/90 transition-colors duration-150">
                                    Check this
                                    <ChevronRight size={13} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main content — this is where each page's content renders */}
                    <main className="flex-1 min-w-0">{children}</main>
                </div>
            </div>
        </div>
    );
}