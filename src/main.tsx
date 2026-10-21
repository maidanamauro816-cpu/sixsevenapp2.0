import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { isNative } from './native';
import './index.css';
import { applyPrefs, loadPrefs } from './theme/engine';

applyPrefs(loadPrefs());

if (isNative) document.documentElement.classList.add('native');

createRoot(document.getElementById('root')!).render(<App />);
