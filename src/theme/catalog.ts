import { partsToArgb } from './xml';

export type OptType = 'color' | 'bool' | 'string' | 'int' | 'select';
/** applied = funciona hoy · stored = se guarda y exporta, aún sin efecto · na = Six Seven no tiene esa función */
export type OptStatus = 'applied' | 'stored' | 'na';

export interface OptionDef {
  key: string;               // clave que se escribe en el .xml
  aliases?: string[];        // claves de temas Delta/Yo que se leen como equivalentes (suposición por nombre)
  type: OptType;
  def: boolean | number | string;
  label: string;
  group: string;
  screen: string;            // en qué pantalla se aplica
  status: OptStatus;
  alpha?: boolean;           // el color admite transparencia
  options?: { v: string; label: string }[];
  min?: number; max?: number;
  note?: string;
}
export interface SectionDef { id: string; title: string; subtitle: string; options: OptionDef[] }

const C = (hex: string, a = 255) => partsToArgb(hex, a);

const opt = (o: OptionDef): OptionDef => o;

export const SECTIONS: SectionDef[] = [
  {
    id: 'home', title: 'Pantalla de inicio', subtitle: 'Cabecera, filas, botón flotante, estados y animación',
    options: [
      opt({ key: 'ss_home_header_color', type: 'color', def: C('#000000'), label: 'Color de cabecera', group: 'Cabecera', screen: 'Chats', status: 'applied' }),
      opt({ key: 'ss_home_header_text_color', type: 'color', def: C('#ffffff'), label: 'Color de texto de cabecera', group: 'Cabecera', screen: 'Chats', status: 'applied' }),
      opt({ key: 'ss_row_style', type: 'select', def: 'simple', label: 'Estilo de filas', group: 'Filas', screen: 'Chats', status: 'applied',
        options: [{ v: 'simple', label: 'Simple' }, { v: 'card', label: 'Tarjeta' }, { v: 'grow', label: 'Crece al tocar' }] }),
      opt({ key: 'ss_row_bg_color', type: 'color', def: C('#000000', 0), alpha: true, label: 'Fondo de fila', group: 'Filas', screen: 'Chats', status: 'applied' }),
      opt({ key: 'ss_row_divider_hide', type: 'bool', def: false, label: 'Ocultar divisores', group: 'Filas', screen: 'Chats', status: 'applied' }),
      opt({ key: 'ss_row_text_size', type: 'int', def: 14, min: 11, max: 20, label: 'Tamaño de texto de filas', group: 'Filas', screen: 'Chats', status: 'applied' }),
      opt({ key: 'ss_list_animation', type: 'select', def: 'none', label: 'Animación de la lista de chats', group: 'Animación', screen: 'Chats', status: 'applied',
        options: [{ v: 'none', label: 'Ninguna' }, { v: 'slide', label: 'Deslizar' }, { v: 'horizontal_flip', label: 'Giro horizontal' }] }),
      opt({ key: 'ss_fab_color', aliases: ['ModFabNormalColor'], type: 'color', def: C('#ff1a1a'), label: 'Color del botón flotante', group: 'Botón flotante (FAB)', screen: 'Chats', status: 'applied', note: 'Alias de Delta/Yo: ModFabNormalColor (por nombre)' }),
      opt({ key: 'ss_fab_icon_color', aliases: ['ModFabTextColor'], type: 'color', def: C('#ffffff'), label: 'Color del ícono del botón', group: 'Botón flotante (FAB)', screen: 'Chats', status: 'applied', note: 'Alias de Delta/Yo: ModFabTextColor (por nombre)' }),
      opt({ key: 'ss_fab_hide', type: 'bool', def: false, label: 'Ocultar botón flotante', group: 'Botón flotante (FAB)', screen: 'Chats', status: 'applied' }),
      opt({ key: 'ss_status_ring_color', type: 'color', def: C('#dc2626'), label: 'Color del aro de estados', group: 'Estilo de estados', screen: 'Chats', status: 'applied' }),
      opt({ key: 'ss_tab_bg_color', type: 'color', def: C('#000000'), label: 'Fondo de la barra inferior', group: 'Barra inferior', screen: 'Todas', status: 'applied' }),
      opt({ key: 'ss_tab_active_color', type: 'color', def: C('#ff2a2a'), label: 'Color de pestaña activa', group: 'Barra inferior', screen: 'Todas', status: 'applied' }),
      opt({ key: 'ss_home_ui', type: 'select', def: 'classic', label: 'Estilo de pantalla de inicio', group: 'Menú lateral / Home UI', screen: 'Chats', status: 'stored',
        options: [{ v: 'classic', label: 'Clásico' }, { v: 'messenger', label: 'Messenger' }, { v: 'wave', label: 'Wave' }], note: 'Nombres vistos en el historial de Delta; Six Seven aún no tiene menú lateral.' }),
    ],
  },
  {
    id: 'conversation', title: 'Conversación', subtitle: 'Burbujas, ticks, fondo, barra de escritura',
    options: [
      opt({ key: 'ss_bubble_style', type: 'select', def: 'classic', label: 'Estilo de burbuja', group: 'Burbujas', screen: 'Chat', status: 'applied',
        options: [{ v: 'classic', label: 'Clásica' }, { v: 'round', label: 'Redonda' }, { v: 'square', label: 'Cuadrada' }, { v: 'soft', label: 'Suave' }, { v: 'neon', label: 'Neón' }] }),
      opt({ key: 'ss_bubble_right_color', aliases: ['ModChatColor'], type: 'color', def: C('#b3101a'), label: 'Burbuja enviada (derecha)', group: 'Burbujas', screen: 'Chat', status: 'applied', note: 'Alias supuesto: ModChatColor' }),
      opt({ key: 'ss_bubble_left_color', type: 'color', def: C('#171717'), label: 'Burbuja recibida (izquierda)', group: 'Burbujas', screen: 'Chat', status: 'applied' }),
      opt({ key: 'ss_bubble_right_text_color', type: 'color', def: C('#ffffff'), label: 'Texto burbuja derecha', group: 'Burbujas', screen: 'Chat', status: 'applied' }),
      opt({ key: 'ss_bubble_left_text_color', aliases: ['ModChatBubbleTextLeft'], type: 'color', def: C('#f5f5f5'), label: 'Texto burbuja izquierda', group: 'Burbujas', screen: 'Chat', status: 'applied', note: 'Alias supuesto: ModChatBubbleTextLeft' }),
      opt({ key: 'ss_bubble_gradient', aliases: ['ModChatColor_Gactive'], type: 'bool', def: false, label: 'Burbuja con degradado', group: 'Burbujas', screen: 'Chat', status: 'applied', note: 'Delta: Gradient Bubble' }),
      opt({ key: 'ss_bubble_gradient_color', aliases: ['ModChatColor_GC'], type: 'color', def: C('#5a0a10'), label: 'Segundo color del degradado', group: 'Burbujas', screen: 'Chat', status: 'applied' }),
      opt({ key: 'ss_chat_font_size', type: 'int', def: 16, min: 12, max: 24, label: 'Tamaño del texto del chat', group: 'Burbujas', screen: 'Chat', status: 'applied' }),
      opt({ key: 'ss_tick_color', aliases: ['RcSeenColor'], type: 'color', def: C('#ffffff', 204), alpha: true, label: 'Color de ticks', group: 'Ticks', screen: 'Chat', status: 'applied', note: 'Alias supuesto: RcSeenColor' }),
      opt({ key: 'ss_tick_hide', type: 'bool', def: false, label: 'Ocultar ticks', group: 'Ticks', screen: 'Chat', status: 'applied' }),
      opt({ key: 'ss_chat_bg_color', aliases: ['ConvoBack'], type: 'color', def: C('#000000'), label: 'Color de fondo del chat', group: 'Fondo del chat', screen: 'Chat', status: 'applied', note: 'Alias supuesto: ConvoBack' }),
      opt({ key: 'ss_chat_pattern', type: 'select', def: 'none', label: 'Patrón de fondo', group: 'Fondo del chat', screen: 'Chat', status: 'applied',
        options: [{ v: 'none', label: 'Sin patrón' }, { v: 'dots', label: 'Puntos' }, { v: 'grid', label: 'Cuadrícula' }, { v: 'waves', label: 'Ondas' }, { v: 'diamonds', label: 'Rombos' }, { v: 'crowns', label: 'Coronas' }],
        note: 'Editor de fondos propio de Six Seven (no se confirmó un editor con patrones de Telegram en Delta).' }),
      opt({ key: 'ss_chat_pattern_color', type: 'color', def: C('#ff1a1a'), label: 'Color del patrón', group: 'Fondo del chat', screen: 'Chat', status: 'applied' }),
      opt({ key: 'ss_chat_pattern_opacity', type: 'int', def: 12, min: 3, max: 40, label: 'Intensidad del patrón (%)', group: 'Fondo del chat', screen: 'Chat', status: 'applied' }),
      opt({ key: 'ss_input_bg_color', type: 'color', def: C('#171717'), label: 'Fondo de la barra de escritura', group: 'Barra de escritura', screen: 'Chat', status: 'applied' }),
      opt({ key: 'ss_input_text_color', type: 'color', def: C('#ffffff'), label: 'Texto de la barra de escritura', group: 'Barra de escritura', screen: 'Chat', status: 'applied' }),
      opt({ key: 'ss_send_button_color', aliases: ['ModChaSendBKColor'], type: 'color', def: C('#ff1a1a'), label: 'Color del botón enviar', group: 'Barra de escritura', screen: 'Chat', status: 'applied', note: 'Alias supuesto: ModChaSendBKColor' }),
      opt({ key: 'ss_wave_color', type: 'color', def: C('#ff1a1a'), label: 'Color de la onda de audio', group: 'Notas de voz', screen: 'Chat', status: 'stored', note: 'Las notas de voz aún usan el reproductor estándar.' }),
      opt({ key: 'ss_hide_call_buttons', type: 'bool', def: false, label: 'Ocultar botones de llamada', group: 'Cabecera del chat', screen: 'Chat', status: 'applied' }),
    ],
  },
  {
    id: 'calls', title: 'Llamadas', subtitle: 'Fondo y botones de la pantalla de llamadas',
    options: [
      opt({ key: 'ss_call_bg_color', type: 'color', def: C('#000000'), label: 'Fondo de llamada', group: 'Fondo', screen: 'Llamadas', status: 'stored', note: 'Las llamadas llegan en una próxima versión.' }),
      opt({ key: 'ss_call_button_color', type: 'color', def: C('#ff1a1a'), label: 'Color de botones', group: 'Botones', screen: 'Llamadas', status: 'stored' }),
    ],
  },
  {
    id: 'widgets', title: 'Widgets', subtitle: 'Widget de chat y de contacto',
    options: [
      opt({ key: 'ss_chat_widget', type: 'bool', def: false, label: 'Widget de chat', group: 'Widgets', screen: 'Pantalla del teléfono', status: 'na', note: 'Requiere una app Android nativa.' }),
      opt({ key: 'ss_contact_widget', type: 'bool', def: false, label: 'Widget de contacto', group: 'Widgets', screen: 'Pantalla del teléfono', status: 'na', note: 'Requiere una app Android nativa.' }),
    ],
  },
  {
    id: 'universal', title: 'Universal', subtitle: 'Colores, estilos y tema claro / oscuro / transparente',
    options: [
      opt({ key: 'ss_theme_mode', type: 'select', def: 'dark', label: 'Modo del tema', group: 'Tema', screen: 'Toda la app', status: 'applied',
        options: [{ v: 'dark', label: 'Oscuro' }, { v: 'light', label: 'Claro (beta)' }, { v: 'transparent', label: 'Transparente (beta)' }] }),
      opt({ key: 'ss_primary_color', type: 'color', def: C('#ff1a1a'), label: 'Color primario', group: 'Colores', screen: 'Toda la app', status: 'applied' }),
      opt({ key: 'ss_accent_color', type: 'color', def: C('#ff2a2a'), label: 'Color de acento', group: 'Colores', screen: 'Toda la app', status: 'applied' }),
      opt({ key: 'ss_background_color', type: 'color', def: C('#000000'), label: 'Color de fondo', group: 'Colores', screen: 'Toda la app', status: 'applied' }),
      opt({ key: 'ss_text_color', type: 'color', def: C('#ffffff'), label: 'Color de texto', group: 'Colores', screen: 'Toda la app', status: 'applied' }),
      opt({ key: 'ss_card_color', type: 'color', def: C('#0a0a0a'), label: 'Color de tarjetas', group: 'Colores', screen: 'Toda la app', status: 'applied' }),
      opt({ key: 'ss_font_style', type: 'select', def: 'system', label: 'Tipo de letra', group: 'Estilos', screen: 'Toda la app', status: 'applied',
        options: [{ v: 'system', label: 'Inter (predeterminada)' }, { v: 'rounded', label: 'Redondeada' }, { v: 'serif', label: 'Elegante' }, { v: 'mono', label: 'Tecnológica' }, { v: 'narrow', label: 'Angosta' }] }),
      opt({ key: 'ss_font_size', type: 'int', def: 16, min: 13, max: 20, label: 'Tamaño de letra general', group: 'Estilos', screen: 'Toda la app', status: 'applied' }),
      opt({ key: 'ss_icon_pack', type: 'select', def: 'normal', label: 'Paquete de íconos (grosor)', group: 'Estilos', screen: 'Toda la app', status: 'applied',
        options: [{ v: 'thin', label: 'Fino' }, { v: 'normal', label: 'Normal' }, { v: 'bold', label: 'Grueso' }] }),
      opt({ key: 'ss_emoji_variant', type: 'select', def: 'native', label: 'Variante de emojis', group: 'Estilos', screen: 'Chat', status: 'na',
        options: [{ v: 'native', label: 'Del teléfono' }], note: 'Se usan los emojis del sistema.' }),
      opt({ key: 'ss_launcher_icon', type: 'select', def: 'default', label: 'Ícono de la app', group: 'Estilos', screen: 'Pantalla del teléfono', status: 'na',
        options: [{ v: 'default', label: 'S con corona' }], note: 'Cambiar el ícono del lanzador requiere compilar de nuevo.' }),
    ],
  },
  {
    id: 'media', title: 'Multimedia y envío', subtitle: 'Calidad de imagen, límites de video y audio',
    options: [
      opt({ key: 'ss_image_quality', type: 'select', def: 'normal', label: 'Calidad de imagen', group: 'Imágenes', screen: 'Chat', status: 'stored',
        options: [{ v: 'low', label: 'Baja' }, { v: 'normal', label: 'Normal' }, { v: 'high', label: 'Alta' }] }),
      opt({ key: 'ss_video_limit_mb', type: 'int', def: 50, min: 5, max: 50, label: 'Límite de video (MB)', group: 'Video', screen: 'Chat', status: 'stored', note: 'El servidor admite hasta 50 MB.' }),
      opt({ key: 'ss_audio_limit_min', type: 'int', def: 10, min: 1, max: 30, label: 'Límite de audio (min)', group: 'Audio', screen: 'Chat', status: 'stored' }),
    ],
  },
  {
    id: 'privacy', title: 'Privacidad y seguridad', subtitle: 'Opciones que Delta ofrece (Six Seven aún no las tiene)',
    options: [
      opt({ key: 'ss_freeze_last_seen', type: 'bool', def: false, label: 'Congelar última vez', group: 'Privacidad', screen: 'Chat', status: 'na', note: 'Six Seven aún no muestra "última vez".' }),
      opt({ key: 'ss_hide_blue_ticks', type: 'bool', def: false, label: 'Ocultar tildes azules', group: 'Privacidad', screen: 'Chat', status: 'na', note: 'Six Seven aún no tiene confirmación de lectura visible. Usá "Ocultar ticks".' }),
      opt({ key: 'ss_anti_view_once', type: 'bool', def: false, label: 'Anti "ver una vez"', group: 'Privacidad', screen: 'Chat', status: 'na', note: 'Six Seven aún no tiene mensajes de ver una vez.' }),
    ],
  },
];

export const ALL_OPTIONS: OptionDef[] = SECTIONS.flatMap((s) => s.options);
export const OPTION_BY_KEY = new Map<string, OptionDef>(ALL_OPTIONS.map((o) => [o.key, o]));
/** Todas las claves conocidas (propias + alias de Delta/Yo). */
export const KNOWN_KEYS = new Set<string>(ALL_OPTIONS.flatMap((o) => [o.key, ...(o.aliases || [])]));
