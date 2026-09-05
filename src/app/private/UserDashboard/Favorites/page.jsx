"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Trash2, Eye, Loader2, Utensils } from "lucide-react";

const SERVER = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export default function MyFavorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await fetch(`${SERVER}/api/favorites/mine`, {
                    credentials: "include",
                });
                if (res.status === 401) {
                    router.push("/login");
                    return;
                }
                const data = await res.json();
                if (res.ok) {
                    setFavorites(data.recipes || []);
                }
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [router]);

    // ফেভারিট থেকে রিমুভ করার হ্যান্ডলার
    const handleRemoveFavorite = async (recipeId) => {
        try {
            const res = await fetch(`${SERVER}/api/favorites/${recipeId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.ok) {
                // স্টেট থেকে ইনস্ট্যান্ট রিমুভ
                setFavorites((prev) => prev.filter((item) => item._id !== recipeId));
            } else if (res.status === 401) {
                router.push("/login");
            }
        } catch (error) {
            console.error("Failed to remove favorite:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-700" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBF8F2] py-10 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1
                        className="text-3xl font-bold text-[#2B2118]"
                        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                    >
                        My Favorites
                    </h1>
                    <p className="text-sm text-[#4A3B2C]/70 mt-1">
                        All your saved recipes in one place.
                    </p>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-16 bg-[#FFFBF0] rounded-2xl border border-dashed border-[#E5D9BE]">
                        <Utensils className="w-12 h-12 text-[#4A3B2C]/40 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-[#2B2118]">No favorites saved yet</h3>
                        <p className="text-sm text-[#4A3B2C]/60 mt-1 mb-4">
                            Explore recipes and save your top choices here!
                        </p>
                        <Link
                            href="/recipes"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-full text-sm font-semibold hover:bg-green-800 transition-colors"
                        >
                            Browse Recipes
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((recipe) => (
                            <div
                                key={recipe._id}
                                className="bg-[#FFFBF0] border border-[#E5D9BE] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                            >
                                <div>
                                    <div className="relative aspect-[16/10] bg-[#E5D9BE]/40">
                                        {recipe.recipeImage ? (
                                            <img
                                                src={recipe.recipeImage}
                                                alt={recipe.recipeName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#4A3B2C]/40">
                                                No Image Available
                                            </div>
                                        )}
                                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-green-800">
                                            {recipe.category || "General"}
                                        </span>
                                    </div>

                                    <div className="p-5">
                                        <h2
                                            className="text-xl font-semibold text-[#2B2118] line-clamp-1 mb-2"
                                            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                                        >
                                            {recipe.recipeName}
                                        </h2>
                                        <p className="text-xs text-[#4A3B2C]/70 mb-3">
                                            By {recipe.authorName || "Anonymous"} &middot; {recipe.cuisineType}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="p-5 pt-0 flex items-center gap-2 border-t border-[#E5D9BE]/50 mt-auto">
                                    <Link
                                        href={`/recipes/${recipe._id}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-full transition-colors"
                                    >
                                        <Eye size={14} /> View Details
                                    </Link>
                                    <button
                                        onClick={() => handleRemoveFavorite(recipe._id)}
                                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Remove from favorites"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}