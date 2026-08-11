// app/admin/page.jsx
//
// Admin dashboard entry point at /admin. In production, wrap this
// route in an auth check (Supabase Auth) before launch — see the
// "Securing /admin" note in README.md. For now it renders the board
// directly so you can wire up auth on your own timeline.

import OrderBoard from "@/components/admin/OrderBoard";

export const metadata = {
  title: "Admin | Lalitha Tailoring",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <OrderBoard />;
}
