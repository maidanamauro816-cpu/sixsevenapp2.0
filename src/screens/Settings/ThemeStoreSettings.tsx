import React from 'react';
import { TiendaTemasScreen } from '../TiendaTemasScreen';

export const ThemeStoreSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <TiendaTemasScreen onBack={onBack} />
);

export default ThemeStoreSettings;
