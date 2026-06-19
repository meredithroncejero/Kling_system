import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="font-display text-2xl font-semibold text-kling-forest">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="mt-4">
        <Button>Back to Shop</Button>
      </Link>
    </div>
  );
}
