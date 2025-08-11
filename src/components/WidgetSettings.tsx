import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
} from 'react-native';
import ColorPicker from './ColorPicker';
import Slider from './Slider';

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
  onSettingsChange: (settings: WidgetSettings) => void;
  onLocalSettingsChange?: (settings: WidgetSettings) => void;
}

interface FontFamily {
  label: string;
  value: string;
}

interface BackgroundType {
  label: string;
  value: string;
}

interface RefreshInterval {
  label: string;
  value: number;
}

const WidgetSettingsComponent: React.FC<Props> = ({settings, onSettingsChange, onLocalSettingsChange}) => {
  const [localSettings, setLocalSettings] = useState<WidgetSettings>(settings);
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'background' | null>(null);
  const [tempColor, setTempColor] = useState<string>('#000000');

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const fontFamilies: FontFamily[] = [
    {label: 'Sans Serif', value: 'sans-serif'},
    {label: 'Serif', value: 'serif'},
    {label: 'Monospace', value: 'monospace'},
    {label: 'Condensed', value: 'sans-serif-condensed'},
    {label: 'Casual', value: 'casual'},
    {label: 'Cursive', value: 'cursive'},
  ];

  const backgroundTypes: BackgroundType[] = [
    {label: 'Solid', value: 'solid'},
    {label: 'Transparent', value: 'transparent'},
    {label: 'Translucent', value: 'translucent'},
  ];

  const refreshIntervals: RefreshInterval[] = [
    {label: '15 minutes', value: 15},
    {label: '30 minutes', value: 30},
    {label: '1 hour', value: 60},
    {label: '2 hours', value: 120},
    {label: '6 hours', value: 360},
    {label: '12 hours', value: 720},
    {label: '24 hours', value: 1440},
  ];

  const updateLocalSetting = <K extends keyof WidgetSettings>(key: K, value: WidgetSettings[K]): void => {
    const newSettings = {...localSettings, [key]: value};
    setLocalSettings(newSettings);
    // Notify parent component of local changes for real-time preview
    if (onLocalSettingsChange) {
      onLocalSettingsChange(newSettings);
    }
  };

  const saveSettings = (): void => {
    onSettingsChange(localSettings);
  };

  const openColorPicker = (type: 'text' | 'background'): void => {
    setTempColor(type === 'text' ? localSettings.textColor : localSettings.backgroundColor);
    setShowColorPicker(type);
  };

  const applyColor = (): void => {
    if (showColorPicker === 'text') {
      updateLocalSetting('textColor', tempColor);
    } else if (showColorPicker === 'background') {
      updateLocalSetting('backgroundColor', tempColor);
    }
    setShowColorPicker(null);
  };

  const SettingSection: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const OptionButton: React.FC<{
    label: string;
    selected: boolean;
    onPress: () => void;
  }> = ({label, selected, onPress}) => (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.optionButtonSelected]}
      onPress={onPress}>
      <Text
        style={[
          styles.optionButtonText,
          selected && styles.optionButtonTextSelected,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SettingSection title="Font">
        <View style={styles.optionGrid}>
          {fontFamilies.map(font => (
            <OptionButton
              key={font.value}
              label={font.label}
              selected={localSettings.fontFamily === font.value}
              onPress={() => updateLocalSetting('fontFamily', font.value)}
            />
          ))}
        </View>
        
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Font Size: {localSettings.fontSize}sp</Text>
          <Slider
            value={localSettings.fontSize}
            minimumValue={10}
            maximumValue={24}
            step={1}
            onValueChange={(value: number) => updateLocalSetting('fontSize', Math.round(value))}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Bold Text</Text>
          <Switch
            value={localSettings.isBold}
            onValueChange={(value: boolean) => updateLocalSetting('isBold', value)}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={localSettings.isBold ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </SettingSection>

      <SettingSection title="Colors">
        <View style={styles.colorRow}>
          <Text style={styles.colorLabel}>Text Color</Text>
          <TouchableOpacity
            style={[styles.colorButton, {backgroundColor: localSettings.textColor}]}
            onPress={() => openColorPicker('text')}
          />
        </View>
        
        <View style={styles.colorRow}>
          <Text style={styles.colorLabel}>Background Color</Text>
          <TouchableOpacity
            style={[styles.colorButton, {backgroundColor: localSettings.backgroundColor}]}
            onPress={() => openColorPicker('background')}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Auto Theme</Text>
          <Switch
            value={localSettings.autoTheme}
            onValueChange={(value: boolean) => updateLocalSetting('autoTheme', value)}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={localSettings.autoTheme ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </SettingSection>

      <SettingSection title="Background">
        <View style={styles.optionGrid}>
          {backgroundTypes.map(type => (
            <OptionButton
              key={type.value}
              label={type.label}
              selected={localSettings.backgroundType === type.value}
              onPress={() => updateLocalSetting('backgroundType', type.value)}
            />
          ))}
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Border Radius: {localSettings.borderRadius}dp</Text>
          <Slider
            value={localSettings.borderRadius}
            minimumValue={0}
            maximumValue={30}
            step={1}
            onValueChange={(value: number) => updateLocalSetting('borderRadius', Math.round(value))}
          />
        </View>
      </SettingSection>

      <SettingSection title="Update Frequency">
        <View style={styles.optionGrid}>
          {refreshIntervals.map(interval => (
            <OptionButton
              key={interval.value}
              label={interval.label}
              selected={localSettings.refreshInterval === interval.value}
              onPress={() => updateLocalSetting('refreshInterval', interval.value)}
            />
          ))}
        </View>
      </SettingSection>

      <Modal
        visible={showColorPicker !== null}
        transparent={true}
        animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.colorPickerModal}>
            <Text style={styles.modalTitle}>
              Choose {showColorPicker === 'text' ? 'Text' : 'Background'} Color
            </Text>
            <ColorPicker
              color={tempColor}
              onColorChange={setTempColor}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowColorPicker(null)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyColor}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Button */}
      <View style={styles.saveSection}>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 15,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  optionButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  optionButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  sliderContainer: {
    marginTop: 15,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#495057',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  colorLabel: {
    fontSize: 16,
    color: '#495057',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#212529',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  applyButton: {
    backgroundColor: '#007bff',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WidgetSettingsComponent;