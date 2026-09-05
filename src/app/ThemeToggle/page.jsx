"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react"; // lucide-react না থাকলে npm install lucide-react

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // hydration mismatch এড়ানোর জন্য — client mount না হওয়া পর্যন্ত কিছু render করবে না
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="w-9 h-9" />;

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#2B2118]/15 dark:border-white/15 hover:bg-[#2B2118]/5 dark:hover:bg-white/10 transition-colors duration-150"
        >
            {resolvedTheme === "dark" ? (
                <Sun size={16} className="text-[#ededed]" />
            ) : (
                <Moon size={16} className="text-[#2B2118]" />
            )}
        </button>
    );
}