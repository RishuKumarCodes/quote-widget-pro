import React, {useState, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  PanResponder,
  Animated,
} from 'react-native';

interface Props {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange: (value: number) => void;
  style?: ViewStyle;
}

const SimpleSlider: React.FC<Props> = ({
  value,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  style,
}) => {
  const sliderWidth = 280;
  const thumbWidth = 20;
  
  const [isDragging, setIsDragging] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // Calculate initial position
  React.useEffect(() => {
    const percentage = (value - minimumValue) / (maximumValue - minimumValue);
    const position = percentage * (sliderWidth - thumbWidth);
    animatedValue.setValue(position);
  }, [value, minimumValue, maximumValue, animatedValue, sliderWidth, thumbWidth]);

  const updateValue = (position: number) => {
    const percentage = position / (sliderWidth - thumbWidth);
    const newValue = minimumValue + percentage * (maximumValue - minimumValue);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
    onValueChange(clampedValue);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      animatedValue.setOffset(animatedValue._value);
      animatedValue.setValue(0);
    },
    onPanResponderMove: (evt, gestureState) => {
      const newPosition = Math.max(0, Math.min(sliderWidth - thumbWidth, gestureState.dx));
      animatedValue.setValue(newPosition);
      updateValue(animatedValue._offset + newPosition);
    },
    onPanResponderRelease: (evt, gestureState) => {
      setIsDragging(false);
      animatedValue.flattenOffset();
      const finalPosition = Math.max(0, Math.min(sliderWidth - thumbWidth, animatedValue._value));
      Animated.spring(animatedValue, {
        toValue: finalPosition,
        useNativeDriver: false,
      }).start();
      updateValue(finalPosition);
    },
  });

  const handleTrackPress = (evt: any) => {
    if (isDragging) return;
    
    const {locationX} = evt.nativeEvent;
    const newPosition = Math.max(0, Math.min(sliderWidth - thumbWidth, locationX - thumbWidth / 2));
    
    Animated.spring(animatedValue, {
      toValue: newPosition,
      useNativeDriver: false,
    }).start();
    
    updateValue(newPosition);
  };

  const thumbStyle = {
    transform: [
      {
        translateX: animatedValue,
      },
    ],
  };

  const activeTrackWidth = animatedValue.interpolate({
    inputRange: [0, sliderWidth - thumbWidth],
    outputRange: [thumbWidth / 2, sliderWidth - thumbWidth / 2],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.sliderContainer}
        onPress={handleTrackPress}
        activeOpacity={1}>
        <View style={styles.track} />
        <Animated.View style={[styles.activeTrack, {width: activeTrackWidth}]} />
        <Animated.View
          style={[styles.thumb, thumbStyle, isDragging && styles.thumbActive]}
          {...panResponder.panHandlers}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sliderContainer: {
    width: 280,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: '#dee2e6',
    borderRadius: 2,
    width: '100%',
  },
  activeTrack: {
    height: 4,
    backgroundColor: '#007bff',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 18,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    top: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  thumbActive: {
    transform: [{scale: 1.2}],
  },
});

export default SimpleSlider;