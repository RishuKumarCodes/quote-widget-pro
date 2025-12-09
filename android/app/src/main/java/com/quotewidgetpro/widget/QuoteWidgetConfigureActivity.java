package com.quotewidgetpro.widget;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;

public class QuoteWidgetConfigureActivity extends Activity {
    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Set the result to CANCELED initially
        setResult(RESULT_CANCELED);
        
        // Get the widget ID from the intent
        Intent intent = getIntent();
        Bundle extras = intent.getExtras();
        if (extras != null) {
            appWidgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, 
                AppWidgetManager.INVALID_APPWIDGET_ID);
        }
        
        // If no valid widget ID, finish
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }
        
        // Save default preferences for the widget
        saveDefaultPreferences();
        
        // Update the widget
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(this);
        QuoteWidgetProvider.updateAppWidget(this, appWidgetManager, appWidgetId);
        
        // Return success
        Intent resultValue = new Intent();
        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_OK, resultValue);
        
        // Don't open the main app automatically - let user click widget to open app
        finish();
    }
    
    private void saveDefaultPreferences() {
        SharedPreferences prefs = getSharedPreferences("widget_prefs", MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        
        // Use default settings if they exist, otherwise use hardcoded defaults
        String defaultFontFamily = prefs.getString("font_family_0", "sans-serif");
        int defaultFontSize = prefs.getInt("font_size_0", 14);
        String defaultTextColorType = prefs.getString("text_color_type_0", "device");
        int defaultTextColor = prefs.getInt("text_color_0", Color.BLACK);
        boolean defaultIsBold = prefs.getBoolean("is_bold_0", false);
        String defaultBackgroundColorType = prefs.getString("background_color_type_0", "device");
        int defaultBackgroundColor = prefs.getInt("background_color_0", Color.WHITE);
        String defaultBackgroundType = prefs.getString("background_type_0", "solid");
        float defaultBackgroundOpacity = prefs.getFloat("background_opacity_0", 1.0f);
        int defaultBorderRadius = prefs.getInt("border_radius_0", 12);
        int defaultRefreshInterval = prefs.getInt("refresh_interval_0", 60);
        boolean defaultAutoTheme = prefs.getBoolean("auto_theme_0", false);
        
        editor.putString("font_family_" + appWidgetId, defaultFontFamily);
        editor.putInt("font_size_" + appWidgetId, defaultFontSize);
        editor.putString("text_color_type_" + appWidgetId, defaultTextColorType);
        editor.putInt("text_color_" + appWidgetId, defaultTextColor);
        editor.putBoolean("is_bold_" + appWidgetId, defaultIsBold);
        editor.putString("background_color_type_" + appWidgetId, defaultBackgroundColorType);
        editor.putInt("background_color_" + appWidgetId, defaultBackgroundColor);
        editor.putString("background_type_" + appWidgetId, defaultBackgroundType);
        editor.putFloat("background_opacity_" + appWidgetId, defaultBackgroundOpacity);
        editor.putInt("border_radius_" + appWidgetId, defaultBorderRadius);
        editor.putInt("refresh_interval_" + appWidgetId, defaultRefreshInterval);
        editor.putBoolean("auto_theme_" + appWidgetId, defaultAutoTheme);
        
        editor.apply();
    }
}