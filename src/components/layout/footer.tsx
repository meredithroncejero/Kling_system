"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="border-t border-white/50 bg-white/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <Logo size="md" showLink={false} />
            <p className="font-script text-xl text-kling-forest">
              beads jewelry
            </p>
            <p className="text-sm text-muted-foreground">
              Colorful handcrafted bracelets, charms, necklaces, and keychains
              made with love — one bead at a time.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-kling-forest">Categories</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/?category=Bracelet" className="transition-colors hover:text-kling-pink">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link href="/?category=Charm" className="transition-colors hover:text-kling-blue">
                  Charms
                </Link>
              </li>
              <li>
                <Link href="/?category=Necklace" className="transition-colors hover:text-kling-red">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link href="/?category=Keychain" className="transition-colors hover:text-kling-yellow">
                  Keychains
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-kling-forest">Customer Service</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-kling-green">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition-colors hover:text-kling-pink">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/60 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} KLING beads jewelry. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
