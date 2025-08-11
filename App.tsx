import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  NativeModules,
} from 'react-native';
import WidgetSettings from './src/components/WidgetSettings';
import WidgetPreview from './src/components/WidgetPreview';

const {QuoteWidget} = NativeModules;

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

const App: React.FC = () => {
  const [currentWidgetId, setCurrentWidgetId] = useState<number | null>(0); // Start with default settings
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>({
    fontFamily: 'sans-serif',
    fontSize: 14,
    textColor: '#000000',
    isBold: false,
    backgroundColor: '#FFFFFF',
    backgroundType: 'solid',
    borderRadius: 12,
    refreshInterval: 60,
    autoTheme: false,
  });
  const [previewSettings, setPreviewSettings] = useState<WidgetSettings>(widgetSettings);
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
        // Always use the first (and only) widget
        const widgetId = widgetArray[0];
        setCurrentWidgetId(widgetId);
        // Load the actual settings this widget is using
        await loadWidgetSettings(widgetId);
      } else {
        // No widgets, use default settings (id 0)
        setCurrentWidgetId(0);
        await loadDefaultSettings();
      }
    } catch (error) {
      console.log('Error loading widgets:', error);
      // Fallback to default settings
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
      // Keep the initial default settings
    }
  };

  const loadWidgetSettings = async (widgetId: number): Promise<void> => {
    // allow widgetId === 0 (default) to be loaded
    if (widgetId === null || widgetId === undefined) return;
    
    try {
      if (widgetId === 0) {
        // load default settings for id 0
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

  const saveWidgetSettings = async (newSettings: WidgetSettings): Promise<void> => {
    if (currentWidgetId === null) {
      Alert.alert('Error', 'No widget selected');
      return;
    }

    try {
      if (currentWidgetId === 0) {
        // Save as default settings
        await QuoteWidget.updateDefaultSettings(newSettings);
        setWidgetSettings(newSettings);
        setPreviewSettings(newSettings);
        Alert.alert('Success', 'Default settings updated! Your widget will use these settings.');
      } else {
        // Save for the specific widget that exists on home screen
        await QuoteWidget.updateWidgetSettings(currentWidgetId, newSettings);
        setWidgetSettings(newSettings);
        setPreviewSettings(newSettings);
        Alert.alert('Success', 'Widget updated successfully! Your home screen widget has been modified.');
      }
    } catch (error) {
      console.log('Error saving settings:', error);
      Alert.alert('Error', 'Failed to update settings: ' + (error as Error).message);
    }
  };

  const forceUpdateWidget = async (): Promise<void> => {
    try {
      if (currentWidgetId === 0 || availableWidgets.length === 0) {
        // Update all widgets with default settings
        await QuoteWidget.updateDefaultSettings(widgetSettings);
        Alert.alert('Success', 'Default settings applied to all widgets!');
      } else {
        // Update the specific widget on home screen
        await QuoteWidget.forceUpdateWidget(currentWidgetId);
        Alert.alert('Success', 'Home screen widget refreshed with current settings!');
      }
    } catch (error) {
      console.log('Error refreshing widget:', error);
      Alert.alert('Error', 'Failed to refresh widget: ' + (error as Error).message);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Quote Widget Pro</Text>
        <Text style={styles.subtitle}>
          {isStandalone 
            ? 'Configure default widget settings (Add widget to home screen to see changes)'
            : 'Customize your quote widget'
          }
        </Text>
      </View>

      {!isStandalone && availableWidgets.length > 0 && (
        <View style={styles.widgetSelector}>
          <Text style={styles.sectionTitle}>Widget Settings:</Text>
          <View style={styles.singleWidgetInfo}>
            <Text style={styles.widgetInfoText}>
              Customizing your quote widget
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        <WidgetPreview settings={previewSettings} />
        
        <WidgetSettings
          settings={widgetSettings}
          onSettingsChange={saveWidgetSettings}
          onLocalSettingsChange={setPreviewSettings}
        />

        <TouchableOpacity style={styles.refreshButton} onPress={forceUpdateWidget}>
          <Text style={styles.refreshButtonText}>
            {isStandalone ? 'Apply Settings to Widget' : 'Refresh Widget Now'}
          </Text>
        </TouchableOpacity>

        {isStandalone && (
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>How to Add Widget:</Text>
            <Text style={styles.instructionText}>
              1. Long press on your home screen{'\n'}
              2. Select "Widgets"{'\n'}
              3. Find "Quote Widget Pro"{'\n'}
              4. Drag it to your home screen{'\n'}
              5. Your settings will be applied automatically!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
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
  widgetTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  widgetTabActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  widgetTabText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  widgetTabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
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
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
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

export default App;
