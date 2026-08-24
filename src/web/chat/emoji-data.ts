export interface EmojiItem {
  readonly char: string;
  readonly name: string;
  readonly tags: readonly string[];
}

export interface EmojiCategory {
  readonly id: string;
  readonly icon: string;
  readonly label: string;
  readonly emojis: readonly EmojiItem[];
}

function e(char: string, name: string, tags: readonly string[]): EmojiItem {
  return { char, name, tags };
}

const SMILEYS: readonly EmojiItem[] = [
  e('😀', 'sonrisa', ['smile', 'happy', 'feliz']),
  e('😃', 'sonrisa grande', ['joy', 'risa', 'alegre']),
  e('😄', 'feliz ojos cerrados', ['happy', 'contento']),
  e('😁', 'dientes', ['grin', 'sonriente']),
  e('😆', 'carcajada', ['laugh', 'lol', 'jaja']),
  e('😂', 'lagrimas de risa', ['joy', 'tears', 'lol']),
  e('🤣', 'muerto de risa', ['rofl', 'risa', 'lmao']),
  e('😊', 'ruborizado', ['blush', 'timido', 'tierno']),
  e('😇', 'angel', ['innocent', 'santo', 'bueno']),
  e('🙂', 'leve sonrisa', ['smile', 'ok', 'vale']),
  e('😉', 'guiño', ['wink', 'complice']),
  e('😍', 'enamorado', ['love', 'corazon', 'crush']),
  e('🥰', 'afecto', ['love', 'amor', 'tierno']),
  e('😘', 'beso', ['kiss', 'besito', 'amor']),
  e('😋', 'delicioso', ['yum', 'rico', 'comida']),
  e('😛', 'lengua', ['playful', 'broma']),
  e('😜', 'guiño lengua', ['crazy', 'broma']),
  e('🤪', 'loco', ['zany', 'locura']),
  e('😎', 'gafas de sol', ['cool', 'crack', 'fiera']),
  e('🤓', 'nerd', ['geek', 'estudio', 'gafas']),
  e('🥳', 'fiesta', ['party', 'celebracion', 'festejo']),
  e('🤔', 'pensativo', ['think', 'duda', 'pensar']),
  e('🤫', 'silencio', ['shh', 'secreto', 'calla']),
  e('🥱', 'bostezo', ['yawn', 'sueño', 'aburrido']),
  e('😴', 'durmiendo', ['sleep', 'zzz', 'sueño']),
  e('😡', 'enojado', ['rage', 'enfadado', 'furia']),
  e('😱', 'grito susto', ['scream', 'shock', 'miedo']),
  e('🤯', 'cabeza explota', ['mindblown', 'boom']),
  e('💀', 'calavera', ['skull', 'muerto', 'rip']),
  e('💩', 'caca', ['poop', 'mierda']),
  e('🤡', 'payaso', ['clown', 'meme'])
];

const GESTURES: readonly EmojiItem[] = [
  e('👍', 'pulgar arriba', ['thumbsup', 'ok', 'bien']),
  e('👎', 'pulgar abajo', ['thumbsdown', 'mal', 'no']),
  e('👏', 'aplauso', ['clap', 'bravo', 'aplausos']),
  e('🙌', 'manos arriba', ['celebrate', 'viva']),
  e('🤝', 'apreton', ['handshake', 'trato', 'acuerdo']),
  e('🙏', 'rezar gracias', ['pray', 'please', 'gracias']),
  e('💪', 'musculo fuerza', ['muscle', 'strong', 'fuerte']),
  e('👊', 'puño choque', ['fist', 'bump', 'pelea']),
  e('✌️', 'paz victoria', ['peace', 'victory', 'dos']),
  e('🤞', 'cruzar dedos', ['luck', 'suerte', 'ojala']),
  e('👌', 'perfecto', ['ok', 'perfecto', 'bien']),
  e('👋', 'saludo ola', ['wave', 'bye', 'hola', 'adios']),
  e('👀', 'ojos mirando', ['eyes', 'look', 'mira']),
  e('👑', 'corona', ['crown', 'king', 'rey', 'campeon'])
];

