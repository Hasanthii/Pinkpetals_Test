/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'playfair': ['Playfair Display', 'serif'],
                'jost': ['Jost', 'sans-serif'],
            },
            colors: {
                primary: {
                    rose: '#B76E79',
                    'rose-deep': '#9e5c67',
                    'rose-warm': '#c9898a',
                    'rose-soft': '#d4879a',
                    'rose-muted': '#d4a0a0',
                },
                burgundy: {
                    DEFAULT: '#3d1a22',
                    medium: '#6b3040',
                },
                blush: '#e8c5c0',
                'pale-rose': '#f5d5d8',
                cream: '#fffaf9',
                'warm-rose': '#c9898a',
                'soft-rose': '#d4879a',
                'muted-rose': '#d4a0a0',
                'deep-rose': '#9e5c67',
                'soft-blush': '#e8c5c0',
                'deep-burgundy': '#3d1a22',
                'medium-burgundy': '#6b3040',
                'background-cream': '#fffaf9',
            },
            boxShadow: {
                'rose-sm': '0 2px 8px rgba(183,110,121,0.08)',
                'rose-md': '0 4px 16px rgba(183,110,121,0.12)',
                'rose-lg': '0 8px 24px rgba(183,110,121,0.20)',
                'rose-xl': '0 12px 40px rgba(183,110,121,0.30)',
            },
        },
    },
    plugins: [],
}
