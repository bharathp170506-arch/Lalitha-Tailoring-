"use client";

// components/admin/OrderCard.jsx
//
// A single order's card on the Kanban board. Shows just enough to
// triage at a glance; full detail happens in the customer's record.

const STATUS_FLOW = [
  "Pending",
  "Cutting",
  "Stitching",
  "Finishing",
  "Ready for Pickup",
  "Delivered",
];

function nextStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

function prevStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  return idx > 0 ? STATUS_FLOW[idx - 1] : null;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function OrderCard({ order, onAdvance, onRevert }) {
  const balance = Number(order.total_amount || 0) - Number(order.advance_paid || 0);
  const isOverdue =
    order.expected_delivery &&
    order.status !== "Delivered" &&
    new Date(order.expected_delivery) < new Date();

  const next = nextStatus(order.status);
  const prev = prevStatus(order.status);

  return (
    <div className="bg-white border border-charcoal/10 rounded-sm p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm text-charcoal">
            {order.customers?.name ?? "Unknown customer"}
          </p>
          <p className="font-mono text-[11px] text-charcoal/50 mt-0.5">
            {order.order_number}
          </p>
        </div>
        {isOverdue && (
          <span className="text-[10px] font-mono uppercase tracking-wide bg-maroon/10 text-maroon px-1.5 py-0.5 rounded-sm">
            Overdue
          </span>
        )}
      </div>

      <p className="text-xs text-charcoal/70 mt-2 capitalize">
        {order.order_type?.replaceAll("_", " ")}
      </p>

      <div className="mt-3 flex items-center justify-between text-xs text-charcoal/60">
        <span>Due {formatDate(order.expected_delivery)}</span>
        <span className={balance > 0 ? "text-maroon font-medium" : "text-charcoal/40"}>
          {balance > 0 ? `₹${balance.toLocaleString("en-IN")} due` : "Paid"}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {prev && (
          <button
            onClick={() => onRevert(order.id, prev)}
            className="text-xs px-2 py-1 border border-charcoal/15 rounded-sm text-charcoal/60 hover:bg-charcoal/5"
            aria-label={`Move back to ${prev}`}
          >
            ← {prev}
          </button>
        )}
        {next && (
          <button
            onClick={() => onAdvance(order.id, next)}
            className="text-xs px-2 py-1 bg-maroon text-ivory rounded-sm hover:bg-maroon-dark ml-auto"
            aria-label={`Move to ${next}`}
          >
            {next} →
          </button>
        )}
      </div>
    </div>
  );
}
