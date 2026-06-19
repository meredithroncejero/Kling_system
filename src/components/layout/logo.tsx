import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "hero";
  showLink?: boolean;
  className?: string;
}

const sizes = {
  sm: { width: 120, height: 48, className: "h-10 w-auto" },
  md: { width: 160, height: 64, className: "h-14 w-auto" },
  lg: { width: 200, height: 80, className: "h-20 w-auto" },
  hero: { width: 280, height: 112, className: "h-28 w-auto md:h-36" },
};

export function Logo({ size = "md", showLink = true, className }: LogoProps) {
  const { width, height, className: sizeClass } = sizes[size];

  const image = (
    <Image
      src="/images/kling-logo.png"
      alt="KLING beads jewelry"
      width={width}
      height={height}
      className={cn(sizeClass, "object-contain", className)}
      priority={size === "hero" || size === "md"}
    />
  );

  if (!showLink) return image;

  return (
    <Link href="/" className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90">
      {image}
    </Link>
  );
}
