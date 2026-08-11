"use client";

// components/public/InstituteCTA.jsx
//
// Promotes "Lalitha Tailoring Institute" and lets a visitor register
// for a class directly. Submits straight into institute_enrollments —
// this is the one table the public anon key is allowed to INSERT into
// (see RLS policy in sql/schema.sql).

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ThreadDivider from "./ThreadDivider";

const COURSES = [
  { value: "basic_stitching", label: "Basic Stitching" },
  { value: "advanced_stitching", label: "Advanced Stitching" },
  { value: "aari_work", label: "Aari Work" },
  { value: "combo", label: "Stitching + Aari Combo" },
];

const BATCHES = [
  "Morning (10AM-12PM)",
  "Afternoon (1PM-3PM)",
  "Evening (4PM-6PM)",
];

const initialForm = {
  student_name: "",
  phone_number: "",
  course_type: "basic_stitching",
  batch_timing: BATCHES[0],
};

export default function InstituteCTA() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | saving | success | error
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    const { error } = await supabase.from("institute_enrollments").insert({
      student_name: form.student_name.trim(),
      phone_number: form.phone_number.trim(),
      course_type: form.course_type,
      batch_timing: form.batch_timing,
    });

    if (error) {
      setStatus("error");
      setErrorMessage("Couldn't submit your registration. Please call us instead.");
      return;
    }

    setStatus("success");
    setForm(initialForm);
  }

  return (
    <section id="institute" className="bg-charcoal text-ivory">
      <div className="mx-auto max-w-6xl px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: pitch */}
        <div>
          <p className="font-mono text-xs tracking-[0.25em] text-gold-light uppercase mb-3">
            New — Lalitha Tailoring Institute
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold">
            Learn the craft, <span className="italic text-gold-light">from us.</span>
          </h2>
          <p className="mt-5 text-ivory/75 font-light leading-relaxed max-w-md">
            Small-batch classes in stitching and Aari embroidery, taught in
            the same boutique that's fitted this neighbourhood for 19 years.
            Morning, afternoon and evening batches available.
          </p>

          <ThreadDivider className="justify-start ml-0 [&>div]:max-w-[160px]" />

          <ul className="mt-4 space-y-2 text-sm text-ivory/70 font-light">
            <li>• Basic & Advanced Stitching batches</li>
            <li>• Dedicated Aari Work batch</li>
            <li>• Small class sizes, hands-on teaching</li>
          </ul>
        </div>

        {/* Right: registration form */}
        <div className="bg-ivory text-charcoal rounded-sm p-8">
          <h3 className="font-display text-2xl font-semibold text-maroon-dark">
            Register for a class
          </h3>

          {status === "success" ? (
            <div className="mt-6 rounded-sm bg-gold-soft border border-gold/40 p-4 text-sm">
              <p className="font-medium text-maroon-dark">You're registered.</p>
              <p className="mt-1 text-charcoal/75">
                We'll call you on {form.phone_number || "your number"} to
                confirm your batch. You can also just walk in and ask for the
                Institute desk.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="student_name" className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                  Full name
                </label>
                <input
                  id="student_name"
                  type="text"
                  required
                  value={form.student_name}
                  onChange={(e) => updateField("student_name", e.target.value)}
                  className="w-full border border-charcoal/20 bg-white px-3 py-2 text-sm rounded-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                  Phone number
                </label>
                <input
                  id="phone_number"
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  title="10-digit phone number"
                  value={form.phone_number}
                  onChange={(e) => updateField("phone_number", e.target.value)}
                  className="w-full border border-charcoal/20 bg-white px-3 py-2 text-sm rounded-sm"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label htmlFor="course_type" className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                  Course
                </label>
                <select
                  id="course_type"
                  value={form.course_type}
                  onChange={(e) => updateField("course_type", e.target.value)}
                  className="w-full border border-charcoal/20 bg-white px-3 py-2 text-sm rounded-sm"
                >
                  {COURSES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="batch_timing" className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                  Preferred batch
                </label>
                <select
                  id="batch_timing"
                  value={form.batch_timing}
                  onChange={(e) => updateField("batch_timing", e.target.value)}
                  className="w-full border border-charcoal/20 bg-white px-3 py-2 text-sm rounded-sm"
                >
                  {BATCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {status === "error" && (
                <p className="text-sm text-maroon" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "saving"}
                className="w-full rounded-sm bg-maroon px-6 py-3 text-sm font-medium text-ivory tracking-wide hover:bg-maroon-dark transition-colors disabled:opacity-60"
              >
                {status === "saving" ? "Submitting…" : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
