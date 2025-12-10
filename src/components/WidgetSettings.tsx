import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import HSLColorPicker from './HSLColorPicker';
import SolidSlider from './SolidSlider';

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

const getBorderRadiusLabel = (value: number): string => {
  const map: { [key: number]: string } = {
    0: 'None',
    8: 'Sm',
    16: 'Md',
    24: 'Lg',
    32: 'XL',
    40: '2XL',
    48: '3XL',
    56: '4XL',
  };
  return map[value] || `${value}dp`;
};

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

  const fontWeights = [
    { label: 'Thin', value: '200' },
    { label: 'Medium', value: '400' },
    { label: 'Bold', value: 'bold' },
    { label: 'ExtraBold', value: '900' },
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
          <Text style={styles.label}>
            Font Size: {localSettings.fontSize}sp
          </Text>
          <SolidSlider
            value={localSettings.fontSize}
            minimumValue={10}
            maximumValue={40}
            step={1}
            trackColor="#E3E5EB"
            filledColor="#0052CC"
            onValueChange={(value: number) =>
              updateLocalSetting('fontSize', value)
            }
          />
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Font Weight</Text>
          <View style={styles.optionGrid}>
            {fontWeights.map((fw) => (
              <OptionButton
                key={fw.value}
                label={fw.label}
                selected={localSettings.fontWeight === fw.value}
                onPress={() => updateLocalSetting('fontWeight', fw.value)}
              />
            ))}
          </View>
        </View>
        <HSLColorPicker
          color={localSettings.textColor}
          onColorChange={(color) => updateLocalSetting('textColor', color)}
        />
      </SettingSection>

      <SettingSection title="Background">
        <HSLColorPicker
          color={localSettings.backgroundColor}
          onColorChange={(color) => updateLocalSetting('backgroundColor', color)}
        />
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>
            Transparency:{' '}
            {Math.round(localSettings.backgroundOpacity * 100)}%
          </Text>
          <SolidSlider
            value={localSettings.backgroundOpacity}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            trackColor="#E3E5EB"
            filledColor="#0052CC"
            onValueChange={(value: number) =>
              updateLocalSetting('backgroundOpacity', value)
            }
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.label}>
            Border Radius: {getBorderRadiusLabel(localSettings.borderRadius)}
          </Text>
          <SolidSlider
            value={localSettings.borderRadius}
            minimumValue={0}
            maximumValue={56}
            step={8}
            trackColor="#E3E5EB"
            filledColor="#0052CC"
            onValueChange={(value: number) =>
              updateLocalSetting('borderRadius', value)
            }
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
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
    marginBottom: 2,
    marginLeft: 2,
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
