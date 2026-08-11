// app/page.jsx
//
// Customer-facing landing page. Assembles the public sections in order.
// This is a Server Component; the only Client Component is the
// registration form inside InstituteCTA (needs useState + Supabase call).

import Header from "@/components/public/Header";
import Hero from "@/components/public/Hero";
import Services from "@/components/public/Services";
import InstituteCTA from "@/components/public/InstituteCTA";
import Contact from "@/components/public/Contact";
import Footer from "@/components/public/Footer";
import ThreadDivider from "@/components/public/ThreadDivider";

export const metadata = {
  title: "Lalitha Tailoring | Custom Tailoring & Bridal Blouses, Old Perungalathur",
  description:
    "Custom women's tailoring, churidar stitching, bridal blouses and Aari/Zardozi embroidery in Old Perungalathur, Chennai. Serving the neighbourhood since 2007. Rated 4.6+.",
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <ThreadDivider />
        <InstituteCTA />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
