"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/custom-requests", label: "Custom Requests", icon: Sparkles },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminMobileHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/50 bg-white/70 px-4 backdrop-blur-sm md:hidden">
        <Link href="/admin" className="font-display font-bold text-kling-forest">
          Admin Panel
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="border-b border-white/50 bg-white/95 px-4 py-4 md:hidden animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-2">
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-kling-forest/70 hover:bg-kling-pink/15 hover:text-kling-forest"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <form action={signOut} className="mt-2 border-t pt-2">
              <Button type="submit" variant="destructive" size="sm" className="w-full rounded-xl">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </nav>
        </div>
      )}
    </>
  );
}
