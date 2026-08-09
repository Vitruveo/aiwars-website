/*
 * AI WARS wordmark set in Gugi. The "I" is Zoom blue and slanted, nestling
 * between the A and W. Size via font-size utilities on className.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span aria-label="AI WARS" role="img" className={`logo-mark ${className}`}>
      A<span aria-hidden="true" className="logo-i">I</span>WARS
    </span>
  );
}
