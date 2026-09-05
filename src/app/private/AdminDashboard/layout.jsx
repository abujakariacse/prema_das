"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutGrid,
    Users,
    BookOpen,
    Flag,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/private/AdminDashboard", key: "overview", label: "Overview", icon: LayoutGrid },
    { href: "/private/AdminDashboard/ManageUsers", key: "manage-users", label: "Manage Users", icon: Users },
    { href: "/private/AdminDashboard/ManageRecipes", key: "manage-recipes", label: "Manage Recipes", icon: BookOpen },
    { href: "/private/AdminDashboard/Reports", key: "reports", label: "Reports", icon: Flag },
];

// Backend base URL — set NEXT_PUBLIC_API_URL in your .env.local
// e.g. NEXT_PUBLIC_API_URL=http://localhost:5000
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    // Fetch the logged-in user's info once — shared across every admin page
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

                // ---- ROLE CHECK ----
                // Only admins are allowed inside this layout.
                // Anyone else gets redirected away before seeing any admin content.
                if (data.user?.role !== "admin") {
                    router.push("/"); // redirect non-admins to Home
                    return;
                }

                if (isMounted) {
                    setUser(data.user);
                }
            } catch (err) {
                console.error(err);
                router.push("/");
            } finally {
                if (isMounted) setUserLoading(false);
            }
        }

        fetchUser();
        return () => {
            isMounted = false;
        };
    }, [router]);

    // While we don't yet know the role, don't render any admin content.
    // This prevents a flash of admin UI for non-admin users.
    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-[13.5px] text-[#4A3B2C]/60">Loading...</p>
            </div>
        );
    }

    // If redirect kicked in, user will be null — render nothing while router.push happens.
    if (!user) {
        return null;
    }

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
                                        {user?.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            user?.name?.charAt(0)?.toUpperCase() || "A"
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[14.5px] font-semibold text-[#2B2118] truncate">
                                            {user?.name || "Admin"}
                                        </p>
                                        <p className="text-[12.5px] text-[#4A3B2C]/60 truncate">
                                            {user?.email || ""}
                                        </p>
                                    </div>
                                </div>
                                {/* Admin badge */}
                                <span className="inline-block mt-2 text-[10.5px] font-semibold tracking-wide uppercase text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                                    Admin
                                </span>
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
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main content — this is where each admin page's content renders */}
                    <main className="flex-1 min-w-0">{children}</main>
                </div>
            </div>
        </div>
    );
}