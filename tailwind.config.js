/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                background: "#09090b",
                surface: "#18181b",
                border: "#27272a",
                accent: "#f59e0b",
                muted: "#a1a1aa",
            },
        },
    },
    plugins: [],
};