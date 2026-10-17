import React from 'react';
import EmojiPicker, { Categories, EmojiStyle, SuggestionMode, Theme } from 'emoji-picker-react';

/** Emojis con categorías, buscador y "Recientes" (guardados en el teléfono por la librería). */
const EmojiPanel: React.FC<{ onEmoji: (emoji: string) => void }> = ({ onEmoji }) => (
  <div className="sx-emoji h-full">
    <EmojiPicker
      onEmojiClick={(d) => onEmoji(d.emoji)}
      theme={Theme.DARK}
      width="100%"
      height="100%"
      emojiStyle={EmojiStyle.NATIVE}
      suggestedEmojisMode={SuggestionMode.RECENT}
      searchPlaceHolder="Buscar emoji"
      previewConfig={{ showPreview: false }}
      skinTonesDisabled
      lazyLoadEmojis
      categories={[
        { category: Categories.SUGGESTED, name: 'Recientes' },
        { category: Categories.SMILEYS_PEOPLE, name: 'Caritas y gestos' },
        { category: Categories.ANIMALS_NATURE, name: 'Animales' },
        { category: Categories.FOOD_DRINK, name: 'Comida' },
        { category: Categories.TRAVEL_PLACES, name: 'Viajes' },
        { category: Categories.ACTIVITIES, name: 'Actividades' },
        { category: Categories.OBJECTS, name: 'Objetos' },
        { category: Categories.SYMBOLS, name: 'Símbolos' },
      ]}
    />
  </div>
);

export default EmojiPanel;
