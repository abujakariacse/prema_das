"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search, Star, Trash2, Pencil } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ManageRecipesPage() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        fetchRecipes();
    }, []);

    async function fetchRecipes() {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/admin/recipes`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to load recipes");
            }

            const data = await res.json();
            setRecipes(data.recipes || []);
        } catch (err) {
            console.error(err);
            setError("Could not load recipes.");
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleFeature(recipe) {
        try {
            setActionLoadingId(recipe._id);

            const res = await fetch(
                `${API_URL}/api/admin/recipes/${recipe._id}/feature`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ isFeatured: !recipe.isFeatured }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update feature status");
            }

            setRecipes((prev) =>
                prev.map((r) =>
                    r._id === recipe._id
                        ? { ...r, isFeatured: !recipe.isFeatured }
                        : r
                )
            );

            toast.success(
                recipe.isFeatured ? "Removed from featured" : "Recipe featured"
            );
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to update feature status");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleDelete(recipe) {
        try {
            setActionLoadingId(recipe._id);

            const res = await fetch(
                `${API_URL}/api/admin/recipes/${recipe._id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete recipe");
            }

            setRecipes((prev) => prev.filter((r) => r._id !== recipe._id));
            toast.success("Recipe deleted");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to delete recipe");
        } finally {
            setActionLoadingId(null);
            setConfirmDeleteId(null);
        }
    }

    const filteredRecipes = recipes.filter((r) => {
        const term = search.trim().toLowerCase();
        if (!term) return true;
        return (
            r.recipeName?.toLowerCase().includes(term) ||
            r.authorName?.toLowerCase().includes(term) ||
            r.authorEmail?.toLowerCase().includes(term) ||
            r.category?.toLowerCase().includes(term)
        );
    });

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-[22px] font-semibold text-[#2B2118]">
                        Manage Recipes
                    </h1>
                    <p className="text-[13.5px] text-[#4A3B2C]/60 mt-1">
                        Review, feature, or remove recipes across RecipeHub.
                    </p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B2C]/40"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, author, category"
                        className="w-full rounded-lg border border-[#E5D9BE] bg-white py-2 pl-9 pr-3 text-[13px] text-[#2B2118] placeholder:text-[#4A3B2C]/40 focus:outline-none focus:ring-2 focus:ring-[#2B2118]/20"
                    />
                </div>
            </div>

            {error && (
                <p className="text-[13px] text-red-600 mb-4">{error}</p>
            )}

            <div className="rounded-2xl border border-[#E5D9BE] bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#E5D9BE] bg-[#F7F3E9]">
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Recipe
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Author
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Category
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Likes
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Featured
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-8 text-center text-[13px] text-[#4A3B2C]/50"
                                    >
                                        Loading recipes...
                                    </td>
                                </tr>
                            )}

                            {!loading && filteredRecipes.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-8 text-center text-[13px] text-[#4A3B2C]/50"
                                    >
                                        No recipes found.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                filteredRecipes.map((r) => (
                                    <tr
                                        key={r._id}
                                        className="border-b border-[#E5D9BE]/60 last:border-0"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#F0EADA] shrink-0">
                                                    {r.recipeImage ? (
                                                        <img
                                                            src={r.recipeImage}
                                                            alt={r.recipeName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : null}
                                                </div>
                                                <span className="text-[13.5px] text-[#2B2118] font-medium">
                                                    {r.recipeName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-[13px] text-[#4A3B2C]/80">
                                            <div>{r.authorName || "—"}</div>
                                            <div className="text-[11.5px] text-[#4A3B2C]/50">
                                                {r.authorEmail}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-[13px] text-[#4A3B2C]/80">
                                            {r.category || "—"}
                                        </td>
                                        <td className="px-5 py-3.5 text-[13px] text-[#4A3B2C]/80">
                                            {r.likeCount ?? 0}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <button
                                                onClick={() => handleToggleFeature(r)}
                                                disabled={actionLoadingId === r._id}
                                                className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${r.isFeatured
                                                    ? "border-amber-200 text-amber-700 bg-amber-50"
                                                    : "border-[#E5D9BE] text-[#4A3B2C]/70 hover:bg-[#F7F3E9]"
                                                    }`}
                                            >
                                                <Star
                                                    size={14}
                                                    fill={r.isFeatured ? "currentColor" : "none"}
                                                />
                                                {r.isFeatured ? "Featured" : "Feature"}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`/private/AdminDashboard/ManageRecipes/${r._id}/edit`}
                                                    className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg border border-[#E5D9BE] text-[#4A3B2C]/70 hover:bg-[#F7F3E9] transition-colors"
                                                >
                                                    <Pencil size={13} />
                                                    Edit
                                                </a>

                                                {confirmDeleteId === r._id ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => handleDelete(r)}
                                                            disabled={actionLoadingId === r._id}
                                                            className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            {actionLoadingId === r._id
                                                                ? "..."
                                                                : "Confirm"}
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDeleteId(null)}
                                                            className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg border border-[#E5D9BE] text-[#4A3B2C]/70 hover:bg-[#F7F3E9]"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmDeleteId(r._id)}
                                                        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 size={13} />
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}