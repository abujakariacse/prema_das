"use client";

import Link from "next/link";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";

const QUICK_LINKS = [
    { label: "Home", href: "/" },
    { label: "Browse Recipes", href: "/BrowseRecipe" },
    { label: "login", href: "/login" },
    { label: "Register", href: "/Register" },
];

// lucide-react removed brand/social icons (Facebook, Instagram, Twitter, YouTube)
// in newer versions, so these are small inline SVGs instead of a package import.
function FacebookIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.28C16.3 4.2 15.3 4.1 14.1 4.1c-2.4 0-4 1.46-4 4.15v2.35H7.6v3H10.1V21h3.4z" />
        </svg>
    );
}

function InstagramIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function TwitterIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.8A8.2 8.2 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z" />
        </svg>
    );
}

function YoutubeIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M22 8.5c0-1.9-1.5-3.4-3.4-3.6C16 4.6 12 4.6 12 4.6s-4 0-6.6.3C3.5 5.1 2 6.6 2 8.5c-.2 2-.2 4-.2 4s0 2 .2 3.5c.1 1.9 1.6 3.4 3.5 3.6 2.6.3 6.5.3 6.5.3s4 0 6.6-.3c1.9-.2 3.4-1.7 3.5-3.6.2-1.5.2-3.5.2-3.5s0-2-.2-4zM10 15V9l5.2 3-5.2 3z" />
        </svg>
    );
}

const SOCIAL_LINKS = [
    { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
    { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
    { label: "Twitter", href: "https://twitter.com", Icon: TwitterIcon },
    { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-[#0F2818] text-white">
            <div className="max-w-7xl mx-auto px-6 py-14">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Logo + tagline */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-green-600/20 flex items-center justify-center">
                                <Leaf size={18} className="text-green-400" strokeWidth={2.2} />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                RecipeHub
                            </span>
                        </div>
                        <p className="mt-4 text-[13.5px] leading-relaxed text-white/60 max-w-xs">
                            A home for food lovers to create, share, and discover
                            recipes from around the world.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-green-400 mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-2.5">
                            {QUICK_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-[13.5px] text-white/70 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-green-400 mb-4">
                            Contact
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-[13.5px] text-white/70">
                                <MapPin size={15} className="shrink-0 mt-0.5 text-green-400" />
                                <span>Chattogram, Bangladesh</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-[13.5px] text-white/70">
                                <Mail size={15} className="shrink-0 text-green-400" />
                                <a
                                    href="mailto:support@recipehub.com"
                                    className="hover:text-white transition-colors"
                                >
                                    support@recipehub.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5 text-[13.5px] text-white/70">
                                <Phone size={15} className="shrink-0 text-green-400" />
                                <a
                                    href="tel:+8801000000000"
                                    className="hover:text-white transition-colors"
                                >
                                    +880 1556740995
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-green-400 mb-4">
                            Follow Us
                        </h3>
                        <div className="flex items-center gap-2.5">
                            {SOCIAL_LINKS.map((social) => {
                                const { Icon } = social;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={social.label}
                                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-600 flex items-center justify-center transition-colors"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-[12.5px] text-white/50">
                        © {year} RecipeHub. All rights reserved.
                    </p>
                    <p className="text-[12.5px] text-white/50">
                        Made with 🌿 for food lovers everywhere.
                    </p>
                </div>
            </div>
        </footer>
    );
}