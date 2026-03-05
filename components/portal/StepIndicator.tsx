"use client";

const ORANGE      = "#FF7A00";
const ORANGE_GLOW = "rgba(255,122,0,0.5)";

interface Step { number: number; label: string; sub: string; }

const STEPS: Step[] = [
  { number: 1, label: "Matter Info",      sub: "Case details"  },
  { number: 2, label: "Specs",            sub: "Format & delivery" },
  { number: 3, label: "File Transfer",    sub: "Secure upload"  },
  { number: 4, label: "Confirm",          sub: "Review & submit" },
];

interface StepIndicatorProps { currentStep: number; }

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Form progress" className="w-full font-sans">
      <ol className="flex items-center w-full" role="list">
        {STEPS.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isActive    = step.number === currentStep;

          return (
            <li
              key={step.number}
              className="flex items-center flex-1"
              aria-current={isActive ? "step" : undefined}
            >
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                {/* Dot */}
                <div className="relative flex items-center justify-center">
                  {/* Ping ring — active only */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{
                        animation: "dot-ping 2s cubic-bezier(0,0,0.2,1) infinite",
                        background: ORANGE,
                        opacity: 0.4,
                      }}
                      aria-hidden
                    />
                  )}
                  <div
                    className="relative flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold transition-all duration-300"
                    style={
                      isCompleted
                        ? {
                            background: ORANGE,
                            color: "#07090F",
                            boxShadow: `0 0 8px ${ORANGE_GLOW}`,
                          }
                        : isActive
                        ? {
                            background: "#07090F",
                            color: ORANGE,
                            border: `2px solid ${ORANGE}`,
                            boxShadow: `0 0 12px ${ORANGE_GLOW}, inset 0 0 6px rgba(255,122,0,0.1)`,
                            animation: "glow-pulse 2s ease-in-out infinite",
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            color: "#334155",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }
                    }
                  >
                    {isCompleted ? (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M2 6l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : step.number}
                  </div>
                </div>

                {/* Label */}
                <span
                  className="text-[10px] font-medium text-center whitespace-nowrap hidden sm:block"
                  style={{
                    color: isActive ? "#F1F5F9" : isCompleted ? ORANGE : "#334155",
                    textShadow: isActive ? `0 0 8px rgba(255,122,0,0.5)` : "none",
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div
                  className="flex-1 h-px mx-2 transition-all duration-500"
                  style={{
                    background: isCompleted
                      ? `linear-gradient(90deg, ${ORANGE}, rgba(255,122,0,0.4))`
                      : "rgba(255,255,255,0.06)",
                    boxShadow: isCompleted ? `0 0 4px ${ORANGE_GLOW}` : "none",
                  }}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
