import { ImageResponse } from "next/og";
import { profile } from "@/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — ${profile.title}`;

// Generated social share image. Self-contained, matches the site palette.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(60% 80% at 25% 0%, #1a2140 0%, #0d1117 55%)",
          color: "#e6edf3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              border: "1px solid #21262d",
              background: "#10182a",
              color: "#818cf8",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            AP
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#22d3ee",
              letterSpacing: 4,
              fontWeight: 600,
            }}
          >
            {profile.eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 960,
            }}
          >
            {profile.name}
          </div>
          <div style={{ fontSize: 30, color: "#c9d1d9", maxWidth: 900 }}>
            Backend systems, applied AI, and cloud that ships to production.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            fontSize: 22,
            color: "#8b949e",
          }}
        >
          <span>github.com/Armaan-94</span>
          <span>·</span>
          <span>{profile.location}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
