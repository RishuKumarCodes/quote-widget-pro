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
  fontWeight: string;
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

  const getTextStyle = (): TextStyle => {
    // Map font weights to system font families to match Native Widget implementation
    let fontFamily = settings.fontFamily;
    let fontWeight: TextStyle['fontWeight'] = settings.fontWeight as any;

    if (settings.fontWeight === '200') {
      fontFamily = 'sans-serif-thin';
      fontWeight = 'normal';
    } else if (settings.fontWeight === '400') {
      // 400 is normal/regular. 
      // User calls it Medium (400), but 400 is standard.
      // We'll just let it use the default fontFamily (sans-serif) or whatever is set.
      // If we want it to look "Medium" (500) but value is 400? 
      // No, user said weight should be 400. 400 is normal.
      fontWeight = 'normal';
    } else if (settings.fontWeight === '500') {
      fontFamily = 'sans-serif-medium';
      fontWeight = 'normal';
    } else if (settings.fontWeight === '900') {
      fontFamily = 'sans-serif-black';
      fontWeight = 'normal';
    }

    return {
      color: getTextColor(),
      fontSize: settings.fontSize,
      fontFamily: fontFamily,
      fontWeight: fontWeight,
    };
  };

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
      fontSize: settings.fontSize * 0.8,
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
  },
  quoteText: {
    textAlign: 'center',
  },
  authorText: {
    textAlign: 'center',
  },
});

export default WidgetPreview;
