import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch, // Keeping Switch if needed later
} from 'react-native';
import HSLColorPicker from './HSLColorPicker';
import SimpleSlider from './Slider';

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
  onSettingsChange: (settings: WidgetSettings) => void;
  onLocalSettingsChange?: (settings: WidgetSettings) => void;
}

const SettingSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const OptionButton: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.optionButton, selected && styles.optionButtonSelected]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.optionButtonText,
        selected && styles.optionButtonTextSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const WidgetSettingsComponent: React.FC<Props> = ({
  settings,
  onSettingsChange,
  onLocalSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState<WidgetSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const refreshIntervals = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '6 hours', value: 360 },
    { label: '12 hours', value: 720 },
    { label: '24 hours', value: 1440 },
  ];

  const updateLocalSetting = <K extends keyof WidgetSettings>(
    key: K,
    value: WidgetSettings[K],
  ): void => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    if (onLocalSettingsChange) onLocalSettingsChange(newSettings);
  };

  return (
    <View style={styles.container}>
      <SettingSection title="Text Style">
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>
            Font Size: {localSettings.fontSize}sp
          </Text>
          <SimpleSlider
            value={localSettings.fontSize}
            minimumValue={10}
            maximumValue={24}
            step={1}
            onValueChange={(value: number) =>
              updateLocalSetting('fontSize', value)
            }
          />
        </View>
        <HSLColorPicker
          label="Text Color"
          color={localSettings.textColor}
          onColorChange={(color) => updateLocalSetting('textColor', color)}
        />
      </SettingSection>

      <SettingSection title="Background">
        <HSLColorPicker
          label="Background Color"
          color={localSettings.backgroundColor}
          onColorChange={(color) => updateLocalSetting('backgroundColor', color)}
        />
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>
            Background Opacity:{' '}
            {Math.round(localSettings.backgroundOpacity * 100)}%
          </Text>
          <SimpleSlider
            value={localSettings.backgroundOpacity}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            onValueChange={(value: number) =>
              updateLocalSetting('backgroundOpacity', value)
            }
          />
        </View>

        <View style={styles.optionGrid}>
          <Text style={styles.sliderLabel}>Border Radius</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {[
              { label: 'None', value: 0 },
              { label: 'Sm', value: 8 },
              { label: 'Md', value: 16 },
              { label: 'Lg', value: 24 },
              { label: 'XL', value: 32 },
              { label: '2XL', value: 40 },
              { label: '3XL', value: 48 },
              { label: '4XL', value: 56 },
            ].map(radius => (
              <OptionButton
                key={radius.value}
                label={radius.label}
                selected={localSettings.borderRadius === radius.value}
                onPress={() => updateLocalSetting('borderRadius', radius.value)}
              />
            ))}
          </View>
        </View>
      </SettingSection>

      <SettingSection title="Update Frequency">
        <View style={styles.optionGrid}>
          {refreshIntervals.map(interval => (
            <OptionButton
              key={interval.value}
              label={interval.label}
              selected={localSettings.refreshInterval === interval.value}
              onPress={() =>
                updateLocalSetting('refreshInterval', interval.value)
              }
            />
          ))}
        </View>
      </SettingSection>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 160,
  },
  section: {
    borderRadius: 35,
    backgroundColor: '#e5f0ffbb',
    marginBottom: 4,
    padding: 20,
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
    paddingVertical: 10,
    backgroundColor: '#ffffffff',
    borderRadius: 20,
    margin: 2,
  },
  optionButtonSelected: {
    backgroundColor: '#201868ff',
  },
  optionButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#ffffffff',
  },
  sliderContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 10,
    textAlign: 'center',
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
});

export default WidgetSettingsComponent;
