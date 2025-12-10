import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GradientSlider from './GradientSlider';

interface Props {
    color: string;
    onColorChange: (color: string) => void;
    label?: string;
}

const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 100, l: 50 }; // Default to S=100
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

const HSLColorPicker: React.FC<Props> = ({ color, onColorChange }) => {
    // Initial state: respect input color but force S=100 if we want to ensure vivid colors?
    // User requested: "don't make it grayscale", "same color as selected hue"
    const initialHsl = hexToHsl(color === 'device' ? '#000000' : color);
    const [hsl, setHsl] = useState({ ...initialHsl, s: 100 });

    useEffect(() => {
        if (color !== 'device') {
            const newHsl = hexToHsl(color);
            // Only update if significantly different to prevent loop, but enforce S=100
            if (Math.abs(newHsl.h - hsl.h) > 1 || Math.abs(newHsl.l - hsl.l) > 1) {
                setHsl({ ...newHsl, s: 100 });
            }
        }
    }, [color]);

    const updateColor = (h: number, s: number, l: number) => {
        setHsl({ h, s, l });
        onColorChange(hslToHex(h, s, l));
    };

    const hueColors = [
        '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'
    ];

    // Brightness gradient: Black -> Pure Color (L=50) -> White
    const brightnessColors = [
        '#000000',
        hslToHex(hsl.h, 100, 50), // Pure color at 50% lightness works best as midpoint
        '#ffffff'
    ];

    return (
        <>
            <Text style={styles.label}>Hue</Text>
            <GradientSlider
                value={hsl.h}
                minimumValue={0}
                maximumValue={360}
                colors={hueColors}
                onValueChange={(h) => updateColor(h, 100, hsl.l)} // Keep S=100
            />

            <Text style={styles.label}>Brightness</Text>
            <GradientSlider
                value={hsl.l}
                minimumValue={0}
                maximumValue={100}
                colors={brightnessColors}
                onValueChange={(l) => updateColor(hsl.h, 100, l)} // Keep S=100
            />
        </>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 5,
        marginBottom: 0,
        marginLeft: 2,
    },
});

export default HSLColorPicker;
