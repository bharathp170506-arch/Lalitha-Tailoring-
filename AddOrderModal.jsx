"use client";

// components/admin/AddOrderModal.jsx
//
// Handles the full "new order" flow in one form:
//   1. Find an existing customer by phone, or create a new one.
//   2. Log a measurement record (fields shown depend on garment type).
//   3. Create the order itself, linked to both.
//
// This mirrors how the shop's paper book actually works: customer →
// measurement → order, all written down together.

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ORDER_TYPES = [
  { value: "blouse_stitching", label: "Blouse Stitching" },
  { value: "churidar_stitching", label: "Churidar Stitching" },
  { value: "bridal_blouse", label: "Bridal Blouse" },
  { value: "aari_work", label: "Aari Work" },
  { value: "zardozi", label: "Zardozi" },
  { value: "chikankari", label: "Chikankari" },
  { value: "alteration", label: "Alteration" },
  { value: "other", label: "Other" },
];

const BLOUSE_FIELDS = [
  ["blouse_length", "Blouse Length"],
  ["chest", "Chest"],
  ["waist", "Waist"],
  ["shoulder", "Shoulder"],
  ["sleeve_length", "Sleeve Length"],
  ["sleeve_round", "Sleeve Round"],
  ["armhole", "Armhole"],
  ["front_neck_depth", "Front Neck Depth"],
  ["back_neck_depth", "Back Neck Depth"],
];

const CHURIDAR_FIELDS = [
  ["churidar_top_length", "Top Length"],
  ["churidar_bottom_length", "Bottom Length"],
  ["hip", "Hip"],
  ["thigh_round", "Thigh Round"],
  ["knee_round", "Knee Round"],
  ["ankle_round", "Ankle Round"],
  ["waist_to_knee", "Waist to Knee"],
];

const emptyMeasurements = {};
[...BLOUSE_FIELDS, ...CHURIDAR_FIELDS].forEach(([key]) => (emptyMeasurements[key] = ""));

