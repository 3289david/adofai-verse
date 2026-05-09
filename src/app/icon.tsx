import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: "linear-gradient(135deg, #ff2244 0%, #cc33ff 50%, #0077ff 100%)",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          background: "rgba(255,255,255,0.95)",
          transform: "rotate(45deg)",
          borderRadius: 2,
        }}
      />
    </div>,
    { width: 32, height: 32 }
  );
}
