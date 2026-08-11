// components/public/Hero.jsx
//
// Hero section: leads with the shop's real thesis — 19 years of trust
// in one neighbourhood, not a generic "welcome to our website" banner.

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-maroon text-ivory">
      {/* Subtle background texture: large soft gold ring, evokes a
          blouse's neckline embroidery hoop without being literal */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border-[24px] border-gold/20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full border-[16px] border-gold/10"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <p className="font-mono text-xs tracking-[0.25em] text-gold-light uppercase mb-6">
          Est. 2007 · Old Perungalathur, Chennai
        </p>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.05] font-semibold max-w-3xl">
          Serving Old Perungalathur
          <br />
          <span className="italic text-gold-light">since 2007.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-ivory/85 font-light leading-relaxed">
          Two decades of hand-fitted blouses, churidars and bridal wear —
          stitched, embroidered, and finished by the same trusted hands your
          neighbours have relied on for years. Rated 4.6+ by the families of
          Parvathy Nagar.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#contact"
            className="rounded-sm bg-gold px-8 py-3 font-body text-sm font-medium tracking-wide text-maroon-dark hover:bg-gold-light transition-colors"
          >
            Visit the Boutique
          </a>
          <a
            href="#institute"
            className="rounded-sm border border-ivory/40 px-8 py-3 font-body text-sm font-medium tracking-wide text-ivory hover:bg-ivory/10 transition-colors"
          >
            Join the Institute
          </a>
        </div>

        <div className="mt-14 flex items-center gap-3 text-sm text-ivory/70">
          <span className="font-mono text-gold-light text-base">★ 4.6+</span>
          <span>rating across local directories</span>
        </div>
      </div>
    </section>
  );
}
