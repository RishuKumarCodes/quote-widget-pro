import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';

interface Props {
  color: string;
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<Props> = ({color, onColorChange}) => {
  const predefinedColors: string[] = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#008000', '#000080',
    '#FF6347', '#40E0D0', '#EE82EE', '#F0E68C', '#DDA0DD',
    '#98FB98', '#F5DEB3', '#FF69B4', '#CD5C5C', '#4B0082',
    '#2E8B57', '#DAA520', '#FF1493', '#00CED1', '#FF4500',
    '#32CD32', '#FFD700', '#DC143C', '#00BFFF', '#ADFF2F',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.colorGrid}>
        {predefinedColors.map((colorOption, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorOption,
              {backgroundColor: colorOption},
              color === colorOption && styles.selectedColor,
            ]}
            onPress={() => onColorChange(colorOption)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 200,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  selectedColor: {
    borderColor: '#007bff',
    borderWidth: 3,
  },
});

export default ColorPicker;