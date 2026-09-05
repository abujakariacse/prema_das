"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "next-themes";

export default function Provider({ children }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
                {children}
            </GoogleOAuthProvider>
        </ThemeProvider>
    );
}