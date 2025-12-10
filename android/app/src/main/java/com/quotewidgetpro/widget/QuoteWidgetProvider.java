package com.quotewidgetpro.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.SystemClock;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.StyleSpan;
import android.text.style.TypefaceSpan;
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

        // Get widget preferences - fallback to default settings (id 0) if
        // widget-specific settings don't exist
        SharedPreferences prefs = context.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE);

        // Check if widget-specific settings exist
        boolean hasWidgetSettings = prefs.contains("font_family_" + appWidgetId);
        String settingsSuffix = hasWidgetSettings ? "_" + appWidgetId : "_0";

        String fontFamily = prefs.getString("font_family" + settingsSuffix, "sans-serif");
        int fontSize = prefs.getInt("font_size" + settingsSuffix, 14);

        // Try to get specific font weight, otherwise fallback to default (widget 0)
        // font weight
        String globalFontWeight = prefs.getString("font_weight_0", "400");
        String fontWeight = prefs.getString("font_weight" + settingsSuffix, globalFontWeight);

        String backgroundType = prefs.getString("background_type" + settingsSuffix, "solid");
        int borderRadius = prefs.getInt("border_radius" + settingsSuffix, 12);
        float backgroundOpacity = prefs.getFloat("background_opacity" + settingsSuffix, 1.0f);
        boolean autoTheme = prefs.getBoolean("auto_theme" + settingsSuffix, false);

        // Get text color
        int textColor;
        String textColorType = prefs.getString("text_color_type" + settingsSuffix, "custom");
        if ("device".equals(textColorType)) {
            textColor = getDeviceTextColor(context);
        } else {
            textColor = prefs.getInt("text_color" + settingsSuffix, Color.BLACK);
        }

        // Get background color
        int backgroundColor;
        String backgroundColorType = prefs.getString("background_color_type" + settingsSuffix, "custom");
        if ("device".equals(backgroundColorType)) {
            backgroundColor = getDeviceBackgroundColor(context);
        } else {
            backgroundColor = prefs.getInt("background_color" + settingsSuffix, Color.WHITE);
        }

        // Debug logging
        android.util.Log.d("QuoteWidget", "Widget " + appWidgetId + " settings: fontSize=" + fontSize +
                ", textColor=" + String.format("#%08X", textColor) +
                ", backgroundColor=" + String.format("#%08X", backgroundColor) +
                ", borderRadius=" + borderRadius +
                ", backgroundOpacity=" + backgroundOpacity +
                ", fontWeight=" + fontWeight +
                ", hasWidgetSettings=" + hasWidgetSettings);

        // Get random quote
        Quote quote = getRandomQuote(context);

        // Update quote text
        // Update quote text with styling
        views.setTextViewText(R.id.quote_text, applyFontWeight(quote.text, fontWeight));
        views.setTextViewText(R.id.quote_author, applyFontWeight("— " + quote.author, fontWeight)); // Apply same weight
                                                                                                    // to author? Or
                                                                                                    // keep it
                                                                                                    // normal/italic?
        // Author usually italic. Applying weight might overlap.
        // Let's just set text for author normally as it has italic style in XML, but
        // user might want bold.
        // If we use TypefaceSpan it overrides fontFamily in XML but not style.
        // Let's stick to simple text for author for now as user asked for font weight
        // implementation generally.
        // Reverting author to simple text to avoid conflict with italic, or applying
        // generic weight?
        // Let's just apply to quote text primarily.
        views.setTextViewText(R.id.quote_author, "— " + quote.author);

        // Apply text styling
        views.setTextViewTextSize(R.id.quote_text, TypedValue.COMPLEX_UNIT_SP, fontSize);
        views.setTextViewTextSize(R.id.quote_author, TypedValue.COMPLEX_UNIT_SP, fontSize * 0.8f);
        views.setTextColor(R.id.quote_text, textColor);
        views.setTextColor(R.id.quote_author, adjustColorOpacity(textColor, 0.7f));

        // Note: Font family and bold are not applied here because RemoteViews doesn't
        // support
        // setTypeface() method. These settings should be configured in the XML layout
        // instead.

        // Apply background
        applyBackground(context, views, backgroundColor, backgroundType, borderRadius, backgroundOpacity);

        // Set up click to open app
        Intent appIntent = new Intent(context, MainActivity.class);
        appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, appWidgetId,
                appIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static int getDeviceTextColor(Context context) {
        try {
            // For Android 12+ (API 31+), use Material You dynamic colors
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // Try to get Material You text color
                TypedValue typedValue = new TypedValue();
                if (context.getTheme().resolveAttribute(android.R.attr.textColorPrimary, typedValue, true)) {
                    if (typedValue.resourceId != 0) {
                        return context.getResources().getColor(typedValue.resourceId, context.getTheme());
                    } else {
                        return typedValue.data;
                    }
                }
            }

            // Fallback to system text color
            TypedValue typedValue = new TypedValue();
            if (context.getTheme().resolveAttribute(android.R.attr.textColorPrimary, typedValue, true)) {
                return typedValue.data;
            }
        } catch (Exception e) {
            android.util.Log.e("QuoteWidget", "Error getting device text color: " + e.getMessage());
        }

        // Final fallback based on dark mode
        int nightMode = context.getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        return (nightMode == Configuration.UI_MODE_NIGHT_YES) ? Color.WHITE : Color.BLACK;
    }

    private static int getDeviceBackgroundColor(Context context) {
        try {
            // For Android 12+ (API 31+), use Material You dynamic colors
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // Try to get Material You background color
                TypedValue typedValue = new TypedValue();
                if (context.getTheme().resolveAttribute(android.R.attr.colorBackground, typedValue, true)) {
                    if (typedValue.resourceId != 0) {
                        return context.getResources().getColor(typedValue.resourceId, context.getTheme());
                    } else {
                        return typedValue.data;
                    }
                }
            }

            // Fallback to window background
            TypedValue typedValue = new TypedValue();
            if (context.getTheme().resolveAttribute(android.R.attr.windowBackground, typedValue, true)) {
                if (typedValue.type >= TypedValue.TYPE_FIRST_COLOR_INT
                        && typedValue.type <= TypedValue.TYPE_LAST_COLOR_INT) {
                    return typedValue.data;
                }
            }
        } catch (Exception e) {
            android.util.Log.e("QuoteWidget", "Error getting device background color: " + e.getMessage());
        }

        // Final fallback based on dark mode
        int nightMode = context.getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        return (nightMode == Configuration.UI_MODE_NIGHT_YES) ? Color.parseColor("#1F1F1F") : Color.WHITE;
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

    private static void applyBackground(Context context, RemoteViews views, int backgroundColor,
            String backgroundType, int borderRadius, float backgroundOpacity) {

        try {
            // Calculate alpha 0-255
            int alpha = Math.round(backgroundOpacity * 255);

            // Get opaque version of background color for filtering
            int opaqueColor = Color.rgb(Color.red(backgroundColor), Color.green(backgroundColor),
                    Color.blue(backgroundColor));

            // If opacity is effective 0, strict transparent
            if (backgroundOpacity <= 0.05f) {
                alpha = 0;
            }

            // Get background drawable resource based on radius
            int backgroundRes = getBackgroundDrawableForRadius(borderRadius);

            if (alpha == 0) {
                // If transparent, hide the image view or set strict transparent
                views.setInt(R.id.widget_background_image, "setColorFilter", Color.TRANSPARENT);
                views.setImageViewResource(R.id.widget_background_image, 0); // Remove drawable
                views.setInt(R.id.widget_background_image, "setImageAlpha", 0);
            } else {
                // Apply drawable, color filter (opaque), and then alpha to the view/drawable
                views.setImageViewResource(R.id.widget_background_image, backgroundRes);
                views.setInt(R.id.widget_background_image, "setColorFilter", opaqueColor);
                views.setInt(R.id.widget_background_image, "setImageAlpha", alpha);
            }

            android.util.Log.d("QuoteWidget",
                    "Applied background - res: " + backgroundRes + ", color: " + String.format("#%08X", opaqueColor)
                            + ", alpha: " + alpha);

        } catch (Exception e) {
            android.util.Log.e("QuoteWidget", "Error applying background: " + e.getMessage());
        }
    }

    private static int getBackgroundDrawableForRadius(int radius) {
        if (radius == 0) {
            return R.drawable.widget_background; // Square
        } else if (radius <= 8) {
            return R.drawable.widget_background_8dp;
        } else if (radius <= 16) {
            return R.drawable.widget_background_16dp;
        } else if (radius <= 24) {
            return R.drawable.widget_background_24dp;
        } else if (radius <= 32) {
            return R.drawable.widget_background_32dp;
        } else if (radius <= 40) {
            return R.drawable.widget_background_40dp;
        } else if (radius <= 48) {
            return R.drawable.widget_background_48dp;
        } else {
            return R.drawable.widget_background_56dp; // 4XL (56dp)
        }
    }

    private static int adjustColorOpacity(int color, float opacity) {
        int alpha = Math.round(Color.alpha(color) * opacity);
        return Color.argb(alpha, Color.red(color), Color.green(color), Color.blue(color));
    }

    private static void scheduleNextUpdate(Context context, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE);
        boolean hasWidgetSettings = prefs.contains("refresh_interval_" + appWidgetId);
        String suffix = hasWidgetSettings ? "_" + appWidgetId : "_0";
        int intervalMinutes = prefs.getInt("refresh_interval" + suffix, 60);

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
        editor.remove("text_color_type_" + appWidgetId);
        editor.remove("font_weight_" + appWidgetId);
        editor.remove("background_color_" + appWidgetId);
        editor.remove("background_color_type_" + appWidgetId);
        editor.remove("background_type_" + appWidgetId);
        editor.remove("background_opacity_" + appWidgetId);
        editor.remove("border_radius_" + appWidgetId);
        editor.remove("refresh_interval_" + appWidgetId);
        editor.remove("auto_theme_" + appWidgetId);

        editor.apply();
    }

    private static CharSequence applyFontWeight(String text, String fontWeight) {
        SpannableString spannable = new SpannableString(text);

        // Default to sans-serif
        String family = "sans-serif";
        int style = Typeface.NORMAL;

        switch (fontWeight) {
            case "100": // Thin
            case "200": // User requested Thin as 200
            case "thin":
                family = "sans-serif-thin";
                break;
            case "300": // Light
            case "light":
                family = "sans-serif-light";
                break;
            case "400": // Normal / User requested Medium as 400
            case "normal":
            case "regular":
                // Default is sans-serif normal
                break;
            case "500": // Medium
            case "medium":
                family = "sans-serif-medium";
                break;
            case "700": // Bold
            case "bold":
                style = Typeface.BOLD;
                break;
            case "900": // Black/ExtraBold
            case "800":
            case "extrabold":
                family = "sans-serif-black";
                break;
            default:
                break;
        }

        if (style == Typeface.BOLD) {
            spannable.setSpan(new StyleSpan(Typeface.BOLD), 0, text.length(), Spanned.SPAN_INCLUSIVE_INCLUSIVE);
        }

        if (!family.equals("sans-serif")) {
            spannable.setSpan(new TypefaceSpan(family), 0, text.length(), Spanned.SPAN_INCLUSIVE_INCLUSIVE);
        }

        return spannable;
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