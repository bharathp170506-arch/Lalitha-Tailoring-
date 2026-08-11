// components/public/ThreadDivider.jsx
//
// The recurring "running stitch" motif used to separate sections
// across the site instead of a plain rule. Keeps the tailoring theme
// present in a quiet, structural way rather than as decoration.

export default function ThreadDivider({ className = "" }) {
  return (
    <div className={`w-full flex justify-center py-2 ${className}`}>
      <div className="stitch-divider max-w-xs" aria-hidden="true" />
    </div>
  );
}
