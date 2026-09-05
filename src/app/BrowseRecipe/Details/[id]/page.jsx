"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import {
    Heart,
    Bookmark,
    Flag,
    ChevronLeft,
    ChevronRight,
    Clock,
    ChefHat,
    Utensils,
    X,
    Loader2,
    Sparkles,
    ShoppingCart,
    CheckCircle2,
} from "lucide-react";

const SERVER = process.env.NEXT_PUBLIC_API_URL;
// NOTE: loadStripe/stripePromise removed — the backend returns a hosted
// Checkout `url` directly (redirect flow), so @stripe/stripe-js's
// redirectToCheckout() is never actually used. If you later switch to
// Stripe Elements (embedded form) you'll need it back.

export default function RecipeDetails() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params?.id;

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [favorited, setFavorited] = useState(false);

    // Purchase related states
    const [isPurchased, setIsPurchased] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(null); // null = unknown yet, true/false once known
    const [purchaseStatusLoading, setPurchaseStatusLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [actionMsg, setActionMsg] = useState("");

    const [checkedIngredients, setCheckedIngredients] = useState({});

    // Where to send someone if they need to log in first, so they land
    // back on this exact recipe after logging in (handled by
    // getPostLoginRoute on the login page, which respects non-dashboard
    // intended routes as-is).
    const loginRedirectUrl = `/login?redirect=/BrowseRecipe/${id}`;

    // ---------- Fetch confirmed purchase status from the SERVER ----------
    // Never trust the URL alone for this — the backend's Stripe webhook
    // is the only source of truth for whether payment actually succeeded.
    // This call also doubles as our "is the user logged in" check, since
    // the route requires verifyToken and returns 401 when not authenticated.
    const fetchPurchaseStatus = useCallback(async () => {
        if (!id) return;
        try {
            setPurchaseStatusLoading(true);
            const res = await fetch(`${SERVER}/api/recipes/${id}/purchase-status`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setIsPurchased(!!data.purchased);
                setIsLoggedIn(true);
            } else if (res.status === 401) {
                // not logged in — treat as not purchased, don't redirect away
                setIsPurchased(false);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error("Error fetching purchase status:", error);
        } finally {
            setPurchaseStatusLoading(false);
        }
    }, [id]);

    // Fetch Recipe Data
    useEffect(() => {
        if (!id) return;

        const fetchRecipeDetails = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${SERVER}/api/recipes/${id}`, {
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch recipe");
                }

                const data = await res.json();
                const recipeData = data.recipe || data;

                setRecipe(recipeData);
                setLikeCount(recipeData.likeCount || recipeData.likes?.length || 0);
                setLiked(recipeData.isLiked || false);
                setFavorited(recipeData.isFavorited || false);
            } catch (error) {
                console.error("Error fetching recipe:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeDetails();
        fetchPurchaseStatus();
    }, [id, fetchPurchaseStatus]);

    // ---------- Check Stripe return status from URL ----------
    // The backend sends back `?purchase=success` or `?purchase=cancelled`
    // (see success_url / cancel_url in the checkout route).
    // On success we DON'T flip isPurchased directly from the URL —
    // we re-fetch the real status from the server, because the Stripe
    // webhook may take a second or two to arrive and write to the
    // payments collection. We poll briefly to cover that race.
    useEffect(() => {
        const purchase = searchParams.get("purchase");
        if (!purchase) return;

        if (purchase === "success") {
            setActionMsg("Payment received — confirming with the server…");

            let attempts = 0;
            const maxAttempts = 6; // ~12s total
            const poll = setInterval(async () => {
                attempts += 1;
                await fetchPurchaseStatus();
                if (attempts >= maxAttempts) clearInterval(poll);
            }, 2000);

            // also check once immediately
            fetchPurchaseStatus();

            return () => clearInterval(poll);
        }

        if (purchase === "cancelled") {
            setActionMsg("Payment was cancelled. You haven't been charged.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Once isPurchased flips true after a successful-payment redirect, show the message
    useEffect(() => {
        if (isPurchased && searchParams.get("purchase") === "success") {
            setActionMsg("Payment successful! Recipe has been added to your collection 🎉");
        }
    }, [isPurchased, searchParams]);

    const handleLike = async () => {
        try {
            const res = await fetch(`${SERVER}/api/recipes/${id}/like`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                setLiked(data.liked);
                setLikeCount(data.likeCount);
            } else if (res.status === 401) {
                router.push(loginRedirectUrl);
            }
        } catch (error) {
            console.error("Like failed:", error);
        }
    };

    const handleFavorite = async () => {
        try {
            const res = await fetch(`${SERVER}/api/recipes/${id}/favorite`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                setFavorited(data.favorited);
            } else if (res.status === 401) {
                router.push(loginRedirectUrl);
            }
        } catch (error) {
            console.error("Favorite failed:", error);
        }
    };

    // ---------- Buy button click ----------
    // Checked BEFORE opening the purchase modal, so a logged-out user
    // is sent straight to login (with a redirect back here) instead of
    // seeing a confirmation modal that will just fail with a 401.
    const handleBuyClick = () => {
        if (isLoggedIn === false) {
            router.push(loginRedirectUrl);
            return;
        }
        setShowPurchaseModal(true);
    };

    // ---------- Stripe Purchase Handler ----------
    const handlePurchase = async () => {
        setPurchaseLoading(true);
        try {
            // Matches backend: app.post("/api/recipes/:id/checkout", ...)
            const res = await fetch(`${SERVER}/api/recipes/${id}/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const data = await res.json();

            if (res.ok && data.url) {
                // Backend returns a hosted Checkout Session URL — just redirect.
                window.location.href = data.url;
                return;
            }

            if (res.status === 401) {
                // Session may have expired between page load and clicking pay —
                // send them to log in and come straight back to this recipe.
                router.push(loginRedirectUrl);
                return;
            }

            setActionMsg(data.error || "Failed to initiate checkout.");
        } catch (error) {
            console.error("Purchase failed:", error);
            setActionMsg("Something went wrong during payment connection.");
        } finally {
            setPurchaseLoading(false);
            setShowPurchaseModal(false);
        }
    };

    const handleReportSubmit = async () => {
        if (!reportReason.trim()) return;
        try {
            const res = await fetch(`${SERVER}/api/recipes/${id}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ reason: reportReason }),
            });
            if (res.ok) {
                setActionMsg("Report submitted. Thank you!");
                setShowReportModal(false);
                setReportReason("");
            } else if (res.status === 401) {
                router.push(loginRedirectUrl);
            }
        } catch (error) {
            console.error("Report failed:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-700" />
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center">
                <p className="text-[#4A3B2C]/70">Recipe not found</p>
            </div>
        );
    }

    const images = Array.isArray(recipe.recipeImage)
        ? recipe.recipeImage
        : recipe.recipeImage
            ? [recipe.recipeImage]
            : [];

    return (
        <div className="min-h-screen bg-[#FBF8F2]">
            <div className="max-w-5xl mx-auto px-6 py-10">
                {/* ---------- Image Gallery ---------- */}
                {images.length > 0 && (
                    <div className="relative rounded-3xl overflow-hidden aspect-[16/9] bg-[#E5D9BE]/40 shadow-sm">
                        <img src={images[activeImg]} alt={recipe.recipeName} className="w-full h-full object-cover" />
                        {recipe.isFeatured && (
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-amber-400 text-[#2B2118] text-[12px] font-bold px-3 py-1.5 rounded-full">
                                <Sparkles size={13} />
                                Featured
                            </div>
                        )}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImg((p) => (p === 0 ? images.length - 1 : p - 1))}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setActiveImg((p) => (p === images.length - 1 ? 0 : p + 1))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* ---------- Title Block ---------- */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-8">
                    <div>
                        <p className="text-[12.5px] font-semibold tracking-wide text-green-700 uppercase mb-2">
                            {recipe.category} &middot; {recipe.cuisineType}
                        </p>
                        <h1
                            className="text-[34px] sm:text-[42px] leading-tight text-[#2B2118] mb-2"
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
                        >
                            {recipe.recipeName}
                        </h1>
                        {recipe.authorName && (
                            <p className="text-[13.5px] text-[#4A3B2C]/60">
                                By <span className="font-semibold text-[#4A3B2C]">{recipe.authorName}</span>
                            </p>
                        )}
                    </div>
                    {recipe.difficultyLevel && (
                        <span className="shrink-0 bg-green-700 text-white text-[13px] font-semibold px-5 py-2 rounded-full h-fit">
                            {recipe.difficultyLevel}
                        </span>
                    )}
                </div>

                {/* ---------- Recipe Index Card ---------- */}
                <div className="relative mt-8 -rotate-[0.4deg]">
                    <div className="flex flex-wrap gap-x-10 gap-y-4 border-2 border-dashed border-[#C9A876] bg-[#FFFBF0] rounded-xl px-8 py-5">
                        <InfoStat icon={<Clock size={18} />} label="Prep Time" value={recipe.preparationTime} />
                        <InfoStat icon={<ChefHat size={18} />} label="Cuisine" value={recipe.cuisineType} />
                        <InfoStat icon={<Utensils size={18} />} label="Category" value={recipe.category} />
                    </div>
                    <div className="absolute -top-2 left-8 w-3 h-3 rounded-full bg-[#B23B3B] shadow-sm" />
                </div>

                {/* ---------- Action Bar ---------- */}
                <div className="flex flex-wrap items-center gap-3 mt-8 pb-6 border-b border-[#E5D9BE]">
                    {purchaseStatusLoading ? (
                        <div className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E5D9BE]/40 text-[#4A3B2C]/60 text-[14px] font-semibold">
                            <Loader2 size={16} className="animate-spin" />
                            Checking access…
                        </div>
                    ) : isPurchased ? (
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-100 border border-green-300 text-green-800 text-[14px] font-bold">
                            <CheckCircle2 size={18} className="text-green-600" />
                            Purchased
                        </div>
                    ) : (
                        <button
                            onClick={handleBuyClick}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-green-700 hover:bg-green-800 text-white text-[14px] font-semibold shadow-md transition-all active:scale-95"
                        >
                            <ShoppingCart size={17} />
                            Buy Recipe {recipe.price ? `($${recipe.price})` : ""}
                        </button>
                    )}

                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[14px] font-semibold transition-colors ${liked
                            ? "bg-[#B23B3B] border-[#B23B3B] text-white"
                            : "border-[#E5D9BE] text-[#2B2118] hover:border-[#B23B3B]"
                            }`}
                    >
                        <Heart size={16} className={liked ? "fill-white" : ""} />
                        {likeCount}
                    </button>

                    <button
                        onClick={handleFavorite}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[14px] font-semibold transition-colors ${favorited
                            ? "bg-amber-400 border-amber-400 text-[#2B2118]"
                            : "border-[#E5D9BE] text-[#2B2118] hover:border-amber-400"
                            }`}
                    >
                        <Bookmark size={16} className={favorited ? "fill-[#2B2118]" : ""} />
                        {favorited ? "Favorited" : "Favorite"}
                    </button>

                    <button
                        onClick={() => setShowReportModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] text-[#4A3B2C]/60 hover:text-[#B23B3B] transition-colors ml-auto"
                    >
                        <Flag size={14} />
                        Report
                    </button>
                </div>

                {actionMsg && <p className="text-green-700 text-[14px] font-medium mt-4">{actionMsg}</p>}

                {/* ---------- Instructions + Ingredients ---------- */}
                <div className="flex flex-col lg:flex-row gap-12 mt-10">
                    <div className="flex-[2] min-w-0">
                        <h2
                            className="text-[22px] text-[#2B2118] mb-6"
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
                        >
                            Method
                        </h2>
                        <div className="space-y-6">
                            {recipe.instructions?.map((step, idx) => (
                                <div key={idx} className="flex gap-5">
                                    <div className="shrink-0 w-9 h-9 rounded-full border-2 border-green-700 text-green-700 flex items-center justify-center text-[13px] font-bold">
                                        {idx + 1}
                                    </div>
                                    <p className="text-[15px] text-[#4A3B2C] leading-relaxed pt-1">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 min-w-[260px]">
                        <div className="bg-[#FFFBF0] border border-[#E5D9BE] rounded-2xl p-6 sticky top-6">
                            <h2
                                className="text-[20px] text-[#2B2118] mb-4"
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
                            >
                                Ingredients
                            </h2>
                            <div className="space-y-3">
                                {recipe.ingredients?.map((ing, idx) => (
                                    <label key={idx} className="flex items-start gap-3 text-[14.5px] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!checkedIngredients[idx]}
                                            onChange={() =>
                                                setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }))
                                            }
                                            className="mt-1 w-4 h-4 accent-green-700 shrink-0"
                                        />
                                        <span
                                            className={
                                                checkedIngredients[idx]
                                                    ? "line-through text-[#4A3B2C]/40"
                                                    : "text-[#2B2118]"
                                            }
                                        >
                                            {ing}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------- Purchase Modal ---------- */}
            {showPurchaseModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowPurchaseModal(false)}
                            className="absolute top-4 right-4 text-[#4A3B2C]/50 hover:text-[#2B2118]"
                        >
                            <X size={20} />
                        </button>
                        <h3
                            className="text-[20px] text-[#2B2118] mb-2"
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
                        >
                            Confirm Purchase
                        </h3>
                        <p className="text-[14px] text-[#4A3B2C]/80 mb-6">
                            Are you sure you want to purchase <strong>{recipe.recipeName}</strong> for{" "}
                            <span className="text-green-700 font-bold">${recipe.price || "Free"}</span>?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowPurchaseModal(false)}
                                className="px-4 py-2 rounded-full text-[13px] font-semibold text-[#4A3B2C] hover:bg-[#FBF8F2]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePurchase}
                                disabled={purchaseLoading}
                                className="flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold text-white bg-green-700 hover:bg-green-800 disabled:opacity-50"
                            >
                                {purchaseLoading && <Loader2 size={14} className="animate-spin" />}
                                Confirm & Pay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Report Modal ---------- */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowReportModal(false)}
                            className="absolute top-4 right-4 text-[#4A3B2C]/50 hover:text-[#2B2118]"
                        >
                            <X size={20} />
                        </button>
                        <h3
                            className="text-[20px] text-[#2B2118] mb-1"
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
                        >
                            Report this recipe
                        </h3>
                        <p className="text-[13px] text-[#4A3B2C]/60 mb-4">
                            Let us know what's wrong — we'll take a look.
                        </p>
                        <textarea
                            placeholder="Why are you reporting this recipe?"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full h-28 p-3 rounded-xl border border-[#E5D9BE] text-[14px] focus:outline-none focus:border-[#B23B3B] resize-none"
                        />
                        <div className="flex gap-3 justify-end mt-4">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="px-4 py-2 rounded-full text-[13px] font-semibold text-[#4A3B2C] hover:bg-[#FBF8F2]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReportSubmit}
                                className="px-5 py-2 rounded-full text-[13px] font-semibold text-white bg-[#B23B3B] hover:bg-[#96302f]"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoStat({ icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2.5">
            <span className="text-green-700">{icon}</span>
            <div>
                <p className="text-[10.5px] uppercase tracking-wide text-[#4A3B2C]/50 font-semibold">{label}</p>
                <p className="text-[14px] text-[#2B2118] font-semibold">{value}</p>
            </div>
        </div>
    );
}