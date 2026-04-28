import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import AuthProvider from "@/app/AuthProvider";
import AppProgress from "@/components/AppProgress";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "Singitronic Storefront",
    description: "Electronics storefront powered by Laravel API",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <StoreProvider>
                    <AuthProvider>
                        <AppProgress />
                        <Toaster />
                        {children}
                    </AuthProvider>
                </StoreProvider>
            </body>
        </html>
    );
}
