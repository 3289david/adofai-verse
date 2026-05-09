import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: "#09091a",
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* fire half */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, width: 16, height: 32,
        background: "linear-gradient(180deg, #ff2244 0%, #ff8800 100%)",
        clipPath: "polygon(0 0, 100% 0, 0 100%)",
      }} />
      {/* ice half */}
      <div style={{
        position: "absolute",
        right: 0, bottom: 0, width: 16, height: 32,
        background: "linear-gradient(180deg, #0066ff 0%, #00ddff 100%)",
        clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
      }} />
      {/* diamond tile */}
      <div style={{
        width: 14,
        height: 14,
        background: "white",
        transform: "rotate(45deg)",
        borderRadius: 2,
        zIndex: 2,
        boxShadow: "0 0 6px rgba(255,255,255,0.6)",
      }} />
    </div>,
    { width: 32, height: 32 }
  );
}