const SPORTS: readonly EmojiItem[] = [
  e('🏈', 'balon nfl futbol americano', ['football', 'nfl', 'balon']),
  e('🏉', 'rugby', ['rugby', 'balon']),
  e('⚽', 'futbol soccer', ['soccer', 'futbol', 'gol']),
  e('🏀', 'baloncesto', ['basketball', 'basket']),
  e('⚾', 'beisbol', ['baseball', 'bate']),
  e('🎾', 'tenis', ['tennis', 'raqueta']),
  e('🏆', 'trofeo campeon', ['trophy', 'winner', 'copa']),
  e('🥇', 'medalla oro', ['gold', 'first', 'primero']),
  e('🥈', 'medalla plata', ['silver', 'second']),
  e('🥉', 'medalla bronce', ['bronze', 'third']),
  e('🎯', 'diana', ['target', 'bullseye', 'acierto']),
  e('🥊', 'boxeo', ['boxing', 'golpe', 'guante']),
  e('🏎️', 'coche f1', ['racing', 'speed', 'carrera']),
  e('🏟️', 'estadio', ['stadium', 'campo', 'cancha'])
];

const NATURE: readonly EmojiItem[] = [
  e('🔥', 'fuego fuego', ['fire', 'flame', 'lit', 'caliente']),
  e('⚡', 'rayo relampago', ['zap', 'lightning', 'trueno']),
  e('⭐', 'estrella', ['star', 'favorito']),
  e('🌟', 'estrella brillante', ['sparkles', 'top']),
  e('✨', 'destellos brillo', ['magic', 'shine', 'nuevo']),
  e('🐻', 'oso osera', ['bear', 'osera', 'animal']),
  e('🦅', 'aguila', ['eagle', 'ave', 'pajaro']),
  e('🐬', 'delfin', ['dolphin', 'dolphins']),
  e('🐺', 'lobo', ['wolf', 'lobo']),
  e('🦁', 'leon', ['lion', 'rey']),
  e('🐴', 'caballo colts', ['horse', 'colts'])
];

const FOOD: readonly EmojiItem[] = [
  e('🍕', 'pizza', ['pizza', 'comida', 'queso']),
  e('🍔', 'hamburguesa', ['burger', 'hamburguesa']),
  e('🍟', 'patatas fritas', ['fries', 'papas']),
  e('🌮', 'taco', ['taco', 'mexicano']),
  e('🍺', 'cerveza', ['beer', 'birra', 'cana']),
  e('🍻', 'brindis cervezas', ['cheers', 'brindis']),
  e('🍷', 'vino copa', ['wine', 'tinto']),
  e('🍿', 'palomitas', ['popcorn', 'cine']),
  e('🍎', 'manzana', ['apple', 'fruta'])
];

const OBJECTS: readonly EmojiItem[] = [
  e('🎉', 'confeti fiesta', ['party', 'tada', 'celebrar']),
  e('🎊', 'bola confeti', ['confetti', 'fiesta']),
  e('🎈', 'globo', ['balloon', 'cumple']),
  e('🎁', 'regalo sorpresa', ['gift', 'present']),
  e('💰', 'bolsa de dinero', ['money', 'dolares', 'rico']),
  e('💵', 'billete dolar', ['cash', 'pasta']),
  e('💣', 'bomba', ['bomb', 'boom']),
  e('🚀', 'cohete despegue', ['rocket', 'to the moon']),
  e('📈', 'grafica subiendo', ['chart', 'up', 'ganar']),
  e('📉', 'grafica bajando', ['down', 'perder'])
];

const SYMBOLS: readonly EmojiItem[] = [
  e('❤️', 'corazon rojo', ['heart', 'love', 'amor']),
  e('💙', 'corazon azul', ['blueheart', 'azul']),
  e('💚', 'corazon verde', ['greenheart', 'verde']),
  e('💛', 'corazon amarillo', ['yellowheart']),
  e('💯', 'cien puntos', ['100', 'perfecto', 'top']),
  e('✅', 'check verde', ['check', 'valido', 'ok']),
  e('❌', 'cruz roja no', ['cross', 'error', 'cancel']),
  e('⚠️', 'alerta peligro', ['warning', 'ojo', 'cuidado']),
  e('🇪🇸', 'bandera espana', ['spain', 'espana', 'flag']),
  e('🇺🇸', 'bandera usa', ['usa', 'estadosunidos'])
];

export const EMOJI_CATEGORIES: readonly EmojiCategory[] = [
  { id: 'smileys', icon: '😀', label: 'Caras', emojis: SMILEYS },
  { id: 'gestures', icon: '👍', label: 'Gestos', emojis: GESTURES },
  { id: 'sports', icon: '🏈', label: 'Deportes', emojis: SPORTS },
  { id: 'nature', icon: '🔥', label: 'Naturaleza', emojis: NATURE },
  { id: 'food', icon: '🍕', label: 'Comida', emojis: FOOD },
  { id: 'objects', icon: '🎉', label: 'Objetos', emojis: OBJECTS },
  { id: 'symbols', icon: '❤️', label: 'Símbolos', emojis: SYMBOLS }
];
