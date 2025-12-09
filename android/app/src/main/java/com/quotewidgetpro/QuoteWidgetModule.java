package com.quotewidgetpro;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.content.Intent;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import com.quotewidgetpro.widget.QuoteWidgetProvider;

public class QuoteWidgetModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "QuoteWidget";

    public QuoteWidgetModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void updateWidgetSettings(int widgetId, ReadableMap settings, Promise promise) {
        try {
            Context context = getReactApplicationContext();
            SharedPreferences prefs = context.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();

            // Debug logging
            android.util.Log.d("QuoteWidget", "Updating widget " + widgetId + " with settings: " + settings.toString());

            // Save all settings
            if (settings.hasKey("fontFamily")) {
                editor.putString("font_family_" + widgetId, settings.getString("fontFamily"));
            }
            if (settings.hasKey("fontSize")) {
                editor.putInt("font_size_" + widgetId, settings.getInt("fontSize"));
            }
            if (settings.hasKey("textColor")) {
                String textColor = settings.getString("textColor");
                if ("device".equals(textColor)) {
                    editor.putString("text_color_type_" + widgetId, "device");
                    editor.remove("text_color_" + widgetId); // Remove custom color when using device
                } else {
                    editor.putString("text_color_type_" + widgetId, "custom");
                    try {
                        editor.putInt("text_color_" + widgetId, Color.parseColor(textColor));
                    } catch (IllegalArgumentException e) {
                        android.util.Log.w("QuoteWidget", "Invalid color format: " + textColor + ", using default");
                        editor.putInt("text_color_" + widgetId, Color.BLACK);
                    }
                }
            }
            if (settings.hasKey("isBold")) {
                editor.putBoolean("is_bold_" + widgetId, settings.getBoolean("isBold"));
            }
            if (settings.hasKey("backgroundColor")) {
                String bgColor = settings.getString("backgroundColor");
                if ("device".equals(bgColor)) {
                    editor.putString("background_color_type_" + widgetId, "device");
                    editor.remove("background_color_" + widgetId); // Remove custom color when using device
                } else {
                    editor.putString("background_color_type_" + widgetId, "custom");
                    try {
                        editor.putInt("background_color_" + widgetId, Color.parseColor(bgColor));
                    } catch (IllegalArgumentException e) {
                        android.util.Log.w("QuoteWidget", "Invalid color format: " + bgColor + ", using default");
                        editor.putInt("background_color_" + widgetId, Color.WHITE);
                    }
                }
            }
            if (settings.hasKey("backgroundType")) {
                editor.putString("background_type_" + widgetId, settings.getString("backgroundType"));
            }
            if (settings.hasKey("backgroundOpacity")) {
                editor.putFloat("background_opacity_" + widgetId, (float) settings.getDouble("backgroundOpacity"));
            }
            if (settings.hasKey("borderRadius")) {
                editor.putInt("border_radius_" + widgetId, settings.getInt("borderRadius"));
            }
            if (settings.hasKey("refreshInterval")) {
                editor.putInt("refresh_interval_" + widgetId, settings.getInt("refreshInterval"));
            }
            if (settings.hasKey("autoTheme")) {
                editor.putBoolean("auto_theme_" + widgetId, settings.getBoolean("autoTheme"));
            }

            editor.apply();

            android.util.Log.d("QuoteWidget", "Settings saved for widget " + widgetId);

            // Update all widgets if widgetId is 0 (default settings) or update specific widget
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            if (widgetId == 0) {
                // Update all widgets with default settings
                ComponentName component = new ComponentName(context, QuoteWidgetProvider.class);
                int[] widgetIds = appWidgetManager.getAppWidgetIds(component);
                android.util.Log.d("QuoteWidget", "Updating all widgets: " + widgetIds.length + " widgets found");
                for (int id : widgetIds) {
                    QuoteWidgetProvider.updateAppWidget(context, appWidgetManager, id);
                }
            } else {
                // Update specific widget
                android.util.Log.d("QuoteWidget", "Updating specific widget: " + widgetId);
                QuoteWidgetProvider.updateAppWidget(context, appWidgetManager, widgetId);
            }

            // Force widget update by sending broadcast
            Intent updateIntent = new Intent(context, QuoteWidgetProvider.class);
            updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            if (widgetId == 0) {
                // Update all widgets
                ComponentName component = new ComponentName(context, QuoteWidgetProvider.class);
                int[] widgetIds = appWidgetManager.getAppWidgetIds(component);
                updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds);
            } else {
                // Update specific widget
                updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{widgetId});
            }
            context.sendBroadcast(updateIntent);

            // Additional force update
            if (widgetId != 0) {
                appWidgetManager.notifyAppWidgetViewDataChanged(widgetId, R.id.widget_container);
            }

            android.util.Log.d("QuoteWidget", "Widget update completed for widget " + widgetId);
            promise.resolve("Widget updated successfully");
        } catch (Exception e) {
            android.util.Log.e("QuoteWidget", "Error updating widget: " + e.getMessage(), e);
            promise.reject("UPDATE_ERROR", "Failed to update widget: " + e.getMessage());
        }
    }

    @ReactMethod
    public void updateDefaultSettings(ReadableMap settings, Promise promise) {
        updateWidgetSettings(0, settings, promise);
    }

    @ReactMethod
    public void getWidgetSettings(int widgetId, Promise promise) {
        try {
            Context context = getReactApplicationContext();
            SharedPreferences prefs = context.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE);

            WritableMap settings = new WritableNativeMap();
            
            // Check if widget-specific settings exist, otherwise use default settings
            boolean hasWidgetSettings = prefs.contains("font_family_" + widgetId);
            String suffix = hasWidgetSettings ? "_" + widgetId : "_0";
            
            settings.putString("fontFamily", prefs.getString("font_family" + suffix, "sans-serif"));
            settings.putInt("fontSize", prefs.getInt("font_size" + suffix, 14));
            
            // Handle text color
            String textColorType = prefs.getString("text_color_type" + suffix, "custom");
            if ("device".equals(textColorType)) {
                settings.putString("textColor", "device");
            } else {
                int textColorInt = prefs.getInt("text_color" + suffix, Color.BLACK);
                settings.putString("textColor", String.format("#%08X", (0xFFFFFFFF & textColorInt)));
            }
            
            settings.putBoolean("isBold", prefs.getBoolean("is_bold" + suffix, false));
            
            // Handle background color
            String backgroundColorType = prefs.getString("background_color_type" + suffix, "custom");
            if ("device".equals(backgroundColorType)) {
                settings.putString("backgroundColor", "device");
            } else {
                int backgroundColorInt = prefs.getInt("background_color" + suffix, Color.WHITE);
                settings.putString("backgroundColor", String.format("#%08X", (0xFFFFFFFF & backgroundColorInt)));
            }
            
            settings.putString("backgroundType", prefs.getString("background_type" + suffix, "solid"));
            settings.putDouble("backgroundOpacity", prefs.getFloat("background_opacity" + suffix, 1.0f));
            settings.putInt("borderRadius", prefs.getInt("border_radius" + suffix, 12));
            settings.putInt("refreshInterval", prefs.getInt("refresh_interval" + suffix, 60));
            settings.putBoolean("autoTheme", prefs.getBoolean("auto_theme" + suffix, false));

            promise.resolve(settings);
        } catch (Exception e) {
            promise.reject("GET_ERROR", "Failed to get widget settings: " + e.getMessage());
        }
    }

    @ReactMethod
    public void getDefaultSettings(Promise promise) {
        getWidgetSettings(0, promise);
    }

    @ReactMethod
    public void forceUpdateWidget(int widgetId, Promise promise) {
        try {
            Context context = getReactApplicationContext();
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            QuoteWidgetProvider.updateAppWidget(context, appWidgetManager, widgetId);
            promise.resolve("Widget force updated successfully");
        } catch (Exception e) {
            promise.reject("UPDATE_ERROR", "Failed to force update widget: " + e.getMessage());
        }
    }

    @ReactMethod
    public void getAllWidgetIds(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName component = new ComponentName(context, QuoteWidgetProvider.class);
            int[] widgetIds = appWidgetManager.getAppWidgetIds(component);
            
            WritableMap result = new WritableNativeMap();
            for (int i = 0; i < widgetIds.length; i++) {
                result.putInt(String.valueOf(i), widgetIds[i]);
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("GET_IDS_ERROR", "Failed to get widget IDs: " + e.getMessage());
        }
    }
}