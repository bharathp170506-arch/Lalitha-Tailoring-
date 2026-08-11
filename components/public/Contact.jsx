// components/public/Contact.jsx
//
// Contact/location section. Replace the iframe `src` with your real
// Google Maps embed URL — see the comment above the iframe for how to
// get one.

const HOURS = [
  { day: "Monday – Saturday", time: "10:00 AM – 7:00 PM" },
  { day: "Sunday", time: "Closed" },
];

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-xl">
        <p className="font-mono text-xs tracking-[0.25em] text-maroon uppercase mb-3">
          Find us
        </p>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal">
          Visit the Boutique
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Details */}
        <div className="space-y-8">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wide text-charcoal/50 mb-2">
              Address
            </h3>
            <p className="font-display text-xl text-charcoal leading-snug">
              No:70 B, Near Parvathy Nagar Bus Stop,
              <br />
              Parvathy Nagar, Old Perungalathur,
              <br />
              Chennai – 600063, Tamil Nadu
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wide text-charcoal/50 mb-2">
              Hours
            </h3>
            <dl className="space-y-1">
              {HOURS.map((h) => (
                <div key={h.day} className="flex justify-between max-w-xs font-light">
                  <dt className="text-charcoal/70">{h.day}</dt>
                  <dd className="text-charcoal font-medium">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <a
            href="tel:+91XXXXXXXXXX"
            className="inline-block rounded-sm bg-maroon px-8 py-3 font-body text-sm font-medium tracking-wide text-ivory hover:bg-maroon-dark transition-colors"
          >
            Call the Boutique
          </a>
        </div>

        {/* Map */}
        <div className="w-full h-80 lg:h-full min-h-[320px] rounded-sm overflow-hidden border border-gold/30">
          {/*
            To get your embed URL:
            1. Open Google Maps and search "Lalitha Tailoring, Parvathy Nagar,
               Old Perungalathur" (or the exact address above).
            2. Click Share → Embed a map → Copy HTML.
            3. Paste the `src="..."` value below.
          */}
          <iframe
            title="Lalitha Tailoring location"
            src="https://www.google.com/maps?q=Parvathy+Nagar+Old+Perungalathur+Chennai+600063&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
