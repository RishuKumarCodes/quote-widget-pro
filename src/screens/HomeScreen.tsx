import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  NativeModules,
  ImageBackground,
} from 'react-native';
import WidgetSettings from '../components/WidgetSettings';
import WidgetPreview from '../components/WidgetPreview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

const { QuoteWidget } = NativeModules;

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

const HomeScreen: React.FC = () => {
  const [currentWidgetId, setCurrentWidgetId] = useState<number | null>(0);
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>({
    fontFamily: 'sans-serif',
    fontSize: 14,
    textColor: '#000000',
    fontWeight: '400',
    backgroundColor: '#FFFFFF',
    backgroundType: 'solid',
    backgroundOpacity: 1,
    borderRadius: 12,
    refreshInterval: 60,
    autoTheme: false,
  });
  const [previewSettings, setPreviewSettings] =
    useState<WidgetSettings>(widgetSettings);
  const [availableWidgets, setAvailableWidgets] = useState<number[]>([]);
  const [isStandalone, setIsStandalone] = useState<boolean>(true);

  useEffect(() => {
    loadAvailableWidgets();
    loadDefaultSettings();
  }, []);

  const loadAvailableWidgets = async (): Promise<void> => {
    try {
      const widgets = await QuoteWidget.getAllWidgetIds();
      const widgetArray: number[] = Object.values(widgets);
      setAvailableWidgets(widgetArray);
      setIsStandalone(widgetArray.length === 0);

      if (widgetArray.length > 0) {
        const widgetId = widgetArray[0];
        setCurrentWidgetId(widgetId);
        await loadWidgetSettings(widgetId);
      } else {
        setCurrentWidgetId(0);
        await loadDefaultSettings();
      }
    } catch (error) {
      console.log('Error loading widgets:', error);
      setCurrentWidgetId(0);
      await loadDefaultSettings();
    }
  };

  const loadDefaultSettings = async (): Promise<void> => {
    try {
      const settings = await QuoteWidget.getDefaultSettings();
      setWidgetSettings(settings);
      setPreviewSettings(settings);
    } catch (error) {
      console.log('Error loading default settings:', error);
    }
  };

  const loadWidgetSettings = async (widgetId: number): Promise<void> => {
    if (widgetId === null || widgetId === undefined) return;

    try {
      if (widgetId === 0) {
        await loadDefaultSettings();
        return;
      }
      const settings = await QuoteWidget.getWidgetSettings(widgetId);
      setWidgetSettings(settings);
      setPreviewSettings(settings);
    } catch (error) {
      console.log('Error loading widget settings:', error);
      Alert.alert('Error', 'Failed to load widget settings');
    }
  };

  // ✅ unified function to always apply settings to all widgets
  const applySettingsToAllWidgets = async (
    newSettings: WidgetSettings,
  ): Promise<void> => {
    try {
      await QuoteWidget.updateDefaultSettings(newSettings);

      const widgets = await QuoteWidget.getAllWidgetIds();
      const widgetArray: number[] = Object.values(widgets);

      if (widgetArray.length > 0) {
        for (const id of widgetArray) {
          await QuoteWidget.updateWidgetSettings(id, newSettings);
          await QuoteWidget.forceUpdateWidget(id);
        }
      }

      setWidgetSettings(newSettings);
      setPreviewSettings(newSettings);
      Alert.alert('Success', 'Theme applied to all widgets!');
    } catch (error) {
      console.log('Error applying settings:', error);
      Alert.alert(
        'Error',
        'Failed to apply theme: ' + (error as Error).message,
      );
    }
  };

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require('../../assets/wallpaper.jpg')}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <Header onDone={() => applySettingsToAllWidgets(previewSettings)} />
          <WidgetPreview settings={previewSettings} />
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <WidgetSettings
              settings={widgetSettings}
              onSettingsChange={applySettingsToAllWidgets}
              onLocalSettingsChange={setPreviewSettings}
            />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  widgetSelector: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 10,
  },
  content: {
    flex: 1,
    marginHorizontal: 10,
    borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
  },
  refreshButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  singleWidgetInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  widgetInfoText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default HomeScreen;
