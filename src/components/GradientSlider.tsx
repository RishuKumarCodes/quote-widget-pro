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
                    <Rect x="0" y="0" width="100%" height="100%" rx={20} ry={20} fill="url(#grad)" />
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
                thumbTintColor="#fff" // Clean white thumb
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 40,
        justifyContent: 'center',
        width: '100%',
    },
    gradientContainer: {
        ...StyleSheet.absoluteFillObject,
        height: 20, // Height of the track
        top: 10,
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
});

export default GradientSlider;
