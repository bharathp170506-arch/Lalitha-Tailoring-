"use client";

// components/admin/OrderBoard.jsx
//
// The admin's main workspace: a Kanban-style board with one column per
// status. Replaces the paper order book — the owner can see the whole
// shop's workload at a glance and move orders forward with one click.

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import OrderCard from "./OrderCard";
import AddOrderModal from "./AddOrderModal";

const COLUMNS = ["Pending", "Cutting", "Stitching", "Finishing", "Ready for Pickup", "Delivered"];

export default function OrderBoard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    // Pull orders together with the customer's name in one query via
    // Supabase's foreign-table select syntax (relies on the FK
    // orders.customer_id -> customers.id).
    const { data, error: fetchError } = await supabase
      .from("orders")
      .select("*, customers(name, phone_number)")
      .order("expected_delivery", { ascending: true, nullsFirst: false });

    if (fetchError) {
      setError("Couldn't load orders. Check your Supabase connection.");
    } else {
      setOrders(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    // Live updates: if another staff member (or the customer-facing
    // form) changes an order, reflect it here without a manual refresh.
    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  async function updateStatus(orderId, newStatus) {
    // Optimistic update so the board feels instant
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    const patch = { status: newStatus };
    if (newStatus === "Delivered") patch.delivered_at = new Date().toISOString();

    const { error: updateError } = await supabase.from("orders").update(patch).eq("id", orderId);
    if (updateError) {
      setError("Couldn't update order status — refreshing.");
      fetchOrders();
    }
  }

  return (
    <div className="min-h-screen bg-charcoal/[0.03] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-maroon-dark">
            Order Management Board
          </h1>
          <p className="text-sm text-charcoal/60 mt-1">
            {orders.length} active {orders.length === 1 ? "order" : "orders"} on the book
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-maroon text-ivory px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-maroon-dark"
        >
          + New Order
        </button>
      </div>

      {error && (
        <p className="text-sm text-maroon bg-maroon/10 border border-maroon/20 rounded-sm px-4 py-2 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-charcoal/50">Loading orders…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {COLUMNS.map((status) => {
            const columnOrders = orders.filter((o) => o.status === status);
            return (
              <div key={status} className="bg-white/60 rounded-sm p-3 min-h-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-mono uppercase tracking-wide text-charcoal/60">
                    {status}
                  </h2>
                  <span className="text-xs font-mono text-charcoal/40">{columnOrders.length}</span>
                </div>
                <div className="space-y-3">
                  {columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAdvance={updateStatus}
                      onRevert={updateStatus}
                    />
                  ))}
                  {columnOrders.length === 0 && (
                    <p className="text-xs text-charcoal/30 italic">No orders here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddOrderModal onClose={() => setShowAddModal(false)} onCreated={fetchOrders} />
      )}
    </div>
  );
}
