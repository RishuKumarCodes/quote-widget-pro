import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

interface Props {
    value: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    onValueChange: (value: number) => void;
    colors: string[];
    style?: ViewStyle;
}

const GradientSlider: React.FC<Props> = ({
    value,
    minimumValue = 0,
    maximumValue = 100,
    step = 1,
    onValueChange,
    colors,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.gradientContainer}>
                <Svg height="100%" width="100%" style={styles.svg}>
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                            {colors.map((color, index) => (
                                <Stop
                                    key={index}
                                    offset={`${(index / (colors.length - 1)) * 100}%`}
                                    stopColor={color}
                                    stopOpacity="1"
                                />
                            ))}
                        </LinearGradient>
                    </Defs>
                    <Rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        rx={10}
                        ry={10}
                        fill="url(#grad)"
                    />
                </Svg>
            </View>
            <Slider
                style={styles.slider}
                value={value}
                minimumValue={minimumValue}
                maximumValue={maximumValue}
                step={step}
                onValueChange={onValueChange}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor="transparent"
            />
            {/* Custom Thumb Indicator */}
            <View
                style={[
                    styles.customThumb,
                    {
                        left: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%`,
                    }
                ]}
            >
                <View style={styles.thumbStick} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60, // Increased to accommodate taller thumb
        justifyContent: 'center',
        width: '100%',
    },
    gradientContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 20,
        top: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    svg: {
        flex: 1,
    },
    slider: {
        width: '100%',
        height: 40,
        zIndex: 1,
    },
    customThumb: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
        pointerEvents: 'none',
    },
    thumbStick: {
        width: 14,
        height: 48,
        backgroundColor: '#201868ff',
        borderRadius: 10,
        borderWidth: 4,
        borderColor: "#e4ebffff",
    },
});

export default GradientSlider;