export default function AddOrderModal({ onClose, onCreated }) {
  const [step, setStep] = useState("customer"); // customer -> measurements -> order
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState({ name: "", phone_number: "", whatsapp_opt_in: true });
  const [customerId, setCustomerId] = useState(null);
  const [lookupResult, setLookupResult] = useState(null); // null | "not_found" | customer object

  const [garmentType, setGarmentType] = useState("blouse");
  const [measurements, setMeasurements] = useState(emptyMeasurements);

  const [order, setOrder] = useState({
    order_type: "blouse_stitching",
    fabric_received_date: "",
    expected_delivery: "",
    total_amount: "",
    advance_paid: "",
    special_instructions: "",
  });

  // ---- Step 1: look up or create customer ----
  async function handlePhoneLookup() {
    if (!customer.phone_number) return;
    setError("");
    const { data, error: lookupError } = await supabase
      .from("customers")
      .select("*")
      .eq("phone_number", customer.phone_number.trim())
      .maybeSingle();

    if (lookupError) {
      setError("Lookup failed. Check your connection and try again.");
      return;
    }

    if (data) {
      setLookupResult(data);
      setCustomer({ name: data.name, phone_number: data.phone_number, whatsapp_opt_in: data.whatsapp_opt_in });
      setCustomerId(data.id);
    } else {
      setLookupResult("not_found");
    }
  }

  async function handleCustomerSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    let id = customerId;

    if (!id) {
      const { data, error: insertError } = await supabase
        .from("customers")
        .insert({
          name: customer.name.trim(),
          phone_number: customer.phone_number.trim(),
          whatsapp_opt_in: customer.whatsapp_opt_in,
        })
        .select()
        .single();

      if (insertError) {
        setError("Couldn't save customer. Phone number may already exist.");
        setSaving(false);
        return;
      }
      id = data.id;
      setCustomerId(id);
    }

    setSaving(false);
    setStep("measurements");
  }

  // ---- Step 2: measurements ----
  async function handleMeasurementsSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { customer_id: customerId, garment_type: garmentType };
    const relevantFields = garmentType === "churidar" ? CHURIDAR_FIELDS : BLOUSE_FIELDS;
    relevantFields.forEach(([key]) => {
      payload[key] = measurements[key] ? Number(measurements[key]) : null;
    });

    const { error: measurementError } = await supabase.from("measurements").insert(payload);

    if (measurementError) {
      setError("Couldn't save measurements.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setStep("order");
  }

  // ---- Step 3: order ----
  async function handleOrderSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: orderError } = await supabase.from("orders").insert({
      customer_id: customerId,
      order_type: order.order_type,
      fabric_received_date: order.fabric_received_date || null,
      expected_delivery: order.expected_delivery || null,
      total_amount: order.total_amount ? Number(order.total_amount) : 0,
      advance_paid: order.advance_paid ? Number(order.advance_paid) : 0,
      special_instructions: order.special_instructions || null,
      status: "Pending",
    });

    setSaving(false);

    if (orderError) {
      setError("Couldn't create the order. Please try again.");
      return;
    }

    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/50 flex items-center justify-center p-4">
      <div className="bg-ivory w-full max-w-lg rounded-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal/10">
          <h2 className="font-display text-xl font-semibold text-maroon-dark">
            New Order — {step === "customer" ? "Customer" : step === "measurements" ? "Measurements" : "Order Details"}
          </h2>
          <button onClick={onClose} className="text-charcoal/50 hover:text-charcoal" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="p-6">
          {error && <p className="text-sm text-maroon mb-4" role="alert">{error}</p>}

          {/* STEP 1: CUSTOMER */}
          {step === "customer" && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                  Phone number
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={customer.phone_number}
                    onChange={(e) => setCustomer((c) => ({ ...c, phone_number: e.target.value }))}
                    className="flex-1 border border-charcoal/20 px-3 py-2 text-sm rounded-sm"
                    placeholder="10-digit number"
                  />
                  <button
                    type="button"
                    onClick={handlePhoneLookup}
                    className="px-4 py-2 text-sm border border-charcoal/20 rounded-sm hover:bg-charcoal/5"
                  >
                    Look up
                  </button>
                </div>
                {lookupResult === "not_found" && (
                  <p className="text-xs text-charcoal/60 mt-1">New customer — enter their name below.</p>
                )}
                {lookupResult && lookupResult !== "not_found" && (
                  <p className="text-xs text-gold mt-1">Existing customer found: {lookupResult.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!!customerId}
                  value={customer.name}
                  onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                  className="w-full border border-charcoal/20 px-3 py-2 text-sm rounded-sm disabled:bg-charcoal/5"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-charcoal/70">
                <input
                  type="checkbox"
                  checked={customer.whatsapp_opt_in}
                  onChange={(e) => setCustomer((c) => ({ ...c, whatsapp_opt_in: e.target.checked }))}
                />
                Send WhatsApp updates for this order
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-maroon text-ivory rounded-sm py-2.5 text-sm font-medium hover:bg-maroon-dark disabled:opacity-60"
              >
                {saving ? "Saving…" : "Continue to Measurements"}
              </button>
            </form>
          )}

          {/* STEP 2: MEASUREMENTS */}
          {step === "measurements" && (
            <form onSubmit={handleMeasurementsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                  Garment type
                </label>
                <select
                  value={garmentType}
                  onChange={(e) => setGarmentType(e.target.value)}
                  className="w-full border border-charcoal/20 px-3 py-2 text-sm rounded-sm"
                >
                  <option value="blouse">Blouse</option>
                  <option value="churidar">Churidar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(garmentType === "churidar" ? CHURIDAR_FIELDS : BLOUSE_FIELDS).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-[11px] font-mono uppercase tracking-wide text-charcoal/50 mb-1">
                      {label} (in)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements[key]}
                      onChange={(e) => setMeasurements((m) => ({ ...m, [key]: e.target.value }))}
                      className="w-full border border-charcoal/20 px-2 py-1.5 text-sm rounded-sm font-mono"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("customer")}
                  className="px-4 py-2.5 text-sm border border-charcoal/20 rounded-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-maroon text-ivory rounded-sm py-2.5 text-sm font-medium hover:bg-maroon-dark disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Continue to Order"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER */}
          {step === "order" && (
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                  Order type
                </label>
                <select
                  value={order.order_type}
                  onChange={(e) => setOrder((o) => ({ ...o, order_type: e.target.value }))}
                  className="w-full border border-charcoal/20 px-3 py-2 text-sm rounded-sm"
                >
                  {ORDER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                    Fabric received
                  </label>
                  <input
                    type="date"
                    value={order.fabric_received_date}
                    onChange={(e) => setOrder((o) => ({ ...o, fabric_received_date: e.target.value }))}
                    className="w-full border border-charcoal/20 px-3 py-2 text-sm rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                    Expected delivery
                  </label>
                  <input
                    type="date"
                    value={order.expected_delivery}
                    onChange={(e) => setOrder((o) => ({ ...o, expected_delivery: e.target.value }))}
                    className="w-full border border-charcoal/20 px-3 py-2 text-sm rounded-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                    Total amount (₹)
                  </label>
                  <input
                    type="number"
                    value={order.total_amount}
                    onChange={(e) => setOrder((o) => ({ ...o, total_amount: e.target.value }))}
                    className="w-full border border-charcoal/20 px-3 py-2 text-sm rounded-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                    Advance paid (₹)
                  </label>
                  <input
                    type="number"
                    value={order.advance_paid}
                    onChange={(e) => setOrder((o) => ({ ...o, advance_paid: e.target.value }))}
                    className="w-full border border-charcoal/20 px-3 py-2 text-sm rounded-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-charcoal/60 mb-1">
                  Special instructions
                </label>
                <textarea
                  rows={2}
                  value={order.special_instructions}
                  onChange={(e) => setOrder((o) => ({ ...o, special_instructions: e.target.value }))}
                  className="w-full border border-charcoal/20 px-3 py-2 text-sm rounded-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("measurements")}
                  className="px-4 py-2.5 text-sm border border-charcoal/20 rounded-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-maroon text-ivory rounded-sm py-2.5 text-sm font-medium hover:bg-maroon-dark disabled:opacity-60"
                >
                  {saving ? "Creating…" : "Create Order"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
