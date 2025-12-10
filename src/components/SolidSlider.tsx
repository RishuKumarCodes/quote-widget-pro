import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ViewStyle,
    PanResponder,
    Animated,
    LayoutChangeEvent,
} from 'react-native';

interface Props {
    value: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    onValueChange: (value: number) => void;
    style?: ViewStyle;
    trackColor?: string;
    filledColor?: string;
    thumbColor?: string;
}

const SolidSlider: React.FC<Props> = ({
    value,
    minimumValue = 0,
    maximumValue = 100,
    step = 1,
    onValueChange,
    style,
    trackColor = '#E3E5EB', // Light grey for unfilled part
    filledColor = '#0052CC', // Blue for filled part
    thumbColor = '#201868ff', // Blue for thumb
}) => {
    const [width, setWidth] = useState(0);
    const thumbWidth = 4; // Thin vertical line

    const pan = useRef(new Animated.Value(0)).current;
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);

    const propsRef = useRef({ minimumValue, maximumValue, step, onValueChange });
    useEffect(() => {
        propsRef.current = { minimumValue, maximumValue, step, onValueChange };
    }, [minimumValue, maximumValue, step, onValueChange]);

    const widthRef = useRef(0);
    useEffect(() => { widthRef.current = width; }, [width]);

    // Sync animation with value prop when not dragging
    useEffect(() => {
        if (width > 0 && !isDragging) {
            const percentage = (value - minimumValue) / (maximumValue - minimumValue);
            const position = percentage * (width - thumbWidth);
            pan.setValue(position);
        }
    }, [value, minimumValue, maximumValue, width, isDragging, thumbWidth]);

    const updateValueFromPos = (pos: number) => {
        const { minimumValue, maximumValue, step, onValueChange } = propsRef.current;
        const currentWidth = widthRef.current;
        const maxTravel = currentWidth - thumbWidth;
        if (maxTravel <= 0) return;

        const percentage = pos / maxTravel;
        const rawValue = minimumValue + percentage * (maximumValue - minimumValue);

        // Step calculation
        const steps = Math.round((rawValue - minimumValue) / step);
        const steppedValue = Math.min(maximumValue, Math.max(minimumValue, minimumValue + steps * step));

        onValueChange(steppedValue);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                setIsDragging(true);
                const currentWidth = widthRef.current;
                if (currentWidth === 0) return;

                // Use locationX relative to the touch overlay
                const tapX = evt.nativeEvent.locationX;
                const maxTravel = currentWidth - thumbWidth;

                // Center thumb on tap position
                let newPos = tapX - thumbWidth / 2;
                newPos = Math.max(0, Math.min(maxTravel, newPos));

                // Store starting position for this gesture
                startX.current = newPos;

                // Update visual and value immediately
                pan.setOffset(0);
                pan.setValue(newPos);
                updateValueFromPos(newPos);
            },
            onPanResponderMove: (evt, gestureState) => {
                const currentWidth = widthRef.current;
                if (currentWidth === 0) return;
                const maxTravel = currentWidth - thumbWidth;

                // New position = start pos + dragging distance
                let newPos = startX.current + gestureState.dx;
                newPos = Math.max(0, Math.min(maxTravel, newPos));

                pan.setValue(newPos);
                updateValueFromPos(newPos);
            },
            onPanResponderRelease: () => {
                setIsDragging(false);
            },
            onPanResponderTerminate: () => setIsDragging(false),
        })
    ).current;

    const onLayout = (event: LayoutChangeEvent) => {
        setWidth(event.nativeEvent.layout.width);
    };

    const translateX = pan.interpolate({
        inputRange: [0, Math.max(1, width - thumbWidth)],
        outputRange: [0, Math.max(0, width - thumbWidth)],
        extrapolate: 'clamp',
    });

    return (
        <View style={[styles.container, style]} onLayout={onLayout}>
            <View style={styles.contentContainer}>
                <View style={[styles.track, { backgroundColor: trackColor }]}>
                    <Animated.View
                        style={[
                            styles.activeTrack,
                            {
                                backgroundColor: filledColor,
                                width: width > 0 ? translateX.interpolate({
                                    inputRange: [0, Math.max(0.1, width - thumbWidth)],
                                    outputRange: [0, Math.max(0, width - thumbWidth)],
                                    extrapolate: 'clamp'
                                }) : 0,
                            },
                        ]}
                    />
                </View>
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            backgroundColor: thumbColor,
                            transform: [{ translateX }],
                        },
                    ]}
                />
            </View>

            {/* Transparent Overlay for Touch Handling */}
            <View
                style={styles.touchOverlay}
                {...panResponder.panHandlers}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 48,
        justifyContent: 'center',
        width: '100%',
    },
    contentContainer: {
        height: 48,
        justifyContent: 'center',
        width: '100%',
    },
    touchOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        zIndex: 20,
    },
    track: {
        height: 24,
        borderRadius: 12,
        width: '100%',
        overflow: 'hidden',
    },
    activeTrack: {
        height: '100%',
        position: 'absolute',
        left: 0,
    },
    thumb: {
        position: 'absolute',
        width: 14,
        borderWidth: 4,
        borderColor: "#e4ebffff",
        height: 48,
        borderRadius: 10,
        top: 0.5,
        zIndex: 10,
    },
});

export default SolidSlider;
