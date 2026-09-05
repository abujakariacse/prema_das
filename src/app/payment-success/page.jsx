"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Receipt, XCircle } from "lucide-react";

const SERVER = process.env.NEXT_PUBLIC_API_URL;

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const sessionId = searchParams.get("session_id");
    const recipeId = searchParams.get("recipeId");

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFoundYet, setNotFoundYet] = useState(false);

    // The Stripe webhook can take a second or two to write to the
    // payments collection, so we retry a few times before giving up.
    const fetchPayment = useCallback(
        async (attemptsLeft = 6) => {
            if (!sessionId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(
                    `${SERVER}/api/payments/session/${sessionId}`,
                    { credentials: "include" }
                );

                if (res.status === 401) {
                    router.push(`/login?redirect=/payment-success?session_id=${sessionId}%26recipeId=${recipeId}`);
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setPayment(data.payment);
                    setLoading(false);
                    return;
                }

                if (res.status === 404 && attemptsLeft > 0) {
                    setNotFoundYet(true);
                    setTimeout(() => fetchPayment(attemptsLeft - 1), 2000);
                    return;
                }

                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch payment details:", error);
                setLoading(false);
            }
        },
        [sessionId, recipeId, router]
    );

    useEffect(() => {
        fetchPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    if (!sessionId) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center px-4">
                <div className="text-center">
                    <XCircle size={40} className="text-[#B23B3B] mx-auto mb-3" />
                    <p className="text-[#4A3B2C]/70">No payment session found.</p>
                    <Link
                        href="/"
                        className="inline-block mt-4 text-green-700 font-semibold hover:underline"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="w-9 h-9 animate-spin text-green-700 mx-auto mb-4" />
                    <p className="text-[#4A3B2C]/70 text-[14px]">
                        {notFoundYet
                            ? "Still confirming your payment with the server…"
                            : "Confirming your payment…"}
                    </p>
                </div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <XCircle size={40} className="text-[#B23B3B] mx-auto mb-3" />
                    <h1 className="text-[20px] font-semibold text-[#2B2118] mb-2">
                        Couldn&apos;t confirm your payment yet
                    </h1>
                    <p className="text-[13.5px] text-[#4A3B2C]/60 mb-5">
                        This can happen if the confirmation is still processing.
                        If you were charged, it will appear in your account shortly.
                    </p>
                    <Link
                        href={recipeId ? `/BrowseRecipe/Details/${recipeId}` : "/"}
                        className="inline-block px-5 py-2.5 rounded-full bg-green-700 text-white text-[13.5px] font-semibold hover:bg-green-800"
                    >
                        Back to Recipe
                    </Link>
                </div>
            </div>
        );
    }

    const amountFormatted = (payment.amount / 100).toFixed(2);
    const currencyLabel = (payment.currency || "usd").toUpperCase();
    const purchasedDate = payment.purchasedAt
        ? new Date(payment.purchasedAt).toLocaleString()
        : "—";

    return (
        <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-white border border-[#E5D9BE] rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={34} className="text-green-600" />
                </div>

                <h1
                    className="text-[24px] text-[#2B2118] mb-2"
                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
                >
                    Payment Successful!
                </h1>
                <p className="text-[13.5px] text-[#4A3B2C]/70 mb-6">
                    {payment.recipeName
                        ? `You now have full access to "${payment.recipeName}".`
                        : "Your recipe has been added to your collection."}
                </p>

                {/* Transaction details */}
                <div className="bg-[#FFFBF0] border border-[#E5D9BE] rounded-xl p-5 text-left space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#2B2118] mb-1">
                        <Receipt size={15} className="text-green-700" />
                        Transaction Details
                    </div>

                    <DetailRow label="Amount" value={`${amountFormatted} ${currencyLabel}`} />
                    <DetailRow label="Date" value={purchasedDate} />
                    <DetailRow label="Transaction ID" value={payment.transactionId} mono />
                    <DetailRow
                        label="Status"
                        value={
                            <span className="text-green-700 font-semibold capitalize">
                                {payment.status}
                            </span>
                        }
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href={payment.recipeId ? `/BrowseRecipe/${payment.recipeId}` : "/"}
                        className="flex-1 px-5 py-2.5 rounded-full bg-green-700 text-white text-[13.5px] font-semibold hover:bg-green-800 transition-colors"
                    >
                        View Recipe
                    </Link>
                    <Link
                        href="/private/UserDashboard/Purchased"
                        className="flex-1 px-5 py-2.5 rounded-full border border-[#E5D9BE] text-[#2B2118] text-[13.5px] font-semibold hover:bg-[#F7F3E9] transition-colors"
                    >
                        My Purchases
                    </Link>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, mono }) {
    return (
        <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#4A3B2C]/60">{label}</span>
            <span className={`text-[#2B2118] font-medium ${mono ? "font-mono text-[11.5px]" : ""}`}>
                {value}
            </span>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-700" />
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    );
}