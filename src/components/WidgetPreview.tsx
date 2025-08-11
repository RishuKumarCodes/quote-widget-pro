import React from 'react';
import {View, Text, StyleSheet, ViewStyle, TextStyle} from 'react-native';

interface WidgetSettings {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  isBold: boolean;
  backgroundColor: string;
  backgroundType: string;
  borderRadius: number;
  refreshInterval: number;
  autoTheme: boolean;
}

interface Props {
  settings: WidgetSettings;
}

const WidgetPreview: React.FC<Props> = ({settings}) => {
  const getBackgroundStyle = (): ViewStyle => {
    let backgroundColor = settings.backgroundColor;
    
    if (settings.backgroundType === 'transparent') {
      backgroundColor = 'transparent';
    } else if (settings.backgroundType === 'translucent') {
      // Convert hex to rgba with opacity
      const hex = settings.backgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      backgroundColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
    }

    return {
      backgroundColor,
      borderRadius: settings.borderRadius,
    };
  };

  const getTextStyle = (): TextStyle => ({
    color: settings.textColor,
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    fontWeight: settings.isBold ? 'bold' : 'normal',
  });

  const getAuthorStyle = (): TextStyle => ({
    color: settings.textColor + '80', // Add some opacity
    fontSize: settings.fontSize - 2,
    fontFamily: settings.fontFamily,
    fontStyle: 'italic',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.previewTitle}>Widget Preview</Text>
      <View style={styles.phoneFrame}>
        <View style={styles.widgetArea}>
          <View style={[styles.widget, getBackgroundStyle()]}>
            <Text style={[styles.quoteText, getTextStyle()]}>
              "The only way to do great work is to love what you do."
            </Text>
            <Text style={[styles.authorText, getAuthorStyle()]}>
              — Steve Jobs
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 15,
    textAlign: 'center',
  },
  phoneFrame: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  widgetArea: {
    width: 280,
    height: 120,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  widget: {
    width: '100%',
    height: '100%',
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