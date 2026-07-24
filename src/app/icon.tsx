import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Generated "AP" monogram favicon. No external asset needed.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1117",
          color: "#818cf8",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: -1,
          borderRadius: 7,
          border: "1px solid #21262d",
          fontFamily: "sans-serif",
        }}
      >
        AP
      </div>
    ),
    { ...size }
  );
}
