"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search, ShieldCheck, ShieldOff } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ManageUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/admin/users`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to load users");
            }

            const data = await res.json();
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
            setError("Could not load users.");
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleBlock(user) {
        const action = user.isBlocked ? "unblock" : "block";

        try {
            setActionLoadingId(user._id);

            const res = await fetch(
                `${API_URL}/api/admin/users/${user._id}/${action}`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Failed to ${action} user`);
            }

            // Update local state instead of re-fetching everything
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === user._id ? { ...u, isBlocked: !user.isBlocked } : u
                )
            );

            toast.success(
                action === "block" ? "User blocked" : "User unblocked"
            );
        } catch (err) {
            console.error(err);
            toast.error(err.message || `Failed to ${action} user`);
        } finally {
            setActionLoadingId(null);
        }
    }

    const filteredUsers = users.filter((u) => {
        const term = search.trim().toLowerCase();
        if (!term) return true;
        return (
            u.name?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term)
        );
    });

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-[22px] font-semibold text-[#2B2118]">
                        Manage Users
                    </h1>
                    <p className="text-[13.5px] text-[#4A3B2C]/60 mt-1">
                        View, block, or unblock RecipeHub users.
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
                        placeholder="Search by name or email"
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
                                    Name
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Email
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Role
                                </th>
                                <th className="px-5 py-3 text-[12px] font-semibold text-[#4A3B2C]/70 uppercase tracking-wide">
                                    Status
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
                                        colSpan={5}
                                        className="px-5 py-8 text-center text-[13px] text-[#4A3B2C]/50"
                                    >
                                        Loading users...
                                    </td>
                                </tr>
                            )}

                            {!loading && filteredUsers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-8 text-center text-[13px] text-[#4A3B2C]/50"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                filteredUsers.map((u) => (
                                    <tr
                                        key={u._id}
                                        className="border-b border-[#E5D9BE]/60 last:border-0"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-[#2B2118] text-white flex items-center justify-center text-[11px] font-semibold overflow-hidden shrink-0">
                                                    {u.image ? (
                                                        <img
                                                            src={u.image}
                                                            alt={u.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        u.name?.charAt(0)?.toUpperCase() || "U"
                                                    )}
                                                </div>
                                                <span className="text-[13.5px] text-[#2B2118] font-medium">
                                                    {u.name || "—"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-[13px] text-[#4A3B2C]/80">
                                            {u.email}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${u.role === "admin"
                                                    ? "bg-[#2B2118] text-white"
                                                    : "bg-[#F0EADA] text-[#4A3B2C]"
                                                    }`}
                                            >
                                                {u.role || "user"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${u.isBlocked
                                                    ? "bg-red-50 text-red-600 border border-red-200"
                                                    : "bg-green-50 text-green-700 border border-green-200"
                                                    }`}
                                            >
                                                {u.isBlocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            {u.role === "admin" ? (
                                                <span className="text-[12px] text-[#4A3B2C]/40">
                                                    —
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleBlock(u)}
                                                    disabled={actionLoadingId === u._id}
                                                    className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${u.isBlocked
                                                        ? "border-green-200 text-green-700 hover:bg-green-50"
                                                        : "border-red-200 text-red-600 hover:bg-red-50"
                                                        }`}
                                                >
                                                    {u.isBlocked ? (
                                                        <ShieldCheck size={14} />
                                                    ) : (
                                                        <ShieldOff size={14} />
                                                    )}
                                                    {actionLoadingId === u._id
                                                        ? "..."
                                                        : u.isBlocked
                                                            ? "Unblock"
                                                            : "Block"}
                                                </button>
                                            )}
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