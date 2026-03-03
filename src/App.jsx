import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const factorial = (n) => {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

const poisson = (lambda, k) => {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
};

const generateData = (lambda) => {
  // Extend far enough that the tail probability is negligible (<0.1%)
  const maxK = Math.max(15, Math.ceil(lambda + 4 * Math.sqrt(lambda) + 2));
  const data = [];
  for (let k = 0; k <= maxK; k++) {
    const prob = poisson(lambda, k);
    data.push({
      k,
      probability: parseFloat((prob * 100).toFixed(2)),
      label: `${k}`,
    });
  }
  return data;
};

/* ── Fraction-style formula display ── */
const FractionFormula = ({ numeratorLeft, numeratorRight, denominator, color = "#e2e8f0", size = "md" }) => {
  const sizes = {
    sm: { main: "14px", sup: "10px", line: "1px" },
    md: { main: "18px", sup: "12px", line: "1.5px" },
    lg: { main: "22px", sup: "14px", line: "2px" },
  };
  const s = sizes[size];
  return (
    <span style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      verticalAlign: "middle",
      fontFamily: "'Space Mono', monospace",
      lineHeight: 1.3,
    }}>
      <span style={{ fontSize: s.main, color, padding: "0 4px" }}>
        {numeratorLeft}{numeratorRight}
      </span>
      <span style={{
        width: "100%",
        height: s.line,
        background: "rgba(148, 163, 184, 0.4)",
        margin: "3px 0",
      }} />
      <span style={{ fontSize: s.main, color, padding: "0 4px" }}>
        {denominator}
      </span>
    </span>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: "rgba(15, 15, 25, 0.95)",
        border: "1px solid rgba(99, 179, 237, 0.3)",
        borderRadius: "10px",
        padding: "12px 16px",
        fontFamily: "'DM Sans', sans-serif",
        backdropFilter: "blur(10px)",
      }}>
        <p style={{ color: "#63b3ed", fontSize: "13px", margin: 0, fontWeight: 600 }}>
          {d.k} customers
        </p>
        <p style={{ color: "#e2e8f0", fontSize: "18px", margin: "4px 0 0", fontWeight: 700 }}>
          {d.probability}% chance
        </p>
        <p style={{ color: "#64748b", fontSize: "11px", margin: "6px 0 0" }}>
          Click bar to see working
        </p>
      </div>
    );
  }
  return null;
};

/* ── Definition Section ── */
const DefinitionSection = () => (
  <div style={{
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "28px 28px 24px",
    marginBottom: "24px",
  }}>
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "18px" }}>
      <div style={{
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        background: "rgba(99, 179, 237, 0.1)",
        border: "1px solid rgba(99, 179, 237, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        flexShrink: 0,
      }}>
        📖
      </div>
      <div>
        <h3 style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: 600, margin: "0 0 8px" }}>
          What is the Poisson Distribution?
        </h3>
        <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
          The Poisson distribution predicts <strong style={{ color: "#63b3ed" }}>how many times</strong> a random event will happen in a fixed interval of time or space. It's used when events occur independently, at a constant average rate, and one at a time.
        </p>
      </div>
    </div>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "10px",
    }}>
      {[
        { icon: "☕", title: "Example", desc: "Customers arriving at a coffee shop per minute" },
        { icon: "λ", title: "Key input", desc: "The average rate — how many events you typically expect", mono: true },
        { icon: "?", title: "Key output", desc: "The probability of seeing exactly k events in that interval", mono: true },
      ].map((item) => (
        <div key={item.title} style={{
          background: "rgba(99, 179, 237, 0.04)",
          border: "1px solid rgba(99, 179, 237, 0.08)",
          borderRadius: "10px",
          padding: "12px 14px",
        }}>
          <div style={{
            fontSize: item.mono ? "16px" : "15px",
            fontFamily: item.mono ? "'Space Mono', monospace" : "inherit",
            color: "#63b3ed",
            fontWeight: 700,
            marginBottom: "4px",
          }}>{item.icon} <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, fontFamily: "'Space Mono', monospace", letterSpacing: "0.5px" }}>{item.title.toUpperCase()}</span></div>
          <p style={{ color: "#94a3b8", fontSize: "12.5px", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
        </div>
      ))}
    </div>

    <div style={{
      marginTop: "16px",
      padding: "10px 14px",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "8px",
      border: "1px solid rgba(255,255,255,0.04)",
    }}>
      <p style={{ color: "#64748b", fontSize: "12.5px", lineHeight: 1.6, margin: 0 }}>
        <strong style={{ color: "#94a3b8" }}>Three conditions:</strong>{" "}
        Events happen one at a time · Each event is independent of others · The average rate stays constant
      </p>
    </div>
  </div>
);

