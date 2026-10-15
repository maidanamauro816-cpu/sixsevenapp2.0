#!/usr/bin/env python3
"""Ajustes al proyecto Android que genera `cap add android`.
Se ejecuta en GitHub Actions; es idempotente (se puede correr varias veces)."""
import pathlib, re, sys

manifest = pathlib.Path("android/app/src/main/AndroidManifest.xml")
if not manifest.exists():
    sys.exit("No existe android/ — corré primero `npx cap add android`.")
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

# Solo vertical, como en el diseño
if "android:screenOrientation" not in xml:
    xml = re.sub(r"(<activity\b)", r'\1 android:screenOrientation="portrait"', xml, count=1)

manifest.write_text(xml, encoding="utf-8")
print("AndroidManifest.xml listo")

# Firma fija: siempre el keystore del repo (mismo SHA-1 que está cargado en Firebase)
gradle = pathlib.Path("android/app/build.gradle")
text = gradle.read_text(encoding="utf-8")
MARK = "// SIXSEVEN-FIXED-SIGNING"
if MARK not in text:
    text += """

""" + MARK + """
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
"""
    gradle.write_text(text, encoding="utf-8")
print("Firma fija configurada")
