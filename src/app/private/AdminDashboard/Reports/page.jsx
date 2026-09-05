"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search, XCircle, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const REASON_LABELS = {
    spam: "Spam",
    offensive: "Offensive Content",
    copyright: "Copyright Issue",
};

const STATUS_STYLES = {
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    dismissed: "bg-[#F0EADA] text-[#4A3B2C] border border-[#E5D9BE]",
    resolved: "bg-red-50 text-red-600 border border-red-200",
};

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [confirmRemoveId, setConfirmRemoveId] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    async function fetchReports() {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/admin/reports`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to load reports");
            }

            const data = await res.json();
            setReports(data.reports || []);
        } catch (err) {
            console.error(err);
            setError("Could not load reports.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDismiss(report) {
        try {
            setActionLoadingId(report._id);

            const res = await fetch(
                `${API_URL}/api/admin/reports/${report._id}/dismiss`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to dismiss report");
            }

            setReports((prev) =>
                prev.map((r) =>
                    r._id === report._id ? { ...r, status: "dismissed" } : r
                )
            );
            toast.success("Report dismissed");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to dismiss report");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleRemoveRecipe(report) {
        try {
            setActionLoadingId(report._id);

            const res = await fetch(
                `${API_URL}/api/admin/reports/${report._id}/remove-recipe`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to remove recipe");
            }

            setReports((prev) =>
                prev.map((r) =>
                    r._id === report._id ? { ...r, status: "resolved" } : r
                )
            );
            toast.success("Recipe removed and report resolved");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to remove recipe");
        } finally {
            setActionLoadingId(null);
            setConfirmRemoveId(null);
        }
    }

    const filteredReports = reports.filter((r) => {
        const term = search.trim().toLowerCase();
        if (!term) return true;
        return (
            r.reason?.toLowerCase().includes(term) ||
            r.reportedBy?.toLowerCase().includes(term) ||
            r.recipeId?.toLowerCase().includes(term)
        );
    });

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-[22px] font-semibold text-[#2B2118]">
                        Reports
                    </h1>
                    <p className="text-[13.5px] text-[#4A3B2C]/60 mt-1">
                        Review recipe reports and take action.
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
                        placeholder="Search by reason or reporter"
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
                                    Recipe ID
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Reported By
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Reason
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Date
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
                                        Loading reports...
                                    </td>
                                </tr>
                            )}

                            {!loading && filteredReports.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-8 text-center text-[13px] text-[#4A3B2C]/50"
                                    >
                                        No reports found.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                filteredReports.map((r) => {
                                    const isPending = r.status === "pending";
                                    return (
                                        <tr
                                            key={r._id}
                                            className="border-b border-[#E5D9BE]/60 last:border-0"
                                        >
                                            <td className="px-5 py-3.5">
                                                <a
                                                    href={`/recipes/${r.recipeId}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[12.5px] text-[#2B2118] underline decoration-[#E5D9BE] underline-offset-2 hover:decoration-[#2B2118]"
                                                >
                                                    {r.recipeId}
                                                </a>
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] text-[#4A3B2C]/80">
                                                {r.reportedBy}
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] text-[#4A3B2C]/80">
                                                {REASON_LABELS[r.reason?.toLowerCase()] || r.reason}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status] ||
                                                        "bg-[#F0EADA] text-[#4A3B2C]"
                                                        }`}
                                                >
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-[12.5px] text-[#4A3B2C]/60">
                                                {r.createdAt
                                                    ? new Date(r.createdAt).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {!isPending ? (
                                                    <div className="text-right text-[12px] text-[#4A3B2C]/40">
                                                        —
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleDismiss(r)}
                                                            disabled={actionLoadingId === r._id}
                                                            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg border border-[#E5D9BE] text-[#4A3B2C]/70 hover:bg-[#F7F3E9] transition-colors disabled:opacity-50"
                                                        >
                                                            <XCircle size={13} />
                                                            Dismiss
                                                        </button>

                                                        {confirmRemoveId === r._id ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <button
                                                                    onClick={() => handleRemoveRecipe(r)}
                                                                    disabled={actionLoadingId === r._id}
                                                                    className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                                                >
                                                                    {actionLoadingId === r._id
                                                                        ? "..."
                                                                        : "Confirm"}
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmRemoveId(null)}
                                                                    className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg border border-[#E5D9BE] text-[#4A3B2C]/70 hover:bg-[#F7F3E9]"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setConfirmRemoveId(r._id)}
                                                                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 size={13} />
                                                                Remove Recipe
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}