import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

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
  const percentage = (value - minimumValue) / (maximumValue - minimumValue);
  const position = percentage * (sliderWidth - thumbWidth);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track} />
      <View
        style={[
          styles.thumb,
          {
            left: position,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    width: 280,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  track: {
    height: 4,
    backgroundColor: '#dee2e6',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    top: 10,
  },
});

export default SimpleSlider;