import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

const SIXSEVEN_FOLDERS = [
  'SStemas',
  'SixSeven Images',
  'SixSeven Video',
  'SixSeven Audio',
  'SixSeven Voice Notes',
  'SixSeven Stickers',
  'SixSeven Documents',
  'SixSeven Backup',
  'SixSeven Wallpapers',
  'SixSeven Profile Photos',
] as const;

/**
 * Creates the app's SixSeven folder structure on first launch.
 * Android scoped storage may place Documents inside the app's accessible Documents
 * area; writing to the public /storage/emulated/0 root requires platform permissions
 * and is not guaranteed on modern Android versions.
 */
export async function ensureSixSevenFolders(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await Filesystem.mkdir({ path: 'SixSeven', directory: Directory.Documents, recursive: true });
  await Promise.all(SIXSEVEN_FOLDERS.map((folder) =>
    Filesystem.mkdir({ path: `SixSeven/${folder}`, directory: Directory.Documents, recursive: true })
      .catch(() => undefined)
  ));
}
