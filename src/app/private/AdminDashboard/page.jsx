"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, Sparkles, Flag } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STAT_CARDS = [
    {
        key: "totalUsers",
        label: "Total Users",
        icon: Users,
    },
    {
        key: "totalRecipes",
        label: "Total Recipes",
        icon: BookOpen,
    },
    {
        key: "totalPremiumMembers",
        label: "Total Premium Members",
        icon: Sparkles,
    },
    {
        key: "totalReports",
        label: "Pending Reports",
        icon: Flag,
    },
];

export default function AdminOverviewPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchStats() {
            try {
                const res = await fetch(`${API_URL}/api/admin/stats`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error("Failed to load admin stats");
                }

                const data = await res.json();
                if (isMounted) {
                    setStats(data);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setError("Could not load dashboard stats.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchStats();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-[22px] font-semibold text-[#2B2118]">
                    Admin Overview
                </h1>
                <p className="text-[13.5px] text-[#4A3B2C]/60 mt-1">
                    Snapshot of what&apos;s happening across RecipeHub.
                </p>
            </div>

            {error && (
                <p className="text-[13px] text-red-600 mb-4">{error}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CARDS.map((card) => {
                    const Icon = card.icon;
                    const value = loading ? null : stats?.[card.key] ?? 0;

                    return (
                        <div
                            key={card.key}
                            className="rounded-2xl border border-[#E5D9BE] bg-white p-5"
                        >
                            <div className="w-9 h-9 rounded-lg bg-[#F0EADA] flex items-center justify-center mb-4">
                                <Icon size={17} strokeWidth={2} className="text-[#2B2118]" />
                            </div>
                            <p className="text-[24px] font-semibold text-[#2B2118] leading-none">
                                {loading ? "—" : value}
                            </p>
                            <p className="text-[12.5px] text-[#4A3B2C]/60 mt-2">
                                {card.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}