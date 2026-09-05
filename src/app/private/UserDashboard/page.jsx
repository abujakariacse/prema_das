"use client";

import { BookOpen, Heart, ThumbsUp, Crown } from "lucide-react";

// Overview stats — placeholder, wire up to real data later
const overviewStats = {
    totalRecipes: 1,
    totalFavorites: 6,
    totalLikes: 87,
};

const isPremium = false; // TODO: wire up to actual payment/subscription status

export default function UserDashboardHome() {
    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
                <div>
                    <p className="text-[12.5px] font-semibold tracking-wide text-green-700 uppercase mb-1.5">
                        User Dashboard
                    </p>
                    <h1 className="text-[26px] font-bold text-[#2B2118]">Overview</h1>
                </div>

                <PremiumBadge active={isPremium} />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    label="Total Recipes"
                    value={overviewStats.totalRecipes}
                    icon={BookOpen}
                />
                <StatCard
                    label="Total Favorites"
                    value={overviewStats.totalFavorites}
                    icon={Heart}
                />
                <StatCard
                    label="Total Likes Received"
                    value={overviewStats.totalLikes}
                    icon={ThumbsUp}
                />
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon }) {
    return (
        <div className="rounded-2xl border border-[#E5D9BE] bg-white px-5 py-5">
            <div className="w-9 h-9 rounded-lg bg-[#F0EADA] flex items-center justify-center mb-4">
                <Icon size={16} strokeWidth={2} className="text-green-700" />
            </div>
            <p className="text-[24px] font-bold text-[#2B2118] leading-none mb-1.5">
                {value}
            </p>
            <p className="text-[12.5px] text-[#4A3B2C]/60">{label}</p>
        </div>
    );
}

function PremiumBadge({ active }) {
    if (active) {
        return (
            <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#2B2118] bg-gradient-to-r from-[#F5E3B3] to-[#EAD08C] border border-[#D9BE72] rounded-full pl-2.5 pr-3.5 py-1.5">
                <Crown size={14} strokeWidth={2.5} className="text-[#8A6A1F]" />
                Premium Member
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#4A3B2C]/60 bg-[#F7F3E9] border border-[#E5D9BE] rounded-full pl-2.5 pr-3.5 py-1.5">
            <Crown size={14} strokeWidth={2} className="text-[#4A3B2C]/40" />
            Free Plan
        </span>
    );
}