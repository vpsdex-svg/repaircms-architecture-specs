/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2589f6",
          hover: "#1e7cd2",
          light: "#e5f2ff",
        },
        sidebar: "#343655",
        canvas: "#f0f3f7",
        surface: "#ffffff",
        line: "#dee3e8",
        status: {
          booked: "#f5a623",
          progress: "#2589f6",
          ready: "#22c55e",
          delivered: "#8b98aa",
          waiting: "#a855f7",
          cancelled: "#ef4444",
          invoiced: "#0f766e",
          draft: "#94a3b8",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.05), 0 1px 3px rgba(16, 24, 40, 0.06)",
        pop: "0 12px 32px rgba(16, 24, 40, 0.16)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
