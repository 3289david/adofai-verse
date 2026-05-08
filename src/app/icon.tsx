import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: "linear-gradient(135deg, #ff2244 0%, #ff5500 50%, #ff8800 100%)",
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 20,
        fontWeight: 900,
        fontFamily: "sans-serif",
        letterSpacing: "-1px",
      }}
    >
      A
    </div>,
    { width: 32, height: 32 }
  );
}
