import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';

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
  return (
    <View style={[styles.container, style]}>
      <Slider
        style={styles.slider}
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor="#007bff"
        maximumTrackTintColor="#dee2e6"
        thumbTintColor="#007bff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  slider: {
    width: 280,
    height: 40,
  },
});

export default SimpleSlider;