// components/public/Header.jsx

const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#institute", label: "Institute" },
  { href: "#contact", label: "Visit" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-ivory/90 backdrop-blur border-b border-gold/25">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <a href="#" className="font-display text-2xl font-semibold text-maroon-dark">
          Lalitha Tailoring
        </a>
        <nav className="hidden sm:flex items-center gap-8 font-body text-sm text-charcoal/80">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-maroon transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="sm:hidden rounded-sm bg-maroon px-4 py-2 text-xs font-medium text-ivory"
        >
          Visit
        </a>
      </div>
    </header>
  );
}
