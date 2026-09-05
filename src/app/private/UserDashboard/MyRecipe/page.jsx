"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, Pencil, Trash2, ThumbsUp } from "lucide-react";
import Link from "next/link";

const SERVER = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export default function MyRecipePage() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchMyRecipes();
    }, []);

    const fetchMyRecipes = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${SERVER}/api/recipes/mine`, {
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to load your recipes.");
                setLoading(false);
                return;
            }

            setRecipes(data.recipes || []);
        } catch (err) {
            console.error("Fetch my recipes error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // TODO: Update button click hole ei function e recipe id pass kore
    // update page/modal e navigate/open korte hobe
    const handleUpdate = (recipeId) => {
        router.push(`/recipes/edit/${recipeId}`); // আপনার edit route অনুযায়ী URL পরিবর্তন করতে পারেন
    };
    // TODO: Delete button click hole ei function e DELETE /api/recipes/:id
    // (backend e route add korte hobe) call kore, success hole
    // recipes state theke oi recipe ta remove korte hobe
    const handleDelete = async (recipeId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${SERVER}/api/recipes/${recipeId}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to delete recipe.");
                return;
            }

            // Backend-এ ডিলিট সফল হলে Front-end State থেকেও সরিয়ে দেওয়া
            setRecipes((prevRecipes) => prevRecipes.filter((item) => item._id !== recipeId));
            alert("Recipe deleted successfully!");
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete recipe. Try again.");
        }
    };

    // TODO: View button click hole recipe detail page e navigate korte hobe
    const handleView = (recipeId) => {
        router.push(`/recipes/${recipeId}`);
    };

    return (
        <div>
            <div className="mb-7">
                <p className="text-[12.5px] font-semibold tracking-wide text-green-700 uppercase mb-1.5">
                    User Dashboard
                </p>
                <h1 className="text-[26px] font-bold text-[#2B2118]">My Recipes</h1>
            </div>

            {loading && <LoadingState />}

            {!loading && error && (
                <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                    {error}
                </p>
            )}

            {!loading && !error && recipes.length === 0 && <EmptyState />}

            {!loading && !error && recipes.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {recipes.map((recipe) => (
                        <RecipeCard
                            key={recipe._id}
                            recipe={recipe}
                            onView={() => handleView(recipe._id)}
                            onUpdate={() => handleUpdate(recipe._id)}
                            onDelete={() => handleDelete(recipe._id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function RecipeCard({ recipe, onView, onUpdate, onDelete }) {
    return (
        <div className="rounded-2xl border border-[#E5D9BE] bg-white overflow-hidden flex flex-col">
            <div className="w-full h-36 bg-[#FBF8F2] overflow-hidden">
                {recipe.recipeImage ? (
                    <img
                        src={recipe.recipeImage}
                        alt={recipe.recipeName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#4A3B2C]/30">
                        <BookOpen size={22} strokeWidth={1.75} />
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col gap-3 flex-1">
                <h3 className="text-[14.5px] font-bold text-[#2B2118] leading-snug">
                    {recipe.recipeName}
                </h3>

                <div className="flex flex-wrap gap-1.5">
                    <Tag>{recipe.category}</Tag>
                    <Tag>{recipe.cuisineType}</Tag>
                    <Tag>{recipe.difficultyLevel}</Tag>
                </div>

                <div className="flex items-center justify-between text-[12px] text-[#4A3B2C]/60 mt-auto pt-1">
                    <span>{recipe.preparationTime}</span>
                    <span className="flex items-center gap-1">
                        <ThumbsUp size={12} strokeWidth={2} />
                        {recipe.likeCount || 0}
                    </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#F0EADA]">
                    <button
                        type="button"
                        onClick={onView}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-[#2B2118] bg-[#F0EADA] rounded-lg py-2 hover:bg-[#E9E0C6] transition-colors duration-150"
                    >
                        <Eye size={14} strokeWidth={2} />
                        View
                    </button>

                    <Link href={`/private/UserDashboard/edit-recipe/${recipe._id}`}><button
                        type="button"
                        onClick={onUpdate}
                        className="flex items-center justify-center w-9 h-9 rounded-lg text-[#4A3B2C]/60 hover:text-green-700 hover:bg-[#F0EADA] transition-colors duration-150"
                        aria-label="Update recipe"
                    >
                        <Pencil size={15} strokeWidth={2} />
                    </button>
                    </Link>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="flex items-center justify-center w-9 h-9 rounded-lg text-[#4A3B2C]/60 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                        aria-label="Delete recipe"
                    >
                        <Trash2 size={15} strokeWidth={2} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function Tag({ children }) {
    if (!children) return null;
    return (
        <span className="text-[11px] font-medium text-[#4A3B2C]/70 bg-[#FBF8F2] border border-[#E5D9BE] rounded-full px-2.5 py-1">
            {children}
        </span>
    );
}

function LoadingState() {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-[#E5D9BE] bg-white overflow-hidden animate-pulse"
                >
                    <div className="w-full h-36 bg-[#F0EADA]" />
                    <div className="p-4 flex flex-col gap-3">
                        <div className="h-3.5 w-3/4 bg-[#F0EADA] rounded" />
                        <div className="h-3 w-1/2 bg-[#F0EADA] rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border border-dashed border-[#E5D9BE] bg-[#FBF8F2] flex flex-col items-center justify-center text-center px-6 py-14">
            <div className="w-11 h-11 rounded-xl bg-[#F0EADA] flex items-center justify-center mb-4">
                <BookOpen size={18} strokeWidth={1.75} className="text-green-700" />
            </div>
            <p className="text-[14px] font-semibold text-[#2B2118] mb-1">
                No recipes yet
            </p>
            <p className="text-[12.5px] text-[#4A3B2C]/60">
                Add your first recipe to see it here.
            </p>
        </div>
    );
}