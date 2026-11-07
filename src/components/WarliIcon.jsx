import { useMemo } from "react";

/**
 * Small Warli-style AI avatar icon (drop-in replacement for SparklesIcon).
 * Simplified 8-dancer ring so it stays readable at 16-24px.
 * Uses currentColor, so it inherits the parent's text colour
 * (e.g. text-[#8d4624] on the avatar, text-white inside the dialog badge).
 *
 *   <WarliIcon className="w-4 h-4" />            // static (chat avatar)
 *   <WarliIcon className="w-4 h-4" animate />    // animated (loading state)
 */

const N = 8;
const STEP = 360 / N;
const C = 50;

function rot(x, y, deg) {
  const a = (deg * Math.PI) / 180;
  const dx = x - C;
  const dy = y - C;
  return [C + dx * Math.cos(a) - dy * Math.sin(a), C + dx * Math.sin(a) + dy * Math.cos(a)];
}

const KEYFRAMES = `
@keyframes warli-icon-spin { to { transform: rotate(360deg); } }
@keyframes warli-icon-sway {
  0%, 100% { transform: scale(.85); opacity: .6; }
  50%      { transform: scale(1.1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .warli-icon-anim { animation: none !important; }
}
`;

export default function WarliIcon({ className = "w-4 h-4", animate = false }) {
  const dancers = useMemo(() => {
    const end = rot(40, 14, STEP);
    const c2 = rot(35, 19, STEP);
    const arm = `M60 14 C65 19 ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
    return Array.from({ length: N }, (_, i) => ({ i, angle: i * STEP, arm }));
  }, []);

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} overflow-visible`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {animate && <style>{KEYFRAMES}</style>}
      <g
        className={animate ? "warli-icon-anim" : undefined}
        style={
          animate
            ? { transformOrigin: "50px 50px", animation: "warli-icon-spin 9s linear infinite" }
            : undefined
        }
      >
        {dancers.map(({ i, angle, arm }) => (
          <g key={i} transform={`rotate(${angle} ${C} ${C})`}>
            <g
              className={animate ? "warli-icon-anim" : undefined}
              style={
                animate
                  ? {
                      transformBox: "fill-box",
                      transformOrigin: "50% 70%",
                      animation: "warli-icon-sway 1.4s ease-in-out infinite",
                      animationDelay: `${i * 0.12}s`,
                    }
                  : undefined
              }
            >
              <circle cx="50" cy="6" r="5" fill="currentColor" />
              <line x1="50" y1="10" x2="50" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M40 14 L60 14 L50 27 Z" fill="currentColor" />
              <path d="M50 27 L43 38 L57 38 Z" fill="currentColor" />
            </g>
            <path d={arm} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  );
}