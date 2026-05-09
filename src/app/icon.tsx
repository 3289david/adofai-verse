import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: 32, height: 32, display: "flex" }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff2244" />
            <stop offset="0.5" stopColor="#cc33ff" />
            <stop offset="1" stopColor="#0077ff" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="7" fill="url(#g)" />
        <rect x="10.5" y="10.5" width="11" height="11" rx="1.7" fill="white" transform="rotate(45 16 16)" />
      </svg>
    </div>,
    { width: 32, height: 32 }
  );
}
