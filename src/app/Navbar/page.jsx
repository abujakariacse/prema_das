"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ChevronDown, LogOut, LayoutGrid, User as UserIcon } from "lucide-react";
import ThemeToggle from "../ThemeToggle/page";


const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/BrowseRecipe", label: "Browse Recipes" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const profileRef = useRef(null);

    // পেজ লোড হওয়ার সাথে সাথে বর্তমান ইউজার কে জানা আছে কিনা চেক করা (cookie দিয়ে)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
                    method: "GET",
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setAuthLoading(false);
            }
        };

        fetchUser();
    }, [pathname]); // route বদলালে আবার চেক করবে (যেমন login/register এর পর)

    // profile dropdown এর বাইরে ক্লিক করলে বন্ধ হয়ে যাবে
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
                method: "POST",
                credentials: "include",
            });
            setUser(null);
            setProfileOpen(false);
            toast.success("Logged out successfully");
            router.push("/");
        } catch (err) {
            toast.error("Failed to log out. Please try again.");
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-[#0a0a0a] backdrop-blur-md border-b border-[#E5D9BE] dark:border-white/10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between h-[68px]">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <Image
                            src="/Logo.png"
                            alt="RecipeHub logo"
                            width={250}
                            height={250}
                            className="object-contain"
                            priority
                        />

                    </Link>

                    {/* Desktop links */}
                    <nav className="hidden md:flex items-center gap-9">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative text-[14.5px] font-medium transition-colors duration-150 ${isActive
                                        ? "text-[#2B2118] dark:text-[#ededed]"
                                        : "text-[#4A3B2C]/70 dark:text-[#ededed]/60 hover:text-[#2B2118] dark:hover:text-[#ededed]"
                                        }`}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-green-700 dark:bg-green-500 rounded-full" />
                                    )}
                                </Link>
                            );
                        })}

                        {user && (
                            <Link
                                href={user.role === "admin" ? "/private/AdminDashboard" : "/private/UserDashboard"}
                                className={`relative text-[14.5px] font-medium transition-colors duration-150 ${pathname === "/dashboard"
                                    ? "text-[#2B2118] dark:text-[#ededed]"
                                    : "text-[#4A3B2C]/70 dark:text-[#ededed]/60 hover:text-[#2B2118] dark:hover:text-[#ededed]"
                                    }`}
                            >
                                Dashboard
                                {pathname === "/dashboard" && (
                                    <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-green-700 dark:bg-green-500 rounded-full" />
                                )}
                            </Link>
                        )}
                    </nav>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />

                        {authLoading ? (
                            // লোড হওয়ার সময় flash এড়াতে ছোট placeholder
                            <div className="w-[110px] h-9 rounded-full bg-gray-100 dark:bg-white/10 animate-pulse" />
                        ) : user ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen((o) => !o)}
                                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border border-[#2B2118]/15 dark:border-white/15 hover:bg-[#2B2118]/5 dark:hover:bg-white/10 transition-colors duration-150 cursor-pointer"
                                    aria-expanded={profileOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0">
                                        {user.image ? (
                                            <Image
                                                src={user.image}
                                                alt={user.name || "User avatar"}
                                                width={28}
                                                height={28}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-300">
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[13.5px] font-medium text-[#2B2118] dark:text-[#ededed] max-w-[120px] truncate">
                                        {user.name}
                                    </span>
                                    <ChevronDown
                                        size={14}
                                        className={`text-[#4A3B2C]/60 dark:text-[#ededed]/60 transition-transform duration-200 ${
                                            profileOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#171717] rounded-2xl shadow-xl border border-[#E5D9BE] dark:border-white/10 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 py-2.5 border-b border-[#E5D9BE]/60 dark:border-white/10">
                                            <p className="text-[13.5px] font-semibold text-[#2B2118] dark:text-[#ededed] truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-[11.5px] text-[#4A3B2C]/60 dark:text-[#ededed]/50 truncate">
                                                {user.email}
                                            </p>
                                            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400">
                                                {user.role || "User"}
                                            </span>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href={user.role === "admin" ? "/private/AdminDashboard" : "/private/UserDashboard"}
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-[13.5px] font-medium text-[#2B2118] dark:text-[#ededed] hover:bg-[#2B2118]/5 dark:hover:bg-white/10 transition-colors"
                                            >
                                                <LayoutGrid size={15} className="text-[#4A3B2C]/70 dark:text-[#ededed]/70" />
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/private/UserDashboard/Profile"
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-[13.5px] font-medium text-[#2B2118] dark:text-[#ededed] hover:bg-[#2B2118]/5 dark:hover:bg-white/10 transition-colors"
                                            >
                                                <UserIcon size={15} className="text-[#4A3B2C]/70 dark:text-[#ededed]/70" />
                                                Profile
                                            </Link>
                                        </div>

                                        <div className="border-t border-[#E5D9BE]/60 dark:border-white/10 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13.5px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
                                            >
                                                <LogOut size={15} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-[13.5px] font-semibold px-4 py-2 rounded-lg border border-[#2B2118]/15 dark:border-white/15 text-[#2B2118] dark:text-[#ededed] hover:bg-[#2B2118]/5 dark:hover:bg-white/10 transition-colors duration-150"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-[13.5px] font-semibold px-4 py-2 rounded-lg text-white bg-green-600 shadow-[0_6px_16px_rgba(193,80,46,0.28)] hover:-translate-y-px transition-transform duration-150"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile actions */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
                            aria-label="Toggle menu"
                        >
                            <span
                                className={`block w-5 h-[2px] bg-[#2B2118] dark:bg-[#ededed] transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""
                                    }`}
                            />
                            <span
                                className={`block w-5 h-[2px] bg-[#2B2118] dark:bg-[#ededed] transition-opacity duration-200 ${menuOpen ? "opacity-0" : "opacity-100"
                                    }`}
                            />
                            <span
                                className={`block w-5 h-[2px] bg-[#2B2118] dark:bg-[#ededed] transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-[500px]" : "max-h-0"
                    }`}
            >
                <div className="px-6 pb-5 flex flex-col gap-1 border-t border-[#E5D9BE] dark:border-white/10 pt-4">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={`text-[15px] font-medium py-2.5 ${pathname === link.href ? "text-[#C1502E]" : "text-[#2B2118] dark:text-[#ededed]"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {user && (
                        <Link
                            href={user.role === "admin" ? "/private/AdminDashboard" : "/private/UserDashboard"}
                            onClick={() => setMenuOpen(false)}
                            className={`text-[15px] font-medium py-2.5 ${pathname.startsWith("/private") ? "text-[#C1502E]" : "text-[#2B2118] dark:text-[#ededed]"
                                }`}
                        >
                            Dashboard
                        </Link>
                    )}

                    {!authLoading && user ? (
                        <div className="mt-3 pt-3 border-t border-[#E5D9BE] dark:border-white/10 flex flex-col gap-2.5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0">
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.name || "User avatar"}
                                            width={36}
                                            height={36}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-300">
                                            {user.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <span className="text-[14px] font-medium text-[#2B2118] dark:text-[#ededed] block truncate">
                                        {user.name}
                                    </span>
                                    <span className="text-[12px] text-[#4A3B2C]/60 dark:text-[#ededed]/50 block truncate">
                                        {user.email}
                                    </span>
                                </div>
                            </div>

                            <Link
                                href="/private/UserDashboard/Profile"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 text-[13.5px] font-medium text-[#2B2118] dark:text-[#ededed] py-1.5"
                            >
                                <UserIcon size={16} />
                                View Profile
                            </Link>

                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    handleLogout();
                                }}
                                className="w-full flex items-center justify-center gap-2 text-[13.5px] font-semibold px-4 py-2.5 rounded-lg text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        !authLoading && (
                            <div className="flex gap-3 mt-3">
                                <Link
                                    href="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 text-center text-[13.5px] font-semibold px-4 py-2.5 rounded-lg border border-[#2B2118]/15 dark:border-white/15 text-[#2B2118] dark:text-[#ededed]"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 text-center text-[13.5px] font-semibold px-4 py-2.5 rounded-lg text-white bg-green-600"
                                >
                                    Register
                                </Link>
                            </div>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}