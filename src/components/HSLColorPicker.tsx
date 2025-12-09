import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GradientSlider from './GradientSlider';

interface Props {
    color: string;
    onColorChange: (color: string) => void;
    label?: string;
}

// Helper functions (simplified for brevity, a full library might be better but let's keep it self-contained)
const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };
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

const HSLColorPicker: React.FC<Props> = ({ color, onColorChange, label }) => {
    const [hsl, setHsl] = useState(hexToHsl(color === 'device' ? '#000000' : color));

    useEffect(() => {
        if (color !== 'device') {
            const newHsl = hexToHsl(color);
            // Only update if significantly different to avoid loop/rounding jitter
            if (Math.abs(newHsl.h - hsl.h) > 1 || Math.abs(newHsl.s - hsl.s) > 1 || Math.abs(newHsl.l - hsl.l) > 1) {
                setHsl(newHsl);
            }
        }
    }, [color]);

    const updateColor = (h: number, s: number, l: number) => {
        setHsl({ h, s, l });
        onColorChange(hslToHex(h, s, l));
    };

    // Hue gradient colors
    const hueColors = [
        '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'
    ];

    // Saturation gradient colors (grayscale to full color at current Hue)
    const saturationColors = [
        hslToHex(hsl.h, 0, 50), // Grayish
        hslToHex(hsl.h, 100, 50)  // Full saturation
    ];

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <Text style={styles.subLabel}>Hue</Text>
            <GradientSlider
                value={hsl.h}
                minimumValue={0}
                maximumValue={360}
                colors={hueColors}
                onValueChange={(h) => updateColor(h, hsl.s, 50)} // Default Lightness to 50% for pure colors
            />

            <Text style={styles.subLabel}>Saturation</Text>
            <GradientSlider
                value={hsl.s}
                minimumValue={0}
                maximumValue={100}
                colors={saturationColors} // Dynamic based on Hue
                onValueChange={(s) => updateColor(hsl.h, s, 50)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 5,
    },
    subLabel: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 5,
        marginBottom: 0,
        marginLeft: 2,
    },
});

export default HSLColorPicker;
