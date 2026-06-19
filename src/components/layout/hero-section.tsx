import { Logo } from "@/components/layout/logo";

const beads = [
  { color: "bg-kling-blue", size: "h-4 w-4", top: "15%", left: "8%" },
  { color: "bg-kling-pink", size: "h-5 w-5", top: "25%", left: "18%" },
  { color: "bg-kling-green", size: "h-3 w-3", top: "60%", left: "5%" },
  { color: "bg-kling-yellow", size: "h-4 w-4", top: "70%", left: "15%" },
  { color: "bg-kling-red", size: "h-3 w-3", top: "20%", right: "10%" },
  { color: "bg-kling-pink", size: "h-5 w-5", top: "55%", right: "8%" },
  { color: "bg-kling-blue", size: "h-3 w-3", top: "75%", right: "18%" },
  { color: "bg-kling-green", size: "h-4 w-4", top: "35%", right: "5%" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/50 bg-gradient-to-b from-white/80 via-kling-pink/5 to-background py-12 md:py-20">
      {beads.map((bead, i) => (
        <span
          key={i}
          className={`kling-bead ${bead.color} ${bead.size} shadow-bead`}
          style={{
            top: bead.top,
            left: bead.left,
            right: bead.right,
          }}
        />
      ))}

      <div className="container relative mx-auto px-4 text-center">
        <Logo size="hero" showLink={false} className="mx-auto" />
        <p className="mt-2 font-script text-2xl text-kling-forest md:text-3xl">
          beads jewelry
        </p>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-kling-forest md:text-4xl">
          Colorful Handmade Pieces,
          <span className="kling-gradient-text"> Made with Love</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          Discover our playful collection of bracelets, charms, necklaces, and
          keychains — each one strung with care, just like our logo.
        </p>
      </div>
    </section>
  );
}
