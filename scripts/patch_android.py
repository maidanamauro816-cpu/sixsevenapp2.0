#!/usr/bin/env python3
"""Ajusta el proyecto Android generado por Capacitor y registra 15 iconos alternativos SixSeven."""
import pathlib
import re
import sys

ROOT = pathlib.Path("android")
manifest = ROOT / "app/src/main/AndroidManifest.xml"
if not manifest.exists():
    sys.exit("No existe android/ — ejecutá primero npx cap add android.")
xml = manifest.read_text(encoding="utf-8")

perms = [
    "android.permission.INTERNET",
    "android.permission.CAMERA",
    "android.permission.RECORD_AUDIO",
    "android.permission.MODIFY_AUDIO_SETTINGS",
    "android.permission.POST_NOTIFICATIONS",
]
for perm in perms:
    if perm not in xml:
        xml = xml.replace("</manifest>", f'    <uses-permission android:name="{perm}" />\n</manifest>')

# Solo vertical, como en el diseño.
if "android:screenOrientation" not in xml:
    xml = re.sub(r"(<activity\b)", r'\1 android:screenOrientation="portrait"', xml, count=1)

# Android muestra únicamente el alias activo como icono del lanzador.
activity_match = re.search(r'<activity\b(?=[^>]*android:name="[^"]*MainActivity")[\s\S]*?</activity>', xml)
if not activity_match:
    sys.exit("No se encontró .MainActivity en AndroidManifest.xml.")
main_activity = activity_match.group(0)
main_activity = re.sub(
    r'\s*<intent-filter>\s*<action android:name="android.intent.action.MAIN"\s*/>\s*<category android:name="android.intent.category.LAUNCHER"\s*/>\s*</intent-filter>',
    '',
    main_activity,
)
xml = xml[:activity_match.start()] + main_activity + xml[activity_match.end():]

icons = [
    ("shield-blue-gold","ShieldBlueGold","ss_icon_shield_blue_gold","#123A73","#F6C343","shield"),
    ("shield-red-white","ShieldRedWhite","ss_icon_shield_red_white","#8F1727","#FFFFFF","shield"),
    ("shield-blue-red","ShieldBlueRed","ss_icon_shield_blue_red","#173B8E","#F04444","shield"),
    ("ball-sky-white","BallSkyWhite","ss_icon_ball_sky_white","#D8EFFF","#2685C5","ball"),
    ("ball-green-yellow","BallGreenYellow","ss_icon_ball_green_yellow","#167345","#F6DF43","ball"),
    ("number-67-gold","Number67Gold","ss_icon_number_67_gold","#151515","#F5C451","67"),
    ("number-7-gold","Number7Gold","ss_icon_number_7_gold","#151515","#F5C451","7"),
    ("number-10-gold","Number10Gold","ss_icon_number_10_gold","#151515","#F5C451","10"),
    ("sixseven-crown","SixSevenCrown","ss_icon_sixseven_crown","#17120A","#F5C451","crown"),
    ("neon-red","NeonRed","ss_icon_neon_red","#080808","#FF2929","sx"),
    ("neon-blue","NeonBlue","ss_icon_neon_blue","#061322","#4C9FFF","sx"),
    ("purple-crown","PurpleCrown","ss_icon_purple_crown","#1B1030","#BD8AFF","crown"),
    ("silver-67","Silver67","ss_icon_silver_67","#181A1C","#DCE3E8","67"),
    ("fireball","Fireball","ss_icon_fireball","#27100A","#FF782E","fire"),
    ("lightning","Lightning","ss_icon_lightning","#161506","#F5E342","bolt"),
]
shapes = {
    "shield": 'M54,18 L82,28 L78,57 C74,73 64,84 54,91 C44,84 34,73 30,57 L26,28 Z',
    "ball": 'M54,20 C73,20 88,35 88,54 C88,73 73,88 54,88 C35,88 20,73 20,54 C20,35 35,20 54,20 Z',
    "67": 'M65,26 L43,26 L29,41 L29,66 C29,78 37,84 49,84 L54,84 C66,84 72,76 72,65 C72,53 64,47 52,47 L40,47 L40,43 L49,35 L65,35 Z M70,26 L88,26 L72,49 L62,49 L77,35 L70,35 Z',
    "7": 'M30,27 L80,27 L80,38 L54,82 L40,82 L66,39 L30,39 Z',
    "10": 'M30,35 L42,27 L42,80 L30,80 Z M62,27 C76,27 82,38 82,54 C82,70 76,81 62,81 C48,81 42,70 42,54 C42,38 48,27 62,27 Z M62,39 C57,39 55,45 55,54 C55,63 57,69 62,69 C67,69 69,63 69,54 C69,45 67,39 62,39 Z',
    "crown": 'M23,38 L40,51 L53,27 L67,51 L85,36 L79,73 L29,73 Z M31,79 L77,79 L77,85 L31,85 Z',
    "sx": 'M27,30 L61,30 L61,41 L41,41 L35,48 L55,58 L55,69 L45,80 L23,80 L23,69 L40,69 L45,64 L25,54 L25,44 Z M64,30 L84,30 L84,41 L72,41 L72,50 L83,50 L83,61 L72,61 L72,69 L85,69 L85,80 L61,80 L61,30 Z',
    "fire": 'M58,20 C64,35 81,42 78,61 C76,78 64,88 51,88 C36,88 26,76 29,61 C31,48 42,43 44,31 C53,39 54,48 51,56 C62,49 63,37 58,20 Z M52,61 C43,69 45,79 53,81 C61,79 63,70 57,63 Z',
    "bolt": 'M60,18 L31,58 L49,58 L43,89 L78,44 L59,44 Z',
}
# Secondary line work makes the two ball options read as footballs.
extra_paths = {
    "ball": '<path android:fillColor="#00000000" android:strokeColor="{accent}" android:strokeWidth="3" android:pathData="M54,35 L68,45 L63,62 L45,62 L40,45 Z M54,35 L54,22 M68,45 L84,40 M63,62 L72,76 M45,62 L35,76 M40,45 L24,40"/>',
}
drawable_dir = ROOT / "app/src/main/res/drawable"
drawable_dir.mkdir(parents=True, exist_ok=True)
alias_entries = []
alias_map = []
for alias_id, suffix, resource, background, accent, shape in icons:
    extra = extra_paths.get(shape, "").format(accent=accent)
    vector = f'''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="{background}" android:pathData="M18,0 L90,0 C100,0 108,8 108,18 L108,90 C108,100 100,108 90,108 L18,108 C8,108 0,100 0,90 L0,18 C0,8 8,0 18,0 Z"/>
    <path android:fillColor="{accent}" android:pathData="{shapes[shape]}"/>
    {extra}
</vector>
'''
    (drawable_dir / f"{resource}.xml").write_text(vector, encoding="utf-8")
    enabled = "true" if alias_id == "sixseven-crown" else "false"
    alias_entries.append(f'''        <activity-alias
            android:name=".IconAlias{suffix}"
            android:enabled="{enabled}"
            android:exported="true"
            android:icon="@drawable/{resource}"
            android:label="@string/app_name"
            android:targetActivity=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity-alias>''')
    alias_map.append(f'        ALIASES.put("{alias_id}", "{suffix}");')

