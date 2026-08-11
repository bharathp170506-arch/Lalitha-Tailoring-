// components/public/Services.jsx
//
// Services grid. Each card names the craft plainly — no marketing
// fluff — since a returning customer already knows what they want.

const SERVICES = [
  {
    title: "Bridal Blouses",
    description:
      "Custom-fitted bridal and reception blouses, designed around your saree and finished with hand embroidery on request.",
  },
  {
    title: "Churidar Stitching",
    description:
      "Everyday and festive churidars, cut to your exact measurements from our own record book — no repeat fittings needed.",
  },
  {
    title: "Aari & Zardozi Work",
    description:
      "Hand embroidery in Aari, Zardozi and Chikankari styles, done in-house by our embroidery artisans.",
  },
  {
    title: "Alterations",
    description:
      "Resizing, refitting and repairs for blouses, churidars and sarees — quick turnaround for last-minute occasions.",
  },
];

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-xl">
        <p className="font-mono text-xs tracking-[0.25em] text-maroon uppercase mb-3">
          What we stitch
        </p>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal">
          Our Services
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-px bg-gold/30">
        {SERVICES.map((service, i) => (
          <div key={service.title} className="bg-ivory p-8 sm:p-10">
            <span className="font-mono text-xs text-gold">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-2xl font-semibold mt-3 text-maroon-dark">
              {service.title}
            </h3>
            <p className="mt-3 text-charcoal/75 font-light leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
