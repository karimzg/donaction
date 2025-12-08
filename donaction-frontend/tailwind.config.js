const theme = require('./src/config/theme.json');

let font_base = Number(theme.fonts.font_size.base.replace('px', ''));
let font_scale = Number(theme.fonts.font_size.scale);
let h6 = font_base / font_base;
let h5 = h6 * font_scale;
let h4 = h5 * font_scale;
let h3 = h4 * font_scale;
let h2 = h3 * font_scale;
let h1 = h2 * font_scale;
let fontPrimary, fontPrimaryType;
if (theme.fonts.font_family.primary) {
	fontPrimary = theme.fonts.font_family.primary
		.replace(/\+/g, ' ')
		.replace(/:[ital,]*[ital@]*[wght@]*[0-9,;]+/gi, '');
	fontPrimaryType = theme.fonts.font_family.primary_type;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/layouts/**/*.{js,ts,jsx,tsx}',
		'./src/content/**/*.{md,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx}',
	],
	safelist: [],

	theme: {
		screens: {
			xs: '480px',
			sm: '575px',
			md: '768px',
			lg: '1024px',
			xl: '1320px',
		},
		container: {
			center: true,
			padding: '1.5rem',
		},
		extend: {
			colors: {
				text: theme.colors.default.text_color.default,
				light: theme.colors.default.text_color.light,
				dark: theme.colors.default.text_color.dark,
				primary: theme.colors.default.theme_color.primary,
				secondary: theme.colors.default.theme_color.secondary,
				tertiary: theme.colors.default.theme_color.tertiary,
				quaternary: theme.colors.default.theme_color.quaternary,
				quinary: theme.colors.default.theme_color.quinary,
				senary: theme.colors.default.theme_color.senary,
				body: theme.colors.default.theme_color.body,
				border: theme.colors.default.theme_color.border,
				'theme-dark': theme.colors.default.theme_color.theme_dark,
				'theme-light': theme.colors.default.theme_color.theme_light,
			},
			fontSize: {
				base: font_base + 'px',
				h1: h1 + 'rem',
				'h1-md': h1 * 0.8 + 'rem',
				h2: h2 + 'rem',
				'h2-md': h2 * 0.8 + 'rem',
				h3: h3 + 'rem',
				'h3-md': h3 * 0.8 + 'rem',
				h4: h4 + 'rem',
				'h4-md': h4 * 0.8 + 'rem',
				h5: h5 + 'rem',
				h6: h6 + 'rem',
			},
			fontFamily: {
				primary: [fontPrimary, fontPrimaryType],
			},
			boxShadow: {
				button: '0 4px 4px 0px rgba(0, 0, 0, 0.25)',
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
