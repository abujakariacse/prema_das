"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Loader2, Receipt } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PurchasedPage() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchPurchased() {
            try {
                const res = await fetch(`${API_URL}/api/payments/mine`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error("Failed to load purchased recipes");
                }

                const data = await res.json();
                if (isMounted) {
                    setRecipes(data.recipes || []);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setError("Could not load your purchased recipes.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchPurchased();
        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-green-700" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-[22px] font-semibold text-[#2B2118]">
                    My Purchased Recipes
                </h1>
                <p className="text-[13.5px] text-[#4A3B2C]/60 mt-1">
                    Recipes you&apos;ve unlocked with a purchase.
                </p>
            </div>

            {error && <p className="text-[13px] text-red-600 mb-4">{error}</p>}

            {!error && recipes.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#E5D9BE] bg-white py-14 text-center">
                    <ShoppingBag size={28} className="text-[#4A3B2C]/30 mx-auto mb-3" />
                    <p className="text-[14px] text-[#4A3B2C]/60 mb-1">
                        You haven&apos;t purchased any recipes yet.
                    </p>
                    <Link
                        href="/BrowseRecipe"
                        className="text-[13.5px] font-semibold text-green-700 hover:underline"
                    >
                        Browse recipes
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recipes.map((recipe) => (
                    <div
                        key={recipe._id}
                        className="rounded-2xl border border-[#E5D9BE] bg-white overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="relative aspect-[4/3] bg-[#F0EADA]">
                            {recipe.recipeImage && (
                                <img
                                    src={recipe.recipeImage}
                                    alt={recipe.recipeName}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <span className="absolute top-2 left-2 bg-white text-[11px] font-medium px-2.5 py-1 rounded-full">
                                {recipe.category}
                            </span>
                        </div>

                        <div className="p-4">
                            <p className="font-semibold text-[14.5px] text-[#2B2118] mb-1 line-clamp-1">
                                {recipe.recipeName}
                            </p>
                            <p className="text-[12.5px] text-[#4A3B2C]/60 mb-3">
                                {recipe.cuisineType}
                            </p>

                            <div className="flex items-center gap-1.5 text-[12px] text-[#4A3B2C]/50 mb-3">
                                <Receipt size={13} />
                                <span>
                                    Purchased{" "}
                                    {recipe.purchasedAt
                                        ? new Date(recipe.purchasedAt).toLocaleDateString()
                                        : "—"}
                                </span>
                            </div>

                            <Link
                                href={`/recipes/${recipe._id}`}
                                className="block text-center text-[13px] font-semibold text-white bg-green-700 hover:bg-green-800 rounded-lg py-2 transition-colors"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}