"use client";

import { BadgeCheck, Bookmark, Crown, MessageSquareHeart } from "lucide-react";

const FEATURES = [
    {
        icon: BadgeCheck,
        title: "Verified Recipes",
        description:
            "Every recipe is shared by real home cooks and food enthusiasts — no bots, no spam.",
    },
    {
        icon: Bookmark,
        title: "Save Your Favorites",
        description:
            "Bookmark recipes you love and build your own personal cookbook over time.",
    },
    {
        icon: Crown,
        title: "Go Premium",
        description:
            "Unlock unlimited recipe uploads and a premium badge to stand out in the community.",
    },
    {
        icon: MessageSquareHeart,
        title: "Community Driven",
        description:
            "Like, favorite, and report recipes — the community helps keep RecipeHub high quality.",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="bg-[#F7FBF6] py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                        Why RecipeHub
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                        Why Choose RecipeHub
                    </h2>
                    <div className="w-10 h-1 bg-green-600 rounded-full mt-3 mx-auto" />
                    <p className="text-gray-500 text-sm sm:text-[15px] max-w-xl mx-auto mt-4">
                        Everything you need to discover, share, and enjoy great food —
                        all in one place.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                            >
                                <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
                                    <Icon size={24} className="text-white" strokeWidth={2} />
                                </div>
                                <h3 className="font-semibold text-[15px] mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-[13.5px] text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}