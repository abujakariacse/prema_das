import Link from "next/link";
import { ChefHat, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="max-w-lg w-full text-center">
                {/* ---------- Illustration ---------- */}
                <div className="relative inline-block mb-8 -rotate-[0.5deg]">
                    <div className="w-48 h-48 mx-auto rounded-full border-2 border-dashed border-[#C9A876] bg-[#FFFBF0] flex items-center justify-center">
                        <ChefHat size={72} strokeWidth={1.3} className="text-green-700" />
                    </div>
                    <div className="absolute -top-1 right-6 w-3 h-3 rounded-full bg-[#B23B3B] shadow-sm" />
                </div>

                {/* ---------- Error Message ---------- */}
                <p className="text-[13px] font-semibold tracking-wide text-green-700 uppercase mb-2">
                    Error 404
                </p>

                <p className="text-[15px] text-[#4A3B2C]/70 mb-8 leading-relaxed">
                    The page you're looking for isn't on the menu. It may have been moved, renamed, or never existed.
                </p>

                {/* ---------- Back Home Button ---------- */}
                <Link href="/">
                    <button className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-[14px] font-semibold px-6 py-3 rounded-full transition-colors">
                        <Home size={16} />
                        Back to Home
                    </button>
                </Link>
            </div>
        </div>
    );
}