/* ── Formula Section ── */
const FormulaSection = ({ lambda, selectedK }) => {
  if (selectedK === null) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        padding: "32px 24px",
        marginTop: "20px",
      }}>
        <h3 style={{
          color: "#f1f5f9",
          fontSize: "16px",
          fontWeight: 600,
          margin: "0 0 24px",
          textAlign: "center",
        }}>
          The Poisson Formula
        </h3>
        <div style={{
          textAlign: "center",
          padding: "24px 20px",
          background: "rgba(99, 179, 237, 0.04)",
          borderRadius: "12px",
          border: "1px solid rgba(99, 179, 237, 0.1)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontFamily: "'Space Mono', monospace",
            fontSize: "20px",
            color: "#e2e8f0",
            flexWrap: "wrap",
          }}>
            <span><span style={{ color: "#63b3ed" }}>P</span>(X = k)</span>
            <span style={{ color: "#64748b" }}>=</span>
            <FractionFormula
              numeratorLeft={<><span style={{ color: "#f6ad55" }}>e</span><sup style={{ fontSize: "12px" }}>−λ</sup> · λ<sup style={{ fontSize: "12px" }}>k</sup></>}
              denominator={<>k!</>}
              size="md"
            />
          </div>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}>
            {[
              { symbol: "λ", desc: "average rate", color: "#63b3ed" },
              { symbol: "k", desc: "count we want", color: "#63b3ed" },
              { symbol: "e", desc: "Euler's number ≈ 2.718", color: "#f6ad55" },
              { symbol: "k!", desc: "k factorial", color: "#63b3ed" },
            ].map((item) => (
              <div key={item.symbol} style={{ textAlign: "center" }}>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  color: item.color,
                  fontSize: "16px",
                  fontWeight: 700,
                }}>{item.symbol}</span>
                <br />
                <span style={{ color: "#64748b", fontSize: "11px" }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{
          color: "#64748b",
          fontSize: "13px",
          textAlign: "center",
          marginTop: "16px",
        }}>
          👆 Click any bar in the chart to see the numbers plugged in
        </p>
      </div>
    );
  }

  const k = selectedK;
  const eLambda = Math.exp(-lambda);
  const lambdaK = Math.pow(lambda, k);
  const kFact = factorial(k);
  const result = poisson(lambda, k);
  const factorialString = k <= 1 ? `1` : Array.from({ length: k }, (_, i) => k - i).join(" × ");

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(99, 179, 237, 0.15)",
      borderRadius: "16px",
      padding: "32px 24px",
      marginTop: "20px",
      transition: "all 0.3s ease",
    }}>
      <h3 style={{
        color: "#f1f5f9",
        fontSize: "16px",
        fontWeight: 600,
        margin: "0 0 6px",
        textAlign: "center",
      }}>
        Calculating P(X = {k}) with λ = {lambda}
      </h3>
      <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center", margin: "0 0 24px" }}>
        "What's the probability of exactly <span style={{ color: "#63b3ed", fontWeight: 600 }}>{k}</span> customer{k !== 1 ? "s" : ""} arriving?"
      </p>

      {/* Generic formula — fraction style */}
      <div style={{
        textAlign: "center",
        padding: "18px 14px",
        background: "rgba(99, 179, 237, 0.04)",
        borderRadius: "10px",
        border: "1px solid rgba(99, 179, 237, 0.08)",
        marginBottom: "12px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          fontFamily: "'Space Mono', monospace",
          fontSize: "16px",
          color: "#94a3b8",
        }}>
          <span>P(X = k)</span>
          <span style={{ color: "#64748b" }}>=</span>
          <FractionFormula
            numeratorLeft={<><span style={{ color: "#f6ad55" }}>e</span><sup style={{ fontSize: "10px" }}>−λ</sup> · λ<sup style={{ fontSize: "10px" }}>k</sup></>}
            denominator={<>k!</>}
            color="#94a3b8"
            size="sm"
          />
        </div>
      </div>

      {/* Plugged in — fraction style */}
      <div style={{
        textAlign: "center",
        padding: "18px 14px",
        background: "rgba(99, 179, 237, 0.06)",
        borderRadius: "10px",
        border: "1px solid rgba(99, 179, 237, 0.12)",
        marginBottom: "20px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          fontFamily: "'Space Mono', monospace",
          fontSize: "16px",
          color: "#e2e8f0",
        }}>
          <span>P(X = {k})</span>
          <span style={{ color: "#64748b" }}>=</span>
          <FractionFormula
            numeratorLeft={<><span style={{ color: "#f6ad55" }}>e</span><sup style={{ fontSize: "10px" }}>−{lambda}</sup> · {lambda}<sup style={{ fontSize: "10px" }}>{k}</sup></>}
            denominator={<>{k}!</>}
            size="sm"
          />
        </div>
      </div>

      {/* Step by step */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <DetailedStepRow
          stepNum={1}
          label={<>Calculate <span style={{ color: "#f6ad55" }}>e</span><sup style={{ fontSize: "10px" }}>−{lambda}</sup></>}
          lines={[
            { text: <><span style={{ color: "#f6ad55" }}>e</span> = <span style={{ color: "#f6ad55" }}>2.71828...</span> <span style={{ color: "#64748b" }}>(Euler's number)</span></>, color: "#cbd5e1" },
            { text: <>e<sup style={{ fontSize: "10px" }}>{lambda}</sup> = 2.71828<sup style={{ fontSize: "10px" }}>{lambda}</sup> = {Math.exp(lambda).toFixed(3)}</>, color: "#94a3b8" },
            { text: <>e<sup style={{ fontSize: "10px" }}>−{lambda}</sup> = 1 ÷ {Math.exp(lambda).toFixed(3)}</>, color: "#94a3b8" },
          ]}
          result={eLambda.toFixed(5)}
        />
        <DetailedStepRow
          stepNum={2}
          label={<>Calculate {lambda}<sup style={{ fontSize: "10px" }}>{k}</sup></>}
          lines={
            k === 0
              ? [{ text: "Any number to the power of 0 = 1", color: "#94a3b8" }]
              : k === 1
              ? [{ text: <>{lambda}<sup style={{ fontSize: "10px" }}>1</sup> = {lambda}</>, color: "#94a3b8" }]
              : [
                  { text: <>{lambda}<sup style={{ fontSize: "10px" }}>{k}</sup> = {Array.from({ length: k }, () => lambda).join(" × ")}</>, color: "#94a3b8" },
                ]
          }
          result={lambdaK.toLocaleString()}
        />
        <DetailedStepRow
          stepNum={3}
          label={<>Calculate {k}!</>}
          lines={
            k <= 1
              ? [{ text: <>{k}! = 1</>, color: "#94a3b8" }]
              : [
                  { text: <>{k}! = {factorialString}</>, color: "#94a3b8" },
                ]
          }
          result={kFact.toLocaleString()}
        />

        {/* Combine step with fraction */}
        <div style={{
          background: "rgba(99, 179, 237, 0.08)",
          border: "1px solid rgba(99, 179, 237, 0.2)",
          borderRadius: "10px",
          padding: "16px 18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{
                color: "#63b3ed",
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
              }}>
                STEP 4 — COMBINE
              </span>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px",
                fontFamily: "'Space Mono', monospace",
                fontSize: "14px",
                color: "#94a3b8",
              }}>
                <FractionFormula
                  numeratorLeft={<>{eLambda.toFixed(5)} × {lambdaK.toLocaleString()}</>}
                  denominator={<>{kFact.toLocaleString()}</>}
                  color="#94a3b8"
                  size="sm"
                />
                <span style={{ color: "#64748b" }}>=</span>
                <FractionFormula
                  numeratorLeft={<>{(eLambda * lambdaK).toFixed(4)}</>}
                  denominator={<>{kFact.toLocaleString()}</>}
                  color="#cbd5e1"
                  size="sm"
                />
              </div>
            </div>
            <div style={{
              background: "rgba(99, 179, 237, 0.15)",
              borderRadius: "8px",
              padding: "8px 16px",
              textAlign: "center",
            }}>
              <div style={{ color: "#63b3ed", fontSize: "10px", fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>RESULT</div>
              <div style={{
                color: "#f1f5f9",
                fontSize: "22px",
                fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
              }}>
                {(result * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <p style={{
        color: "#64748b",
        fontSize: "12px",
        textAlign: "center",
        marginTop: "14px",
      }}>
        Click another bar to recalculate, or click the same bar to deselect
      </p>
    </div>
  );
};

const DetailedStepRow = ({ stepNum, label, lines, result }) => (
  <div style={{
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "10px",
    padding: "14px 18px",
  }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    }}>
      <div style={{ flex: 1 }}>
        <span style={{
          color: "#63b3ed",
          fontSize: "11px",
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
        }}>
          STEP {stepNum}
        </span>
        <span style={{ color: "#94a3b8", fontSize: "11px", marginLeft: "8px", fontFamily: "'Space Mono', monospace" }}>
          {label}
        </span>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "13px",
          marginTop: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
        }}>
          {lines.map((line, i) => (
            <div key={i} style={{ color: line.color || "#94a3b8" }}>
              {i < lines.length - 1 ? line.text : <>{line.text}</>}
            </div>
          ))}
        </div>
      </div>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        borderRadius: "6px",
        padding: "6px 12px",
        marginLeft: "12px",
        textAlign: "right",
        flexShrink: 0,
        alignSelf: "flex-end",
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          color: "#e2e8f0",
          fontWeight: 600,
          fontSize: "14px",
        }}>= {result}</span>
      </div>
    </div>
  </div>
);

