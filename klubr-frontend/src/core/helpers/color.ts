// utils/color.ts
// Convert hex to RGB
export const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

// Lighten RGB color
export const lightenRgb = ({ r, g, b }: {r: number, g: number, b: number}, percent: number) => {
    r = Math.min(255, r + (255 - r) * percent);
    g = Math.min(255, g + (255 - g) * percent);
    b = Math.min(255, b + (255 - b) * percent);
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

// Convert RGB to hex
export const rgbToHex = ({ r, g, b }: {r: number, g: number, b: number}) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Lighten hex color
export const lightenHex = (hex: string, percent: number) => {
    const rgb = hexToRgb(hex);
    const lightenedRgb = lightenRgb(rgb, percent);
    return rgbToHex(lightenedRgb);
}
