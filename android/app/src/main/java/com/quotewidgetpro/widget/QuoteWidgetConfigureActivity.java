package com.quotewidgetpro.widget;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.content.SharedPreferences;
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
        String defaultFontFamily = prefs.getString("default_font_family", "sans-serif");
        int defaultFontSize = prefs.getInt("default_font_size", 14);
        int defaultTextColor = prefs.getInt("default_text_color", 0xFF000000);
        boolean defaultIsBold = prefs.getBoolean("default_is_bold", false);
        int defaultBackgroundColor = prefs.getInt("default_background_color", 0xFFFFFFFF);
        String defaultBackgroundType = prefs.getString("default_background_type", "solid");
        int defaultBorderRadius = prefs.getInt("default_border_radius", 12);
        int defaultRefreshInterval = prefs.getInt("default_refresh_interval", 60);
        boolean defaultAutoTheme = prefs.getBoolean("default_auto_theme", false);
        
        editor.putString("font_family_" + appWidgetId, defaultFontFamily);
        editor.putInt("font_size_" + appWidgetId, defaultFontSize);
        editor.putInt("text_color_" + appWidgetId, defaultTextColor);
        editor.putBoolean("is_bold_" + appWidgetId, defaultIsBold);
        editor.putInt("background_color_" + appWidgetId, defaultBackgroundColor);
        editor.putString("background_type_" + appWidgetId, defaultBackgroundType);
        editor.putInt("border_radius_" + appWidgetId, defaultBorderRadius);
        editor.putInt("refresh_interval_" + appWidgetId, defaultRefreshInterval);
        editor.putBoolean("auto_theme_" + appWidgetId, defaultAutoTheme);
        
        editor.apply();
    }
}