marker = "<!-- SIXSEVEN_ICON_ALIASES -->"
if marker not in xml:
    xml = xml.replace("</application>", "        " + marker + "\n" + "\n".join(alias_entries) + "\n    </application>")
manifest.write_text(xml, encoding="utf-8")
print("AndroidManifest.xml: 15 iconos alternativos configurados")

# Capacitor custom native plugin for switching the enabled launcher alias.
java_dir = ROOT / "app/src/main/java/com/sixseven/app"
java_dir.mkdir(parents=True, exist_ok=True)
plugin = '''package com.sixseven.app;

import android.content.ComponentName;
import android.content.pm.PackageManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.LinkedHashMap;
import java.util.Map;

@CapacitorPlugin(name = "IconChanger")
public class IconChangerPlugin extends Plugin {
    private static final Map<String, String> ALIASES = new LinkedHashMap<>();
    static {
''' + "\n".join(alias_map) + '''
    }

    @PluginMethod
    public void changeIcon(PluginCall call) {
        String alias = call.getString("alias");
        String suffix = ALIASES.get(alias);
        if (suffix == null) {
            call.reject("Ícono no reconocido");
            return;
        }
        PackageManager manager = getContext().getPackageManager();
        String selected = getContext().getPackageName() + ".IconAlias" + suffix;
        try {
            manager.setComponentEnabledSetting(
                new ComponentName(getContext(), selected),
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            );
            for (String value : ALIASES.values()) {
                String className = getContext().getPackageName() + ".IconAlias" + value;
                if (!className.equals(selected)) {
                    manager.setComponentEnabledSetting(
                        new ComponentName(getContext(), className),
                        PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                        PackageManager.DONT_KILL_APP
                    );
                }
            }
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("alias", alias);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("No se pudo cambiar el ícono: " + error.getMessage(), error);
        }
    }
}
'''
(java_dir / "IconChangerPlugin.java").write_text(plugin, encoding="utf-8")

main_java = java_dir / "MainActivity.java"
if not main_java.exists():
    sys.exit("No se encontró MainActivity.java para registrar IconChangerPlugin.")
main_source = main_java.read_text(encoding="utf-8")
if "IconChangerPlugin.class" not in main_source:
    main_source = re.sub(
        r'public class MainActivity extends BridgeActivity\s*\{\s*\}',
        'public class MainActivity extends BridgeActivity {\n    @Override\n    public void onCreate(android.os.Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        registerPlugin(IconChangerPlugin.class);\n    }\n}',
        main_source,
    )
    if "IconChangerPlugin.class" not in main_source:
        main_source = main_source.replace("public class MainActivity extends BridgeActivity {", "public class MainActivity extends BridgeActivity {\n    @Override\n    public void onCreate(android.os.Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        registerPlugin(IconChangerPlugin.class);\n    }")
main_java.write_text(main_source, encoding="utf-8")
print("Plugin nativo IconChanger registrado")
print("Firma fija: verificación separada")
# Firma fija: siempre el keystore del repo (mismo SHA-1 que está cargado en Firebase).
gradle = ROOT / "app/build.gradle"
if gradle.exists():
    gradle_text = gradle.read_text(encoding="utf-8")
    mark = "// SIXSEVEN-FIXED-SIGNING"
    if mark not in gradle_text:
        gradle_text += '''

''' + mark + '''
android {
    signingConfigs {
        debug {
            storeFile rootProject.file("../android-signing/debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }
    }
}
'''
        gradle.write_text(gradle_text, encoding="utf-8")
        print("Firma fija configurada")
