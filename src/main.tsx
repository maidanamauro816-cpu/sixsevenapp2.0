import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { isNative } from './native';
import './index.css';
import { applyPrefs, loadPrefs } from './theme/engine';
import { applyUiPrefs, loadUiPrefs } from './fonts/FontManager';

// Restaura una sola vez el aspecto original negro (borra temas guardados y ajustes del Estudio de temas).
try {
  if (!localStorage.getItem('sixseven:original-look-v1')) {
    ['selected_theme_id', 'sixseven:themeCustom', 'sixseven:themeV4', 'sixseven:theme', 'sixseven:theme-prefs'].forEach((k) => localStorage.removeItem(k));
    localStorage.setItem('sixseven:original-look-v1', '1');
  }
} catch { /* sin almacenamiento */ }
applyPrefs(loadPrefs());
applyUiPrefs(loadUiPrefs());

if (isNative) document.documentElement.classList.add('native');

createRoot(document.getElementById('root')!).render(<App />);
