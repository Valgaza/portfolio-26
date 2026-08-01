/**
 * SiriOrb — a small shimmering gradient orb (two spinning conic-gradient layers,
 * blurred and clipped to a circle). Styling + keyframes live in globals.css
 * (`.siri-orb`); this just sizes the element. Reduced-motion safe (the spin is
 * disabled in CSS). Adapted from the smoothui SiriOrb referenced in the pill.
 */
export default function SiriOrb({ size = 40 }: { size?: number }) {
  return (
    <span className="siri-orb" style={{ width: size, height: size }} aria-hidden />
  );
}
