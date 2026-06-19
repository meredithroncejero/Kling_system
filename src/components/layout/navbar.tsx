"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { signOut } from "@/actions/auth";
import type { Profile } from "@/types";
import { cn } from "@/lib/utils";

interface NavbarProps {
  cartCount: number;
  user: Profile | null;
}

export function Navbar({ cartCount, user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Shop" },
    ...(user ? [{ href: "/dashboard", label: "My Orders" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex h-[4.5rem] items-center justify-between px-4">
        <Logo size="sm" />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-kling-forest/70 transition-colors hover:bg-kling-pink/15 hover:text-kling-forest"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-kling-pink/15"
            >
              <ShoppingBag className="h-5 w-5 text-kling-forest" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-kling-pink text-[10px] font-bold text-kling-forest shadow-bead">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="max-w-[140px] truncate text-sm font-medium text-kling-forest/70">
                {user.full_name || user.email}
              </span>
              <form action={signOut}>
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  className="rounded-full hover:bg-kling-pink/15"
                >
                  <LogOut className="h-4 w-4 text-kling-forest" />
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button
                size="sm"
                className="rounded-full bg-kling-pink font-semibold text-kling-forest shadow-kling hover:bg-kling-pink/90"
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/50 bg-white/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold",
                  "text-kling-forest hover:bg-kling-pink/15"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.href === "/admin" && <LayoutDashboard className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
            {user ? (
              <form action={signOut}>
                <Button
                  variant="outline"
                  size="sm"
                  type="submit"
                  className="w-full rounded-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button
                  size="sm"
                  className="w-full rounded-full bg-kling-pink font-semibold text-kling-forest"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
