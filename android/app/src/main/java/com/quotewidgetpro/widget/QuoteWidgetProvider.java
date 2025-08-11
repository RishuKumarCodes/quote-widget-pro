package com.quotewidgetpro.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.SystemClock;
import android.util.TypedValue;
import android.widget.RemoteViews;

import com.quotewidgetpro.MainActivity;
import com.quotewidgetpro.R;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.util.Random;

public class QuoteWidgetProvider extends AppWidgetProvider {
    private static final String ACTION_UPDATE_WIDGET = "com.quotewidgetpro.ACTION_UPDATE_WIDGET";

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        // Called when the first widget is added
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        // Called when the last widget is removed
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
            scheduleNextUpdate(context, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        if (ACTION_UPDATE_WIDGET.equals(intent.getAction())) {
            int appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 
                AppWidgetManager.INVALID_APPWIDGET_ID);
            if (appWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
                updateAppWidget(context, appWidgetManager, appWidgetId);
                scheduleNextUpdate(context, appWidgetId);
            }
        }
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            cancelScheduledUpdate(context, appWidgetId);
            deleteWidgetPrefs(context, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.quote_widget_layout);
        
        // Get widget preferences - fallback to default settings (id 0) if widget-specific settings don't exist
        SharedPreferences prefs = context.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE);
        
        // Check if widget-specific settings exist
        boolean hasWidgetSettings = prefs.contains("font_family_" + appWidgetId);
        String settingsSuffix = hasWidgetSettings ? "_" + appWidgetId : "_0";
        
        String fontFamily = prefs.getString("font_family" + settingsSuffix, "sans-serif");
        int fontSize = prefs.getInt("font_size" + settingsSuffix, 14);
        int textColor = prefs.getInt("text_color" + settingsSuffix, Color.BLACK);
        boolean isBold = prefs.getBoolean("is_bold" + settingsSuffix, false);
        int backgroundColor = prefs.getInt("background_color" + settingsSuffix, Color.WHITE);
        String backgroundType = prefs.getString("background_type" + settingsSuffix, "solid");
        int borderRadius = prefs.getInt("border_radius" + settingsSuffix, 12);
        boolean autoTheme = prefs.getBoolean("auto_theme" + settingsSuffix, false);

        // Debug logging
        android.util.Log.d("QuoteWidget", "Widget " + appWidgetId + " settings: fontSize=" + fontSize + 
            ", textColor=" + String.format("#%08X", textColor) + 
            ", backgroundColor=" + String.format("#%08X", backgroundColor) + 
            ", hasWidgetSettings=" + hasWidgetSettings);

        // Get random quote
        Quote quote = getRandomQuote(context);
        
        // Update quote text - keep it simple
        views.setTextViewText(R.id.quote_text, quote.text);
        views.setTextViewText(R.id.quote_author, "— " + quote.author);
        
        // Apply basic text styling only
        views.setTextViewTextSize(R.id.quote_text, TypedValue.COMPLEX_UNIT_SP, fontSize);
        views.setTextViewTextSize(R.id.quote_author, TypedValue.COMPLEX_UNIT_SP, fontSize - 2);
        views.setTextColor(R.id.quote_text, textColor);
        views.setTextColor(R.id.quote_author, adjustColorOpacity(textColor, 0.7f));
        
        // Apply background color
        int finalColor = backgroundColor;
        if (backgroundType.equals("transparent")) {
            finalColor = Color.TRANSPARENT;
        } else if (backgroundType.equals("translucent")) {
            finalColor = adjustColorOpacity(backgroundColor, 0.8f);
        }
        views.setInt(R.id.widget_container, "setBackgroundColor", finalColor);
        
        // Set up click to open app
        Intent appIntent = new Intent(context, MainActivity.class);
        appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, appWidgetId, 
            appIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);
        
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static Quote getRandomQuote(Context context) {
        try {
            InputStream is = context.getAssets().open("quotes.json");
            byte[] buffer = new byte[is.available()];
            is.read(buffer);
            is.close();
            String json = new String(buffer, "UTF-8");
            
            JSONArray quotes = new JSONArray(json);
            Random random = new Random();
            JSONObject quoteObj = quotes.getJSONObject(random.nextInt(quotes.length()));
            
            return new Quote(quoteObj.getString("text"), quoteObj.getString("author"));
        } catch (Exception e) {
            // Return default quote if file reading fails
            return new Quote("The only way to do great work is to love what you do.", "Steve Jobs");
        }
    }

    private static void setFontFamily(RemoteViews views, int viewId, String fontFamily, boolean isBold) {
        // RemoteViews has limited font support, so we'll keep it simple
        try {
            // Apply font family using the most reliable method
            String typeface = "sans-serif";
            switch (fontFamily) {
                case "serif":
                    typeface = "serif";
                    break;
                case "monospace":
                    typeface = "monospace";
                    break;
                case "sans-serif-condensed":
                    typeface = "sans-serif-condensed";
                    break;
                case "casual":
                    typeface = "casual";
                    break;
                case "cursive":
                    typeface = "cursive";
                    break;
                default:
                    typeface = "sans-serif";
                    break;
            }
            
            // Try to apply font family (this might not work on all devices)
            try {
                views.setString(viewId, "setFontFamily", typeface);
            } catch (Exception e) {
                // Font family will use default
            }
            
            // Apply bold styling if needed
            if (isBold) {
                try {
                    views.setInt(viewId, "setTextStyle", android.graphics.Typeface.BOLD);
                } catch (Exception e) {
                    // Bold will use default
                }
            }
        } catch (Exception e) {
            // Fallback to default styling
        }
    }

    private static void applyBackground(Context context, RemoteViews views, int backgroundColor, 
            String backgroundType, int borderRadius, boolean autoTheme) {
        
        if (autoTheme) {
            // Get system theme colors (simplified approach)
            TypedValue typedValue = new TypedValue();
            context.getTheme().resolveAttribute(android.R.attr.windowBackground, typedValue, true);
            if (typedValue.resourceId != 0) {
                backgroundColor = context.getResources().getColor(typedValue.resourceId);
            }
        }
        
        // Create background drawable programmatically
        int finalColor = backgroundColor;
        switch (backgroundType) {
            case "transparent":
                finalColor = Color.TRANSPARENT;
                break;
            case "translucent":
                finalColor = adjustColorOpacity(backgroundColor, 0.8f);
                break;
            case "solid":
            default:
                finalColor = backgroundColor;
                break;
        }
        
        // Apply background color - this is the most reliable method for RemoteViews
        // For now, we'll skip border radius to avoid the "Can't load widget" error
        views.setInt(R.id.widget_container, "setBackgroundColor", finalColor);
    }

    private static int adjustColorOpacity(int color, float opacity) {
        int alpha = Math.round(Color.alpha(color) * opacity);
        return Color.argb(alpha, Color.red(color), Color.green(color), Color.blue(color));
    }

    private static void scheduleNextUpdate(Context context, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE);
        int intervalMinutes = prefs.getInt("refresh_interval_" + appWidgetId, 60); // Default 1 hour
        
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, QuoteWidgetProvider.class);
        intent.setAction(ACTION_UPDATE_WIDGET);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, appWidgetId, intent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        
        long triggerTime = SystemClock.elapsedRealtime() + (intervalMinutes * 60 * 1000);
        
        // Check if we can schedule exact alarms
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME, triggerTime, pendingIntent);
            } else {
                // Fallback to inexact alarms if exact alarms are not allowed
                alarmManager.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME, triggerTime, pendingIntent);
            }
        } else {
            // For older Android versions
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME, triggerTime, pendingIntent);
        }
    }

    private static void cancelScheduledUpdate(Context context, int appWidgetId) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, QuoteWidgetProvider.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, appWidgetId, intent, 
            PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
        
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent);
            pendingIntent.cancel();
        }
    }

    private static void deleteWidgetPrefs(Context context, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        
        editor.remove("font_family_" + appWidgetId);
        editor.remove("font_size_" + appWidgetId);
        editor.remove("text_color_" + appWidgetId);
        editor.remove("is_bold_" + appWidgetId);
        editor.remove("background_color_" + appWidgetId);
        editor.remove("background_type_" + appWidgetId);
        editor.remove("border_radius_" + appWidgetId);
        editor.remove("refresh_interval_" + appWidgetId);
        editor.remove("auto_theme_" + appWidgetId);
        
        editor.apply();
    }

    static class Quote {
        String text;
        String author;
        
        Quote(String text, String author) {
            this.text = text;
            this.author = author;
        }
    }
}