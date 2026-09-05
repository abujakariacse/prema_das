"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";

const SERVER = process.env.NEXT_PUBLIC_API_URL;

export default function PopularRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const res = await fetch(`${SERVER}/api/recipes/popular?limit=8`);
                const data = await res.json();
                if (res.ok) setRecipes(data.recipes);
            } catch (error) {
                console.error("Failed to fetch popular recipes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPopular();
    }, []);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-10 flex justify-center">
                <span className="loading loading-spinner loading-lg text-green-700"></span>
            </div>
        );
    }

    if (recipes.length === 0) return null;

    const rows = [];
    for (let i = 0; i < recipes.length; i += 3) {
        rows.push(recipes.slice(i, i + 3));
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h2 className="text-[26px] font-bold text-[#2B2118] mb-1">Popular Recipes</h2>
            <p className="text-[14px] text-[#4A3B2C]/60 mb-6">The highest liked recipes across our platform.</p>

            <div className="border-t border-[#E5D9BE]">
                {rows.map((row, rowIdx) => (
                    <div
                        key={rowIdx}
                        className={`grid sm:grid-cols-3 gap-x-8 ${rowIdx > 0 ? "border-t border-[#E5D9BE]" : ""}`}
                    >
                        {row.map((recipe, colIdx) => {
                            const rank = rowIdx * 3 + colIdx + 1;
                            return (
                                <Link
                                    key={recipe._id}
                                    href={`/BrowseRecipe/Details/${recipe._id}`}
                                    className="flex items-center gap-3 py-4 px-3 -mx-3 rounded-xl hover:bg-[#FBF8F2] transition-colors border-b border-[#E5D9BE] sm:border-b-0"
                                >
                                    <span
                                        className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-bold ${rank <= 3 ? "bg-[#2B2118] text-white" : "bg-[#F1EAD9] text-[#4A3B2C]"
                                            }`}
                                    >
                                        {rank}
                                    </span>

                                    <img
                                        src={recipe.recipeImage}
                                        alt={recipe.recipeName}
                                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="text-[14.5px] font-semibold text-[#2B2118] truncate">
                                            {recipe.recipeName}
                                        </p>
                                        <p className="text-[12.5px] text-[#4A3B2C]/55 truncate">
                                            {recipe.authorName} &middot; {recipe.category}
                                        </p>
                                    </div>

                                    <span className="shrink-0 flex items-center gap-1 text-[13px] text-[#4A3B2C]/70">
                                        <Heart size={13} />
                                        {recipe.likesCount}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}