const EulerSection = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: "rgba(246, 173, 85, 0.03)",
      border: "1px solid rgba(246, 173, 85, 0.12)",
      borderRadius: "16px",
      padding: "24px",
      marginTop: "20px",
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            background: "rgba(246, 173, 85, 0.1)",
            border: "1px solid rgba(246, 173, 85, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Space Mono', monospace",
            color: "#f6ad55",
            fontSize: "20px",
            fontWeight: 700,
            flexShrink: 0,
          }}>
            e
          </div>
          <div>
            <h3 style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: 600, margin: 0 }}>
              What is Euler's Number?
            </h3>
            <p style={{ color: "#64748b", fontSize: "12px", margin: "2px 0 0" }}>
              The story behind <em>e</em> ≈ 2.71828...
            </p>
          </div>
        </div>
        <span style={{
          color: "#f6ad55",
          fontSize: "20px",
          transition: "transform 0.3s ease",
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          ▾
        </span>
      </div>

      {expanded && (
        <div style={{
          marginTop: "20px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(246, 173, 85, 0.1)",
        }}>
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{
              color: "#f6ad55",
              fontSize: "12px",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}>
              The Discovery
            </h4>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.7, margin: "0 0 12px" }}>
              The number <em>e</em> was discovered through a surprisingly practical question about <strong style={{ color: "#f6ad55" }}>compound interest</strong>. In 1683, Swiss mathematician <strong style={{ color: "#e2e8f0" }}>Jacob Bernoulli</strong> asked:
            </p>
            <div style={{
              background: "rgba(246, 173, 85, 0.06)",
              borderLeft: "3px solid rgba(246, 173, 85, 0.4)",
              padding: "14px 18px",
              borderRadius: "0 8px 8px 0",
              margin: "0 0 12px",
            }}>
              <p style={{ color: "#e2e8f0", fontSize: "14px", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                "If I invest £1 at 100% annual interest, and compound it more and more frequently — monthly, daily, every second — does my money grow without limit?"
              </p>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
              He found it doesn't. No matter how often you compound, your £1 never exceeds about <strong style={{ color: "#f6ad55" }}>£2.71828...</strong> — that limit is <em>e</em>.
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4 style={{
              color: "#f6ad55",
              fontSize: "12px",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}>
              Watch It Converge
            </h4>
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 4px",
                fontFamily: "'Space Mono', monospace",
                fontSize: "13px",
              }}>
                <thead>
                  <tr>
                    <th style={{ color: "#64748b", textAlign: "left", padding: "6px 12px", fontWeight: 600, fontSize: "11px" }}>Compound</th>
                    <th style={{ color: "#64748b", textAlign: "left", padding: "6px 12px", fontWeight: 600, fontSize: "11px" }}>n</th>
                    <th style={{ color: "#64748b", textAlign: "left", padding: "6px 12px", fontWeight: 600, fontSize: "11px" }}>(1 + 1/n)ⁿ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Yearly", n: 1, result: "2.00000" },
                    { label: "Monthly", n: 12, result: "2.61304" },
                    { label: "Daily", n: 365, result: "2.71457" },
                    { label: "Hourly", n: 8760, result: "2.71813" },
                    { label: "Per second", n: 31536000, result: "2.71828" },
                    { label: "∞", n: "∞", result: "2.71828...", highlight: true },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{
                        color: row.highlight ? "#f6ad55" : "#94a3b8",
                        padding: "8px 12px",
                        background: row.highlight ? "rgba(246, 173, 85, 0.08)" : "rgba(255,255,255,0.02)",
                        borderRadius: "6px 0 0 6px",
                        fontWeight: row.highlight ? 700 : 400,
                      }}>{row.label}</td>
                      <td style={{
                        color: row.highlight ? "#f6ad55" : "#cbd5e1",
                        padding: "8px 12px",
                        background: row.highlight ? "rgba(246, 173, 85, 0.08)" : "rgba(255,255,255,0.02)",
                        fontWeight: row.highlight ? 700 : 400,
                      }}>{typeof row.n === "number" ? row.n.toLocaleString() : row.n}</td>
                      <td style={{
                        color: row.highlight ? "#f6ad55" : "#e2e8f0",
                        padding: "8px 12px",
                        background: row.highlight ? "rgba(246, 173, 85, 0.08)" : "rgba(255,255,255,0.02)",
                        borderRadius: "0 6px 6px 0",
                        fontWeight: 700,
                      }}>{row.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Three definitions */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{
              color: "#f6ad55",
              fontSize: "12px",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}>
              Three Ways to Define <em>e</em>
            </h4>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.7, margin: "0 0 14px" }}>
              You don't have to memorise <em>e</em> — it's not an arbitrary number. It <em>emerges</em> naturally from mathematics, just like π emerges from circles. Here are three equivalent definitions:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Definition 1 — Compound interest limit */}
              <div style={{
                background: "rgba(246, 173, 85, 0.05)",
                border: "1px solid rgba(246, 173, 85, 0.12)",
                borderRadius: "10px",
                padding: "14px 18px",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}>
                  <span style={{
                    background: "rgba(246, 173, 85, 0.15)",
                    color: "#f6ad55",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}>1</span>
                  <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>The Compound Interest Limit</span>
                </div>
                <div style={{
                  textAlign: "center",
                  padding: "10px",
                  background: "rgba(0,0,0,0.15)",
                  borderRadius: "6px",
                  marginBottom: "8px",
                }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    color: "#f6ad55",
                    fontSize: "16px",
                  }}>
                    e = lim<sub style={{ fontSize: "10px" }}>n→∞</sub> (1 + 1/n)<sup style={{ fontSize: "11px" }}>n</sup>
                  </span>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                  Keep making <em>n</em> bigger and bigger — the result keeps getting closer to 2.71828... but never overshoots. This is the definition from the convergence table above.
                </p>
              </div>

              {/* Definition 2 — Infinite series */}
              <div style={{
                background: "rgba(246, 173, 85, 0.05)",
                border: "1px solid rgba(246, 173, 85, 0.12)",
                borderRadius: "10px",
                padding: "14px 18px",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}>
                  <span style={{
                    background: "rgba(246, 173, 85, 0.15)",
                    color: "#f6ad55",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}>2</span>
                  <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>The Infinite Series</span>
                  <span style={{
                    color: "#64748b",
                    fontSize: "11px",
                    fontStyle: "italic",
                    marginLeft: "4px",
                  }}>— most common in textbooks</span>
                </div>
                <div style={{
                  textAlign: "center",
                  padding: "10px",
                  background: "rgba(0,0,0,0.15)",
                  borderRadius: "6px",
                  marginBottom: "8px",
                }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    color: "#f6ad55",
                    fontSize: "15px",
                  }}>
                    e = 1/0! + 1/1! + 1/2! + 1/3! + 1/4! + ...
                  </span>
                </div>
                <div style={{
                  textAlign: "center",
                  padding: "8px 10px",
                  background: "rgba(0,0,0,0.1)",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "13px",
                  color: "#cbd5e1",
                }}>
                  = 1 + 1 + 0.5 + 0.1667 + 0.0417 + 0.00833 + ...
                </div>
                <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                  Each term gets tiny very fast, so even the first 10 terms give you 2.71828. This is how computers actually calculate it.
                </p>
              </div>

              {/* Definition 3 — Calculus */}
              <div style={{
                background: "rgba(246, 173, 85, 0.05)",
                border: "1px solid rgba(246, 173, 85, 0.12)",
                borderRadius: "10px",
                padding: "14px 18px",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}>
                  <span style={{
                    background: "rgba(246, 173, 85, 0.15)",
                    color: "#f6ad55",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}>3</span>
                  <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>The Calculus Definition</span>
                </div>
                <div style={{
                  textAlign: "center",
                  padding: "10px",
                  background: "rgba(0,0,0,0.15)",
                  borderRadius: "6px",
                  marginBottom: "8px",
                }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    color: "#f6ad55",
                    fontSize: "15px",
                  }}>
                    d/dx(e<sup style={{ fontSize: "11px" }}>x</sup>) = e<sup style={{ fontSize: "11px" }}>x</sup>
                  </span>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                  <em>e</em> is the unique number where the curve y = e<sup style={{ fontSize: "10px" }}>x</sup> has a slope equal to its own value at every point. It's the only function that is its own derivative — which is why it appears everywhere in physics, finance, and probability.
                </p>
              </div>
            </div>

            <div style={{
              marginTop: "12px",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <p style={{ color: "#64748b", fontSize: "12.5px", lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: "#94a3b8" }}>In practice:</strong>{" "}
                All three definitions produce exactly the same number. Most people just remember "roughly 2.718" and let a calculator handle the rest — but <em>e</em> isn't arbitrary, it's a constant that emerges from nature just like π.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4 style={{
              color: "#f6ad55",
              fontSize: "12px",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}>
              Why <em>e</em> Appears in the Poisson Formula
            </h4>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.7, margin: "0 0 12px" }}>
              This isn't a coincidence. The Poisson distribution can be derived as a <strong style={{ color: "#e2e8f0" }}>limit of the binomial distribution</strong>. Imagine splitting one minute into <em>n</em> tiny intervals, each with a small probability of a customer arriving. As <em>n → ∞</em> and each interval's probability shrinks to keep the average at λ, the expression:
            </p>
            <div style={{
              textAlign: "center",
              padding: "14px",
              background: "rgba(246, 173, 85, 0.04)",
              borderRadius: "8px",
              marginBottom: "12px",
            }}>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                color: "#e2e8f0",
                fontSize: "15px",
              }}>
                (1 − λ/n)<sup style={{ fontSize: "11px" }}>n</sup> → <span style={{ color: "#f6ad55" }}>e</span><sup style={{ fontSize: "11px" }}>−λ</sup>
              </span>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
              This is the same limiting process Bernoulli discovered with compound interest! The <span style={{ color: "#f6ad55", fontWeight: 600 }}>e<sup style={{ fontSize: "10px" }}>−λ</sup></span> in the Poisson formula represents the probability that <em>zero</em> events happen — the "quiet" baseline from which all other probabilities are built.
            </p>
          </div>

          <div>
            <h4 style={{
              color: "#f6ad55",
              fontSize: "12px",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}>
              The Name
            </h4>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
              Although Bernoulli discovered the number, it was <strong style={{ color: "#e2e8f0" }}>Leonhard Euler</strong> who gave it the symbol <em>e</em> in the 1730s and proved it was irrational — its digits go on forever without repeating. Euler showed <em>e</em> appears everywhere in mathematics: exponential growth, calculus, complex numbers, and probability — making it one of the most fundamental constants in all of mathematics alongside π.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function PoissonChart() {
  const [lambda, setLambda] = useState(4);
  const [selectedK, setSelectedK] = useState(null);
  const data = generateData(lambda);
  const peak = Math.max(...data.map((d) => d.probability));

  const getBarColor = (entry) => {
    if (selectedK !== null && entry.k === selectedK) return "#63b3ed";
    const ratio = entry.probability / peak;
    if (selectedK !== null) {
      if (ratio > 0.85) return "rgba(99, 179, 237, 0.25)";
      if (ratio > 0.6) return "rgba(74, 158, 216, 0.2)";
      return "rgba(49, 130, 184, 0.15)";
    }
    if (ratio > 0.85) return "#63b3ed";
    if (ratio > 0.6) return "#4a9ed8";
    if (ratio > 0.35) return "#3182b8";
    if (ratio > 0.15) return "#2a6a9a";
    return "#1e4f73";
  };

  const handleBarClick = (entry) => {
    if (entry && entry.activePayload && entry.activePayload[0]) {
      const clickedK = entry.activePayload[0].payload.k;
      setSelectedK(clickedK === selectedK ? null : clickedK);
    }
  };

  const handleLambdaChange = (newLambda) => {
    setLambda(newLambda);
    setSelectedK(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0e1a 0%, #111827 40%, #0f172a 100%)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "40px 16px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: "740px" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px", textAlign: "center" }}>
          <p style={{
            color: "#63b3ed",
            fontSize: "12px",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "3px",
            textTransform: "uppercase",
            margin: "0 0 8px",
          }}>
            Probability Distribution
          </p>
          <h1 style={{
            color: "#f1f5f9",
            fontSize: "28px",
            fontWeight: 700,
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}>
            Poisson Distribution
          </h1>
          <p style={{
            color: "#94a3b8",
            fontSize: "15px",
            margin: 0,
          }}>
            An interactive explorer
          </p>
        </div>

        {/* Definition */}
        <DefinitionSection />

        {/* Lambda slider */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px",
          padding: "20px 24px",
          marginBottom: "24px",
        }}>
          <p style={{
            color: "#e2e8f0",
            fontSize: "14px",
            fontWeight: 600,
            margin: "0 0 14px",
          }}>
            Average # of customers per minute
          </p>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}>
          <div style={{ flex: "0 0 auto" }}>
            <span style={{
              color: "#94a3b8",
              fontSize: "13px",
              fontFamily: "'Space Mono', monospace",
            }}>
              λ (avg rate)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={lambda}
            onChange={(e) => handleLambdaChange(Number(e.target.value))}
            style={{
              flex: 1,
              accentColor: "#63b3ed",
              height: "6px",
              cursor: "pointer",
            }}
          />
          <div style={{
            background: "rgba(99, 179, 237, 0.12)",
            border: "1px solid rgba(99, 179, 237, 0.25)",
            borderRadius: "8px",
            padding: "6px 14px",
            minWidth: "48px",
            textAlign: "center",
          }}>
            <span style={{
              color: "#63b3ed",
              fontSize: "20px",
              fontWeight: 700,
              fontFamily: "'Space Mono', monospace",
            }}>
              {lambda}
            </span>
          </div>
          </div>
        </div>

        {/* Scenario label */}
        <p style={{
          color: "#94a3b8",
          fontSize: "13px",
          textAlign: "center",
          margin: "0 0 8px",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          ☕ Coffee shop averaging <strong style={{ color: "#63b3ed" }}>{lambda}</strong> customer{lambda !== 1 ? "s" : ""} per minute
        </p>

        {/* Chart */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: selectedK !== null ? "1px solid rgba(99, 179, 237, 0.15)" : "1px solid rgba(255,255,255,0.06)",
          borderRadius: "16px",
          padding: "16px 16px 16px 8px",
          transition: "border-color 0.3s ease",
        }}>
          <ResponsiveContainer width="100%" height={440}>
            <BarChart
              data={data}
              margin={{ top: 40, right: 16, bottom: 20, left: 8 }}
              barCategoryGap="18%"
              onClick={handleBarClick}
              style={{ cursor: "pointer" }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 13, fontFamily: "'Space Mono', monospace" }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={false}
                label={{
                  value: "Number of customers (k)",
                  position: "insideBottom",
                  offset: -12,
                  style: { fill: "#64748b", fontSize: 12, fontFamily: "'DM Sans', sans-serif" },
                }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12, fontFamily: "'Space Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 179, 237, 0.06)" }} wrapperStyle={{ zIndex: 100, overflow: "visible" }} />
              <ReferenceLine
                x={`${lambda}`}
                stroke="rgba(99, 179, 237, 0.35)"
                strokeDasharray="6 4"
                label={{
                  value: `λ = ${lambda}`,
                  position: "top",
                  offset: 10,
                  style: { fill: "#63b3ed", fontSize: 12, fontWeight: 600, fontFamily: "'Space Mono', monospace" },
                }}
              />
              <Bar dataKey="probability" radius={[5, 5, 0, 0]} maxBarSize={46}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={getBarColor(entry)}
                    style={{ transition: "fill 0.3s ease", cursor: "pointer" }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Formula Section */}
        <FormulaSection lambda={lambda} selectedK={selectedK} />

        {/* Euler's Number Section */}
        <EulerSection />

        {/* Insight box */}
        <div style={{
          marginTop: "20px",
          background: "rgba(99, 179, 237, 0.05)",
          border: "1px solid rgba(99, 179, 237, 0.12)",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "18px", lineHeight: 1.4 }}>💡</span>
          <p style={{
            color: "#94a3b8",
            fontSize: "13.5px",
            lineHeight: 1.6,
            margin: 0,
          }}>
            The bell-curve shape becomes more symmetric as λ increases.
            Try sliding λ up to 10 or 12 to see how it approaches a perfect normal distribution.
            Click any bar to see the full calculation breakdown with the traditional fraction formula.
          </p>
        </div>
      </div>
    </div>
  );
}
