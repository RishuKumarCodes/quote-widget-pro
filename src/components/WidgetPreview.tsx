import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';

interface WidgetSettings {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  isBold: boolean;
  backgroundColor: string;
  backgroundType: string;
  backgroundOpacity: number;
  borderRadius: number;
  refreshInterval: number;
  autoTheme: boolean;
}

interface Props {
  settings: WidgetSettings;
}

const WidgetPreview: React.FC<Props> = ({ settings }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const getDeviceTextColor = (): string => {
    return isDarkMode ? '#FFFFFF' : '#000000';
  };

  const getDeviceBackgroundColor = (): string => {
    return isDarkMode ? '#121212' : '#FFFFFF';
  };

  const getBackgroundStyle = (): ViewStyle => {
    let backgroundColor = settings.backgroundColor;

    // Handle device theme colors
    if (backgroundColor === 'device') {
      backgroundColor = getDeviceBackgroundColor();
    }

    if (settings.backgroundType === 'transparent') {
      backgroundColor = 'transparent';
    } else {
      // Apply opacity
      if (backgroundColor !== 'transparent') {
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        backgroundColor = `rgba(${r}, ${g}, ${b}, ${settings.backgroundOpacity})`;
      }
    }

    return {
      backgroundColor,
      borderRadius: settings.borderRadius,
    };
  };

  const getTextColor = (): string => {
    if (settings.textColor === 'device') {
      return getDeviceTextColor();
    }
    return settings.textColor;
  };

  const getTextStyle = (): TextStyle => ({
    color: getTextColor(),
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    fontWeight: settings.isBold ? 'bold' : 'normal',
  });

  const getAuthorStyle = (): TextStyle => {
    const baseColor = getTextColor();
    // Add opacity to the color
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const authorColor = `rgba(${r}, ${g}, ${b}, 0.7)`;

    return {
      color: authorColor,
      fontSize: settings.fontSize - 2,
      fontFamily: settings.fontFamily,
      fontStyle: 'italic',
    };
  };

  return (
    <View style={styles.container}>
      <View style={[styles.widget, getBackgroundStyle()]}>
        <Text style={[styles.quoteText, getTextStyle()]}>
          "The only way to do great work is to love what you do."
        </Text>
        <Text style={[styles.authorText, getAuthorStyle()]}>— Steve Jobs</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  widget: {
    width: '90%',
    height: 180,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quoteText: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  authorText: {
    textAlign: 'center',
    marginTop: 4,
  },
});

export default WidgetPreview;
