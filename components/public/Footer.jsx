// components/public/Footer.jsx

export default function Footer() {
  return (
    <footer className="bg-maroon-dark text-ivory/70">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-display text-lg text-ivory">Lalitha Tailoring</p>
        <p className="text-xs font-light">
          © {new Date().getFullYear()} Lalitha Tailoring · Old Perungalathur, Chennai · Since 2007
        </p>
      </div>
    </footer>
  );
}
