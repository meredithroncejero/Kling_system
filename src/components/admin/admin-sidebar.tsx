"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Warehouse,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/auth";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/50 bg-white/70 backdrop-blur-sm md:flex min-h-screen">
      <div className="flex-1">
        <div className="border-b border-white/50 p-5">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/images/kling-logo.png"
              alt="KLING"
              width={48}
              height={48}
              className="h-10 w-10 rounded-full object-cover shadow-bead"
            />
            <div>
              <p className="font-display text-sm font-bold text-kling-forest">Admin Panel</p>
              <p className="font-script text-base leading-none text-kling-forest/70">
                beads jewelry
              </p>
            </div>
          </Link>
        </div>
        <nav className="space-y-1 p-3">
          {adminLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                pathname === href
                  ? "bg-kling-pink text-kling-forest shadow-kling"
                  : "text-kling-forest/70 hover:bg-kling-pink/15 hover:text-kling-forest"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/50 p-3 mt-auto">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
