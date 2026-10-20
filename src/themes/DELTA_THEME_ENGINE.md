# SixSeven Delta-style theme engine

This repository is a Vite + React + Capacitor web app (not a React Native project). The engine therefore returns CSS styles/background-image styles; it does not import React Native's `ImageBackground`, which would break the existing build. If the app is later migrated to React Native, render the same theme wallpaper URI with `<ImageBackground source={{ uri: theme.wallpaperUri }} resizeMode="cover">`.

## XML parsing
`parseDeltaXml(xmlString)` reads Android SharedPreferences-style `<map>` exports and maps known keys including ModChatRightBubble, ModChatLeftBubble, bubble_style, tick_style, convostyle, custom_wall, ConvoBack, wallpaper_file, ModConColor, RcBkTabs, HomeBarBar, ModFabColor and ConvoEntry. Unknown keys remain in `theme.raw`, allowing larger exports to be preserved. Actual exports differ by MOD/version; this is a compatible key mapper, not a guarantee that every proprietary Delta package is fully interchangeable.

## Integration
- Parse the selected XML text with `parseDeltaXml`.
- For browser/Capacitor import, use a file input or an existing picker, read the file as text, and pass the result to the parser.
- Persist the imported theme JSON and any selected wallpaper in the app's existing theme storage.
- Pass the theme and locally resolved wallpaper URI to `applyDeltaTheme`, then apply the returned styles to the actual chat/header/composer components.
- Use the existing app icon assets unchanged. This feature adds no edits to app icons, original images, app.json, package.json, native mipmap/drawable, or iOS asset catalogs.

## Wallpaper security and portability
XML paths from another app are not readable file URIs on Android due to sandboxing. An imported XML cannot magically import an image stored in a separate Delta folder. The importer must also let the user select the wallpaper image (or include it in a supported theme archive), copy it into app-owned storage, and set `wallpaperUri` to that local file. Remote sample wallpaper URLs require network access; bundle licensed images for offline use.
