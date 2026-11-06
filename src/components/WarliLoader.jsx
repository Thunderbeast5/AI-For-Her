import { useMemo } from "react";

/**
 * Warli-style loader (React + Tailwind).
 *
 * Usage:
 *   <WarliLoader />                         // default 220px, rust brown
 *   <WarliLoader size={120} />              // custom size (px)
 *   <WarliLoader className="text-amber-800" /> // colour via Tailwind text-* class
 *
 * Full-screen overlay example:
 *   {loading && (
 *     <div className="fixed inset-0 z-50 grid place-items-center bg-white">
 *       <WarliLoader size={240} />
 *     </div>
 *   )}
 *
 * No tailwind.config changes needed: keyframes are injected by the <style> tag below.
 */

const N = 16;
const STEP = 360 / N;
const CX = 200;
const CY = 200;

function rot(x, y, deg) {
  const a = (deg * Math.PI) / 180;
  const dx = x - CX;
  const dy = y - CY;
  return [CX + dx * Math.cos(a) - dy * Math.sin(a), CY + dx * Math.sin(a) + dy * Math.cos(a)];
}

const KEYFRAMES = `
@keyframes warli-spin { to { transform: rotate(360deg); } }
@keyframes warli-sway {
  0%, 100% { transform: scale(.82) rotate(-5deg); opacity: .55; }
  50%      { transform: scale(1.08) rotate(5deg); opacity: 1; }
}
@keyframes warli-arm {
  0%       { stroke-dashoffset: 1; }
  35%, 70% { stroke-dashoffset: 0; }
  100%     { stroke-dashoffset: -1; }
}
@keyframes warli-ray {
  0%       { stroke-dashoffset: 1; }
  45%, 65% { stroke-dashoffset: 0; }
  100%     { stroke-dashoffset: -1; }
}
@media (prefers-reduced-motion: reduce) {
  .warli-anim { animation: none !important; }
  .warli-draw { stroke-dashoffset: 0 !important; }
}
`;

export default function WarliLoader({ size = 220, className = "text-[#8b3a14]" }) {
  const dancers = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const end = rot(180, 38, STEP);
        const c2 = rot(168, 52, STEP);
        return {
          i,
          angle: i * STEP,
          arm: `M220 38 C232 52 ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`,
        };
      }),
    []
  );

  const rays = [-7, 0, 7];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <style>{KEYFRAMES}</style>
      <svg viewBox="0 0 400 400" className="block h-full w-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
        <g
          className="warli-anim animate-[warli-spin_14s_linear_infinite]"
          style={{ transformOrigin: "200px 200px" }}
        >
          {dancers.map(({ i, angle, arm }) => (
            <g key={i} transform={`rotate(${angle} ${CX} ${CY})`}>
              {/* dancer */}
              <g
                className="warli-anim animate-[warli-sway_1.6s_ease-in-out_infinite]"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  transformBox: "fill-box",
                  transformOrigin: "50% 70%",
                }}
              >
                <ellipse cx="200" cy="17" rx="10" ry="8" fill="currentColor" />
                <line x1="200" y1="24" x2="200" y2="38" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <path d="M180 38 L220 38 L200 68 Z" fill="currentColor" />
                <path d="M200 68 L185 104 L215 104 Z" fill="currentColor" />
              </g>

              {/* arm to next dancer */}
              <path
                d={arm}
                pathLength={1}
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="1"
                strokeDashoffset="1"
                className="warli-anim warli-draw animate-[warli-arm_3.2s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.1}s` }}
              />

              {/* inner rays */}
              {rays.map((off, j) => {
                const wob = j % 2 ? 3 : -3;
                return (
                  <path
                    key={j}
                    d={`M${200 + off} 110 C ${200 + off + wob} 120 ${200 + off - wob} 130 ${200 + off * 0.6} 142`}
                    pathLength={1}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    className="warli-anim warli-draw animate-[warli-ray_2.4s_ease-in-out_infinite]"
                    style={{ animationDelay: `${i * 0.08 + j * 0.12}s` }}
                  />
                );
              })}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}