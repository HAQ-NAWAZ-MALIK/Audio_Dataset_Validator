import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Audio Dataset Validator",
    description: "Professional audio quality analysis for TTS/ASR datasets",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} gradient-bg min-h-screen`}>
                {children}
                <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                    toastOptions={{
                        style: {
                            background: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            color: 'hsl(var(--foreground))',
                        },
                    }}
                />
            </body>
        </html>
    );
}
