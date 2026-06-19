import type { Metadata } from "next";
import { Fredoka, Nunito, Caveat } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/actions/auth";
import { getCartCount } from "@/actions/cart";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "KLING beads jewelry | Handmade Bracelets & Accessories",
  description:
    "Shop colorful handcrafted bracelets, charms, necklaces, and keychains from KLING beads jewelry.",
  icons: {
    icon: "/images/kling-logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, cartCount] = await Promise.all([getCurrentUser(), getCartCount()]);

  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} ${nunito.variable} ${caveat.variable} font-sans antialiased`}
      >
        <Navbar cartCount={cartCount} user={user} />
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
