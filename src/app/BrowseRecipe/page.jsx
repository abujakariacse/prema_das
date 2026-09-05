"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function BrowseRecipesPage() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes?page=${page}&limit=9`);
                const data = await res.json();
                if (res.ok) {
                    setRecipes(data.recipes);
                    setTotalPages(data.totalPages || 1);
                } else {
                    setError(data.error || "Failed to load recipes");
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Server network error");
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, [page]);

    const categories = ["All", ...new Set(recipes.map((r) => r.category).filter(Boolean))];
    const filteredRecipes =
        selectedCategory === "All" ? recipes : recipes.filter((r) => r.category === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-success"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center">
                <p className="text-red-600 font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="mb-6">
                    <p className="text-[12.5px] font-semibold tracking-wide text-green-700 uppercase mb-1.5">
                        Recipes
                    </p>
                    <h1 className="text-[26px] font-bold text-[#2B2118]">All Recipes</h1>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-[13.5px] font-semibold border transition-colors ${selectedCategory === cat
                                ? "bg-green-700 border-green-700 text-white"
                                : "border-[#E5D9BE] text-[#4A3B2C] hover:border-green-700"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {filteredRecipes.length === 0 ? (
                    <p className="text-center text-[#4A3B2C]/70">No recipes found in this category.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredRecipes.map((recipe, idx) => (
                                <motion.div
                                    key={recipe._id}
                                    layout="position"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.25,
                                        ease: "easeOut",
                                        delay: Math.min(idx * 0.04, 0.3),
                                    }}
                                >
                                    <RecipeCard recipe={recipe} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg text-[13.5px] font-semibold border border-[#E5D9BE] text-[#4A3B2C] disabled:opacity-40 disabled:cursor-not-allowed hover:border-green-700"
                        >
                            Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                            <button
                                key={num}
                                onClick={() => setPage(num)}
                                className={`w-9 h-9 rounded-lg text-[13.5px] font-semibold border transition-colors ${page === num
                                    ? "bg-green-700 border-green-700 text-white"
                                    : "border-[#E5D9BE] text-[#4A3B2C] hover:border-green-700"
                                    }`}
                            >
                                {num}
                            </button>
                        ))}

                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg text-[13.5px] font-semibold border border-[#E5D9BE] text-[#4A3B2C] disabled:opacity-40 disabled:cursor-not-allowed hover:border-green-700"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function RecipeCard({ recipe }) {
    return (
        <div className="group overflow-hidden bg-white border border-[#E5D9BE]">
            <div className="relative">
                <div className="aspect-[4/3] overflow-hidden">
                    <img
                        src={recipe.recipeImage}
                        alt={recipe.recipeName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="h-[3px] bg-green-600" />
            </div>
            <div className="px-5 py-5 flex flex-col items-center text-center gap-2">
                <h3 className="text-[15.5px] font-semibold text-[#2B2118]">{recipe.recipeName}</h3>
                <StarRating rating={5} />
                <p className="text-[12px] text-[#4A3B2C]/55">
                    {recipe.category} &middot; {recipe.cuisineType} &middot; {recipe.preparationTime}
                </p>
                <Link href={`/BrowseRecipe/Details/${recipe._id}`}>
                    <button className="btn mt-3 w-full text-[13px] font-semibold text-white bg-green-700 rounded-xl px-4 py-2.5 hover:bg-green-800 transition-colors duration-150">
                        View Details
                    </button>
                </Link>
            </div>
        </div>
    );
}

function StarRating({ rating, max = 5 }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <Star
                    key={i}
                    size={14}
                    strokeWidth={1.5}
                    className={i < rating ? "fill-amber-400 text-amber-400" : "text-[#E5D9BE]"}
                />
            ))}
        </div>
    );
}