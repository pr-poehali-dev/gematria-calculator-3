import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ── Cipher definitions ─────────────────────────────────────────────────────────

const EN_ORDINAL: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:10,k:11,l:12,m:13,
  n:14,o:15,p:16,q:17,r:18,s:19,t:20,u:21,v:22,w:23,x:24,y:25,z:26,
};
const EN_REDUCTION: Record<string, number> = Object.fromEntries(
  Object.entries(EN_ORDINAL).map(([k, v]) => [k, ((v - 1) % 9) + 1])
);
const EN_REVERSE_ORDINAL: Record<string, number> = Object.fromEntries(
  Object.entries(EN_ORDINAL).map(([k, v]) => [k, 27 - v])
);
const EN_REVERSE_REDUCTION: Record<string, number> = Object.fromEntries(
  Object.entries(EN_REVERSE_ORDINAL).map(([k, v]) => [k, ((v - 1) % 9) + 1])
);
const EN_SUMERIAN: Record<string, number> = Object.fromEntries(
  Object.entries(EN_ORDINAL).map(([k, v]) => [k, v * 6])
);
const EN_REVERSE_SUMERIAN: Record<string, number> = Object.fromEntries(
  Object.entries(EN_REVERSE_ORDINAL).map(([k, v]) => [k, v * 6])
);
const EN_EXTENDED: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:10,k:11,l:12,m:13,
  n:14,o:15,p:16,q:17,r:18,s:19,t:20,u:21,v:22,w:23,x:24,y:25,z:26,
};
const EN_REVERSE_EXTENDED: Record<string, number> = Object.fromEntries(
  Object.entries(EN_ORDINAL).map(([k, v]) => [k, 27 - v])
);
const EN_AGRIPPA_KEY: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:9,
  k:10,l:20,m:30,n:40,o:50,p:60,q:70,r:80,s:90,
  t:100,u:200,v:200,w:400,x:300,y:400,z:500,
};
const AGRIPPA_RANKS = [1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500];
const EN_AGRIPPA_ORDINAL: Record<string, number> = Object.fromEntries(
  Object.entries(EN_AGRIPPA_KEY).map(([k, v]) => [k, AGRIPPA_RANKS.indexOf(v) + 1])
);
const EN_AGRIPPA_REDUCTION: Record<string, number> = Object.fromEntries(
  Object.entries(EN_AGRIPPA_KEY).map(([k, v]) => {
    let x = v;
    while (x > 9) x = String(x).split("").reduce((a, d) => a + Number(d), 0);
    return [k, x];
  })
);
const EN_QABALLA: Record<string, number> = {
  a:21,b:26,c:22,d:5, e:7, f:10,g:9, h:6, i:3, j:15,k:17,l:1, m:19,
  n:13,o:25,p:23,q:11,r:2, s:20,t:24,u:8, v:16,w:18,x:4, y:12,z:14,
};
const EN_ILLUMINATI_NOVICE: Record<string, number> = Object.fromEntries(
  Object.entries(EN_ORDINAL).map(([k, v]) => [k, (v * (v + 1)) / 2])
);
const EN_ILLUMINATI_REVERSE: Record<string, number> = Object.fromEntries(
  Object.entries(EN_REVERSE_ORDINAL).map(([k, v]) => [k, (v * (v + 1)) / 2])
);

const RU_ORDINAL: Record<string, number> = {
  а:1,б:2,в:3,г:4,д:5,е:6,ё:7,ж:8,з:9,и:10,й:11,к:12,л:13,м:14,
  н:15,о:16,п:17,р:18,с:19,т:20,у:21,ф:22,х:23,ц:24,ч:25,ш:26,щ:27,
  ъ:28,ы:29,ь:30,э:31,ю:32,я:33,
};
const RU_REDUCTION: Record<string, number> = Object.fromEntries(
  Object.entries(RU_ORDINAL).map(([k, v]) => [k, ((v - 1) % 9) + 1])
);
const RU_REVERSE_ORDINAL: Record<string, number> = Object.fromEntries(
  Object.entries(RU_ORDINAL).map(([k, v]) => [k, 34 - v])
);
const RU_REVERSE_REDUCTION: Record<string, number> = Object.fromEntries(
  Object.entries(RU_REVERSE_ORDINAL).map(([k, v]) => [k, ((v - 1) % 9) + 1])
);
const RU_SUMERIAN: Record<string, number> = Object.fromEntries(
  Object.entries(RU_ORDINAL).map(([k, v]) => [k, v * 6])
);
const RU_REVERSE_SUMERIAN: Record<string, number> = Object.fromEntries(
  Object.entries(RU_REVERSE_ORDINAL).map(([k, v]) => [k, v * 6])
);

// ── Church Slavonic cipher tables ─────────────────────────────────────────────
// Церковнославянская гематрия: буквенная цифирь (титло), греческий образец
// а=1…т=300, у=400…ѿ=900 (с архаическими буквами)
const CS_GEMATRIA: Record<string, number> = {
  'а':1,'в':2,'г':3,'д':4,'є':5,'ѕ':6,'з':7,'и':8,'ѳ':9,
  'і':10,'к':20,'л':30,'м':40,'н':50,'ѯ':60,'о':70,'п':80,'ч':90,
  'р':100,'с':200,'т':300,'у':400,'ф':500,'х':600,'ѱ':700,'ѡ':800,'ѿ':900,
  // common alternate forms
  'е':5,'ї':10,'ω':800,
};
// Порядковый (по месту в церковнославянской азбуке)
const CS_ORDINAL: Record<string, number> = {
  'а':1,'б':2,'в':3,'г':4,'д':5,'е':6,'є':6,'ж':7,'ѕ':8,'з':9,'и':10,
  'і':11,'ї':11,'й':12,'к':13,'л':14,'м':15,'н':16,'о':17,'п':18,'р':19,
  'с':20,'т':21,'у':22,'ф':23,'х':24,'ѡ':25,'ц':26,'ч':27,'ш':28,'щ':29,
  'ъ':30,'ы':31,'ь':32,'ѣ':33,'э':34,'ю':35,'я':36,'ѳ':37,'ѵ':38,'ѯ':39,'ѱ':40,'ѿ':41,
};

// ── Hebrew cipher tables ───────────────────────────────────────────────────────
// Standard Hebrew alphabet: 22 letters (Alef–Tav)
const HE_ORDINAL: Record<string, number> = {
  'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
  'י':10,'כ':11,'ל':12,'מ':13,'נ':14,'ס':15,'ע':16,'פ':17,'צ':18,
  'ק':19,'ר':20,'ש':21,'ת':22,
  // final forms = same ordinal position as regular
  'ך':11,'ם':13,'ן':14,'ף':17,'ץ':18,
};
const HE_REDUCTION: Record<string, number> = Object.fromEntries(
  Object.entries(HE_ORDINAL).map(([k, v]) => [k, ((v - 1) % 9) + 1])
);
// Standard gematria (Mispar Hechrachi): traditional Hebrew numerical values
const HE_GEMATRIA: Record<string, number> = {
  'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
  'י':10,'כ':20,'ל':30,'מ':40,'נ':50,'ס':60,'ע':70,'פ':80,'צ':90,
  'ק':100,'ר':200,'ש':300,'ת':400,
  // final forms = same value as regular
  'ך':20,'ם':40,'ן':50,'ף':80,'ץ':90,
};
// Soffits (final forms): includes 5 final letters with extended values
const HE_SOFFITS: Record<string, number> = {
  'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
  'י':10,'כ':20,'ל':30,'מ':40,'נ':50,'ס':60,'ע':70,'פ':80,'צ':90,
  'ק':100,'ר':200,'ש':300,'ת':400,
  'ך':500,'ם':600,'ן':700,'ף':800,'ץ':900,
};

// ── Greek cipher tables ────────────────────────────────────────────────────────
// Classical 24-letter Greek alphabet (α–ω) + final sigma ς = same as σ
const GR_ORDINAL: Record<string, number> = {
  'α':1,'β':2,'γ':3,'δ':4,'ε':5,'ζ':6,'η':7,'θ':8,'ι':9,
  'κ':10,'λ':11,'μ':12,'ν':13,'ξ':14,'ο':15,'π':16,'ρ':17,'σ':18,'ς':18,
  'τ':19,'υ':20,'φ':21,'χ':22,'ψ':23,'ω':24,
};
const GR_REDUCTION: Record<string, number> = Object.fromEntries(
  Object.entries(GR_ORDINAL).map(([k, v]) => [k, ((v - 1) % 9) + 1])
);
// Greek Ordinal 24 — same as GR_ORDINAL (alias for clarity in UI)
const GR_ORDINAL_24: Record<string, number> = { ...GR_ORDINAL };
// Isopsephy: classical Greek milesian numerals (α=1…ω=800, with archaic ϛ=6, ϙ=90, ϡ=900)
const GR_ISOPSEPHY: Record<string, number> = {
  'α':1,'β':2,'γ':3,'δ':4,'ε':5,'ϛ':6,'ζ':7,'η':8,'θ':9,
  'ι':10,'κ':20,'λ':30,'μ':40,'ν':50,'ξ':60,'ο':70,'π':80,'ϙ':90,'ρ':100,
  'σ':200,'ς':200,'τ':300,'υ':400,'φ':500,'χ':600,'ψ':700,'ω':800,'ϡ':900,
};

// ── Arabic cipher tables ───────────────────────────────────────────────────────
// Abjad (حساب الجُمَّل): classical Arabic letter values
const AR_ABJAD: Record<string, number> = {
  'ا':1,'أ':1,'إ':1,'آ':1,'ء':1,'ب':2,'ج':3,'د':4,'ه':5,'ة':5,'و':6,'ز':7,'ح':8,'ط':9,
  'ي':10,'ى':10,'ك':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,
  'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000,
};
// Arabic Ordinal: positional order of the alphabet (أ=1 … غ=28)
const AR_ORDINAL: Record<string, number> = {
  'ا':1,'أ':1,'إ':1,'آ':1,'ء':1,'ب':2,'ت':3,'ة':3,'ث':4,'ج':5,'ح':6,'خ':7,'د':8,'ذ':9,'ر':10,
  'ز':11,'س':12,'ش':13,'ص':14,'ض':15,'ط':16,'ظ':17,'ع':18,'غ':19,
  'ف':20,'ق':21,'ك':22,'ل':23,'م':24,'ن':25,'ه':26,'و':27,'ي':28,'ى':28,
};

// ── Language detection ─────────────────────────────────────────────────────────

function detectLang(text: string): "english" | "russian" | "church_slavonic" | "hebrew" | "greek" | "arabic" | null {
  const ru = (text.match(/[а-яёА-ЯЁ]/g) || []).length;
  const en = (text.match(/[a-zA-Z]/g) || []).length;
  const he = (text.match(/[\u05D0-\u05EA\u05F0-\u05F4]/g) || []).length;
  const gr = (text.match(/[\u0370-\u03FF\u1F00-\u1FFF]/g) || []).length;
  const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
  // Church Slavonic: archaic Cyrillic letters unique to OCS (lower + upper)
  const cs = (text.match(/[ѕѯѱѡѿѳѵѣїі\u0405\u046E\u0470\u0460\u047E\u0472\u0474\u0462\u0407\u0406]/g) || []).length;
  const max = Math.max(ru, en, he, gr, ar);
  if (max === 0 && cs === 0) return null;
  if (cs > 0) return "church_slavonic";
  if (max === he) return "hebrew";
  if (max === gr) return "greek";
  if (max === ar) return "arabic";
  return ru >= en ? "russian" : "english";
}

// ── Types ──────────────────────────────────────────────────────────────────────

type CipherId =
  | "en_ordinal" | "en_reduction"
  | "en_reverse_ordinal" | "en_reverse_reduction"
  | "en_sumerian" | "en_reverse_sumerian"
  | "en_extended" | "en_reverse_extended"
  | "en_agrippa_key" | "en_agrippa_ordinal" | "en_agrippa_reduction"
  | "en_qaballa" | "en_illuminati_novice" | "en_illuminati_reverse"
  | "ru_ordinal" | "ru_reduction" | "ru_reverse_ordinal" | "ru_reverse_reduction"
  | "ru_sumerian" | "ru_reverse_sumerian"
  | "cs_gematria"
  | "he_ordinal" | "he_reduction" | "he_gematria" | "he_soffits"
  | "gr_isopsephy" | "gr_ordinal" | "gr_reduction"
  | "ar_abjad" | "ar_ordinal";

interface Cipher {
  id: CipherId;
  label: string;
  sublabel: string;
  table: Record<string, number>;
  group: "english" | "english_extended" | "russian" | "church_slavonic" | "hebrew" | "greek" | "arabic";
}

const CIPHERS: Cipher[] = [
  { id: "en_ordinal",            label: "English Ordinal",     sublabel: "A=1 … Z=26",           table: EN_ORDINAL,            group: "english" },
  { id: "en_reverse_ordinal",    label: "English R Ordinal",   sublabel: "Z=1 … A=26",            table: EN_REVERSE_ORDINAL,    group: "english" },
  { id: "en_reduction",          label: "English Reduction",   sublabel: "A–Z цикл 1–9",          table: EN_REDUCTION,          group: "english" },
  { id: "en_reverse_reduction",  label: "English R Reduction", sublabel: "Z–A цикл 1–9",          table: EN_REVERSE_REDUCTION,  group: "english" },
  { id: "en_sumerian",           label: "English Sumerian",    sublabel: "A=6 … Z=156",           table: EN_SUMERIAN,           group: "english" },
  { id: "en_reverse_sumerian",   label: "English R Sumerian",  sublabel: "Z=6 … A=156",           table: EN_REVERSE_SUMERIAN,   group: "english" },
  { id: "en_extended",           label: "English Extended",    sublabel: "A=1 … Z=26",            table: EN_EXTENDED,           group: "english_extended" },
  { id: "en_reverse_extended",   label: "English R Extended",  sublabel: "Z=1 … A=26",            table: EN_REVERSE_EXTENDED,   group: "english_extended" },
  { id: "en_agrippa_key",        label: "Agrippa Key",         sublabel: "a=1 … z=500",           table: EN_AGRIPPA_KEY,        group: "english" },
  { id: "en_agrippa_ordinal",    label: "Agrippa Ordinal",     sublabel: "ранг по Агриппе 1–23",  table: EN_AGRIPPA_ORDINAL,    group: "english_extended" },
  { id: "en_agrippa_reduction",  label: "Agrippa Reduction",   sublabel: "Агриппа → цифр. корень",table: EN_AGRIPPA_REDUCTION,  group: "english_extended" },
  { id: "en_qaballa",            label: "English Qaballa",     sublabel: "EQ: a=21 … b=26",       table: EN_QABALLA,            group: "english_extended" },
  { id: "en_illuminati_novice",  label: "Illuminati Novice",   sublabel: "A=1, B=3, C=6…",        table: EN_ILLUMINATI_NOVICE,  group: "english_extended" },
  { id: "en_illuminati_reverse", label: "Illuminati Reverse",  sublabel: "Z=1, Y=3, X=6…",        table: EN_ILLUMINATI_REVERSE, group: "english_extended" },
  { id: "ru_ordinal",            label: "Russian Ordinal",     sublabel: "А=1 … Я=33",            table: RU_ORDINAL,            group: "russian" },
  { id: "ru_reverse_ordinal",    label: "Russian R Ordinal",   sublabel: "Я=1 … А=33",            table: RU_REVERSE_ORDINAL,    group: "russian" },
  { id: "ru_reduction",          label: "Russian Reduction",   sublabel: "А–Я цикл 1–9",          table: RU_REDUCTION,          group: "russian" },
  { id: "ru_reverse_reduction",  label: "Russian R Reduction", sublabel: "Я–А цикл 1–9",          table: RU_REVERSE_REDUCTION,  group: "russian" },
  { id: "ru_sumerian",           label: "Russian Sumerian",    sublabel: "А=6 … Я=198",           table: RU_SUMERIAN,           group: "russian" },
  { id: "ru_reverse_sumerian",   label: "Russian R Sumerian",  sublabel: "Я=6 … А=198",           table: RU_REVERSE_SUMERIAN,   group: "russian" },
  // Church Slavonic
  { id: "cs_gematria",           label: "ЦС Гематрия",         sublabel: "а=1 … ѿ=900",           table: CS_GEMATRIA,           group: "church_slavonic" },

  // Hebrew
  { id: "he_gematria",           label: "Hebrew Gematria",     sublabel: "א=1 … ת=400",           table: HE_GEMATRIA,           group: "hebrew" },
  { id: "he_soffits",            label: "Hebrew Soffits",      sublabel: "incl. finals ך–ץ",       table: HE_SOFFITS,            group: "hebrew" },
  { id: "he_ordinal",            label: "Hebrew Ordinal",      sublabel: "א=1 … ת=22",            table: HE_ORDINAL,            group: "hebrew" },
  { id: "he_reduction",          label: "Hebrew Reduction",    sublabel: "цикл 1–9",              table: HE_REDUCTION,          group: "hebrew" },
  // Greek
  { id: "gr_isopsephy",          label: "Greek Isopsephy",     sublabel: "α=1 … ω=800",           table: GR_ISOPSEPHY,          group: "greek" },
  { id: "gr_ordinal",            label: "Greek Ordinal",       sublabel: "α=1 … ω=24",            table: GR_ORDINAL,            group: "greek" },

  { id: "gr_reduction",          label: "Greek Reduction",     sublabel: "цикл 1–9",              table: GR_REDUCTION,          group: "greek" },
  // Arabic
  { id: "ar_abjad",              label: "Arabic Abjad",        sublabel: "ا=1 … غ=1000",          table: AR_ABJAD,              group: "arabic" },
  { id: "ar_ordinal",            label: "Arabic Ordinal",      sublabel: "ا=1 … ي=28",            table: AR_ORDINAL,            group: "arabic" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

interface CharInfo { char: string; value: number; isSpace: boolean }

interface HistoryItem {
  id: number;
  text: string;
  results: { cipherId: CipherId; cipherLabel: string; value: number; reduced: number; order?: { number: number; style: "box" | "underline" } | null }[];
  date: string;
}

// Strip diacritics:
// - Greek: NFD-decompose then remove combining marks (U+0300–U+036F, U+1DC0–U+1DFF)
// - Hebrew niqqud (U+05B0–U+05C7)
// - Arabic harakat (U+064B–U+065F), tatweel (U+0640)
function stripDiacritics(char: string): string {
  return char
    .normalize("NFD")
    .replace(/[\u0300-\u036F\u1DC0-\u1DFF\u05B0-\u05C7\u064B-\u065F\u0640]/g, "");
}

function getCharValue(char: string, table: Record<string, number>): number {
  const fromTable = table[char.toLowerCase()];
  if (fromTable !== undefined) return fromTable;
  return 0;
}

function parseChars(text: string, table: Record<string, number>): CharInfo[] {
  const result: CharInfo[] = [];
  let i = 0;
  while (i < text.length) {
    const raw = text[i];
    const stripped = stripDiacritics(raw);
    if (stripped === "") { i++; continue; }
    // Collect consecutive digit characters into one number token
    if (/\d/.test(stripped)) {
      let numStr = stripped;
      let j = i + 1;
      while (j < text.length && /\d/.test(stripDiacritics(text[j]))) {
        numStr += stripDiacritics(text[j]);
        j++;
      }
      result.push({ char: numStr, value: parseInt(numStr, 10), isSpace: false });
      i = j;
      continue;
    }
    result.push({ char: stripped, value: getCharValue(stripped, table), isSpace: stripped === " " });
    i++;
  }
  return result;
}

function sumText(text: string, table: Record<string, number>): number {
  return parseChars(text, table).reduce((acc, c) => acc + c.value, 0);
}

function digitalRoot(n: number): number {
  if (n === 0) return 0;
  let x = n;
  while (x > 9) x = String(x).split("").reduce((a, d) => a + Number(d), 0);
  return x;
}

function formatDate(): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric", month: "short",
  }).format(new Date());
}

// ── Highlight rules ────────────────────────────────────────────────────────────

const HIGHLIGHT_BOX = new Set([
  119, 911, 116, 611, 666, 999, 216, 612,
  239, 932, 236, 632, 88, 313, 358, 853, 33, 69, 96,
]);

const HIGHLIGHT_UNDERLINE = new Set([329, 923, 392, 293, 326, 623, 362, 263, 44, 55, 102, 201, 322, 223, 1488, 8841, 413, 111, 222, 333, 444, 555, 777, 888, 188, 881, 2016, 6102, 1109, 9011, 1019, 9101, 808, 906, 609, 23, 32, 46, 64, 238, 832, 1116, 6111]);

function getValueStyle(val: number): "box" | "underline" | null {
  if (HIGHLIGHT_BOX.has(val)) return "box";
  if (HIGHLIGHT_UNDERLINE.has(val)) return "underline";
  return null;
}

// For 2–3 letter words: check if concatenation of letter values forms a highlighted number
// e.g. values [3, 58] → "358" → in HIGHLIGHT_BOX
function findConcatMatch(values: number[]): { number: number; style: "box" | "underline" } | null {
  // single value 1-9: show if highlighted
  if (values.length === 1) {
    const v = values[0];
    if (v >= 1 && v <= 9) {
      const style = getValueStyle(v);
      if (style) return { number: v, style };
    }
    return null;
  }
  if (values.length < 2 || values.length > 3) return null;
  const concat = Number(values.join(""));
  const style = getValueStyle(concat);
  if (style) return { number: concat, style };
  // also try reversed
  const concatRev = Number([...values].reverse().join(""));
  const styleRev = getValueStyle(concatRev);
  if (styleRev) return { number: concatRev, style: styleRev };
  return null;
}

const DEFAULT_ENABLED: CipherId[] = [
  "en_ordinal", "en_reduction", "en_sumerian",
  "en_reverse_ordinal", "en_reverse_reduction", "en_reverse_sumerian",
  "en_agrippa_key",
  "ru_ordinal", "ru_reduction",
  "ru_reverse_ordinal", "ru_reverse_reduction",
  "ru_sumerian", "ru_reverse_sumerian",
  "cs_gematria",
  "he_gematria", "he_soffits",
  "gr_isopsephy", "gr_ordinal",
  "ar_abjad",
];
const LS_CIPHERS = "gematria_ciphers";
const LS_HISTORY = "gematria_history";

function loadEnabledCiphers(): Set<CipherId> {
  try {
    const raw = localStorage.getItem(LS_CIPHERS);
    if (raw) {
      const arr = JSON.parse(raw) as CipherId[];
      if (Array.isArray(arr) && arr.length > 0) return new Set(arr);
    }
  } catch (e) { console.warn(e); }
  return new Set(DEFAULT_ENABLED);
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    if (raw) return JSON.parse(raw) as HistoryItem[];
  } catch (e) { console.warn(e); }
  return [];
}

// ── Component ──────────────────────────────────────────────────────────────────

type Tab = "calc" | "ciphers";

export default function Index() {
  const [tab, setTab] = useState<Tab>("calc");
  const [text, setText] = useState("");
  const [committed, setCommitted] = useState("");
  const [enabledCiphers, setEnabledCiphers] = useState<Set<CipherId>>(loadEnabledCiphers);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [showBreakdownFor, setShowBreakdownFor] = useState<CipherId | null>(null);
  const [showCSKeyboard, setShowCSKeyboard] = useState(false);
  const [showGRKeyboard, setShowGRKeyboard] = useState(false);
  const [showHEKeyboard, setShowHEKeyboard] = useState(false);
  const [showARKeyboard, setShowARKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultKey = useRef(0);

  // Persist ciphers
  useEffect(() => {
    localStorage.setItem(LS_CIPHERS, JSON.stringify(Array.from(enabledCiphers)));
  }, [enabledCiphers]);

  // Persist history
  useEffect(() => {
    localStorage.setItem(LS_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => { if (tab === "calc") inputRef.current?.focus(); }, [tab]);

  const insertCSChar = (char: string) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    const newText = text.slice(0, start) + char + text.slice(end);
    setText(newText);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + char.length, start + char.length);
    });
  };

  const detectedLang = detectLang(text);
  const effectiveLang = showCSKeyboard ? "church_slavonic" : showGRKeyboard ? "greek" : showHEKeyboard ? "hebrew" : showARKeyboard ? "arabic" : detectedLang;
  const hasText = text.trim().length > 0;

  useEffect(() => {
    if (detectedLang === "church_slavonic") { setShowCSKeyboard(true); setShowGRKeyboard(false); setShowHEKeyboard(false); setShowARKeyboard(false); }
    else if (detectedLang === "greek") { setShowGRKeyboard(true); setShowCSKeyboard(false); setShowHEKeyboard(false); setShowARKeyboard(false); }
    else if (detectedLang === "hebrew") { setShowHEKeyboard(true); setShowCSKeyboard(false); setShowGRKeyboard(false); setShowARKeyboard(false); }
    else if (detectedLang === "arabic") { setShowARKeyboard(true); setShowCSKeyboard(false); setShowGRKeyboard(false); setShowHEKeyboard(false); }
  }, [detectedLang]);

  // Ciphers to use for calculation — filtered by detected language
  const activeCiphers = CIPHERS.filter((c) => {
    if (!enabledCiphers.has(c.id)) return false;
    if (effectiveLang === "russian") return c.group === "russian";
    if (effectiveLang === "church_slavonic") return c.group === "church_slavonic";
    if (effectiveLang === "english") return c.group === "english" || c.group === "english_extended";
    if (effectiveLang === "hebrew") return c.group === "hebrew";
    if (effectiveLang === "greek") return c.group === "greek";
    if (effectiveLang === "arabic") return c.group === "arabic";
    return true;
  });

  function handleCalculate() {
    const trimmed = text.trim();
    if (!trimmed || activeCiphers.length === 0) return;
    resultKey.current += 1;
    setCommitted(trimmed);
    const results = activeCiphers.map((c) => {
      const val = sumText(trimmed, c.table);
      const chars = parseChars(trimmed, c.table).filter(ch => !ch.isSpace);
      const order = findConcatMatch(chars.map(ch => ch.value));
      return { cipherId: c.id, cipherLabel: c.label, value: val, reduced: digitalRoot(val), order };
    });
    setHistory((prev) => [
      { id: Date.now(), text: trimmed, results, date: formatDate() },
      ...prev.slice(0, 49),
    ]);
    setShowBreakdownFor(null);
    setShowCSKeyboard(false);
    setShowGRKeyboard(false);
    setShowHEKeyboard(false);
    setShowARKeyboard(false);
  }

  function toggleCipher(id: CipherId) {
    setText("");
    setCommitted("");
    setEnabledCiphers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        const cipher = CIPHERS.find((c) => c.id === id);
        if (cipher) {
          CIPHERS.filter((c) => c.group !== cipher.group).forEach((c) => next.delete(c.id));
        }
        next.add(id);
      }
      return next;
    });
  }

  function toggleGroup(group: "english" | "english_extended" | "russian" | "church_slavonic" | "hebrew" | "greek" | "arabic", enable: boolean) {
    setText("");
    setCommitted("");
    setEnabledCiphers((prev) => {
      const next = new Set(prev);
      if (enable) {
        CIPHERS.filter((c) => c.group !== group).forEach((c) => next.delete(c.id));
        CIPHERS.filter((c) => c.group === group).forEach((c) => next.add(c.id));
      } else {
        CIPHERS.filter((c) => c.group === group).forEach((c) => next.delete(c.id));
      }
      return next;
    });
  }

  const committedResults = history[0]?.text === committed ? history[0]?.results ?? [] : [];
  const firstCipher = committedResults[0] ? CIPHERS.find((c) => c.id === committedResults[0].cipherId) : null;

  const enabledCount = enabledCiphers.size;
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedCipherTable, setExpandedCipherTable] = useState<CipherId | null>(null);
  const [swipedId, setSwipedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const swipeStartX = useRef<number>(0);
  const swipeStartY = useRef<number>(0);
  const swipeDisabled = useRef<boolean>(false);

  // Drag state
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartY = useRef<number>(0);
  const historyListRef = useRef<HTMLDivElement>(null);

  function deleteHistoryItem(id: number) {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    setSwipedId(null);
    setConfirmDeleteId(null);
  }

  function handleSwipeStart(e: React.TouchEvent, id: number, fromGrip = false) {
    swipeDisabled.current = fromGrip;
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  }

  function handleSwipeEnd(e: React.TouchEvent, id: number) {
    if (swipeDisabled.current) return;
    const dx = swipeStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(swipeStartY.current - e.changedTouches[0].clientY);
    if (dx > 60 && dy < 40) {
      setSwipedId(id);
      setConfirmDeleteId(null);
    } else if (dx < -20) {
      setSwipedId(null);
    }
  }

  function getIdxFromY(clientY: number): number | null {
    if (!historyListRef.current) return null;
    const children = Array.from(historyListRef.current.children) as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (clientY < rect.bottom) return i;
    }
    return children.length - 1;
  }

  function applyDrop(fromId: number, toIdx: number) {
    setHistory((prev) => {
      const fromIdx = prev.findIndex((h) => h.id === fromId);
      if (fromIdx === -1 || fromIdx === toIdx) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }

  // Mouse drag handlers
  function lockScroll() {
    document.body.style.overflow = "hidden";
    if (historyListRef.current) historyListRef.current.style.overflow = "hidden";
  }

  function unlockScroll() {
    document.body.style.overflow = "";
    if (historyListRef.current) historyListRef.current.style.overflow = "";
  }

  function handleMouseDown(e: React.MouseEvent, id: number) {
    if (e.button !== 0) return;
    dragStartY.current = e.clientY;
    longPressTimer.current = setTimeout(() => {
      setDraggingId(id);
      lockScroll();
    }, 400);
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (draggingId !== null && dragOverIdx !== null) {
      applyDrop(draggingId, dragOverIdx);
    }
    setDraggingId(null);
    setDragOverIdx(null);
    unlockScroll();
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (draggingId === null) return;
    const idx = getIdxFromY(e.clientY);
    if (idx !== null) setDragOverIdx(idx);
  }

  // Touch drag handlers
  function handleTouchStartDrag(e: React.TouchEvent, id: number) {
    dragStartY.current = e.touches[0].clientY;
    longPressTimer.current = setTimeout(() => {
      setDraggingId(id);
      lockScroll();
    }, 400);
  }

  function handleTouchMoveDrag(e: React.TouchEvent) {
    if (!longPressTimer.current && draggingId === null) return;
    if (draggingId !== null) {
      e.preventDefault();
      const idx = getIdxFromY(e.touches[0].clientY);
      if (idx !== null) setDragOverIdx(idx);
    } else {
      const dy = Math.abs(e.touches[0].clientY - dragStartY.current);
      if (dy > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }

  function handleTouchEndDrag(e: React.TouchEvent) {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    if (draggingId !== null && dragOverIdx !== null) {
      applyDrop(draggingId, dragOverIdx);
    }
    setDraggingId(null);
    setDragOverIdx(null);
    unlockScroll();
  }

  function toggleGroupCollapse(group: string) {
    setExpandedGroup((prev) => prev === group ? null : group);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col text-[13px]">
      {/* Header */}
      <header className="border-b border-border px-4 py-2 flex items-center justify-between" style={{ background: 'hsl(222 25% 6%)' }}>
        <div className="flex items-center gap-3">
          <span className="text-foreground font-bold tracking-[0.2em] uppercase text-sm">
            GEMATRIA
          </span>
          <span className="text-muted-foreground/40 text-xs hidden sm:block">
            / calculator
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex gap-0">
          {([["calc", "CALC"], ["ciphers", "CIPHERS"]] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs tracking-widest transition-colors duration-100 border-b-2 ${
                tab === t
                  ? "text-accent border-accent"
                  : "text-foreground/70 border-transparent hover:text-foreground"
              }`}
            >
              {label}
              {t === "ciphers" && (
                <span className="ml-1.5 text-[10px] opacity-50">{enabledCount}</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* ── TAB: CALCULATOR ── */}
      {tab === "calc" && (
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left — Input + Results */}
          <section className="flex-1 flex flex-col min-w-0">
            {/* Input bar */}
            <div className="border-b border-border px-4 py-3 flex items-center gap-3" style={{ background: 'hsl(222 25% 8%)' }}>
              <span className="text-foreground/50 text-xs shrink-0">&gt;</span>
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCalculate(); } }}
                onFocus={() => {
                  const hasCS = CIPHERS.some(c => c.group === "church_slavonic" && enabledCiphers.has(c.id));
                  const hasGR = CIPHERS.some(c => c.group === "greek" && enabledCiphers.has(c.id));
                  const hasHE = CIPHERS.some(c => c.group === "hebrew" && enabledCiphers.has(c.id));
                  const hasAR = CIPHERS.some(c => c.group === "arabic" && enabledCiphers.has(c.id));
                  if (detectedLang === "greek" || (!detectedLang && hasGR && !hasCS && !hasHE && !hasAR)) { setShowGRKeyboard(true); }
                  else if (detectedLang === "hebrew" || (!detectedLang && hasHE && !hasCS && !hasGR && !hasAR)) { setShowHEKeyboard(true); }
                  else if (detectedLang === "arabic" || (!detectedLang && hasAR && !hasCS && !hasGR && !hasHE)) { setShowARKeyboard(true); }
                  else if (hasCS) { setShowCSKeyboard(true); }
                }}
                onBlur={(e) => { if (!e.relatedTarget?.closest?.('[data-cskeyboard]') && !e.relatedTarget?.closest?.('[data-grkeyboard]') && !e.relatedTarget?.closest?.('[data-hekeyboard]') && !e.relatedTarget?.closest?.('[data-arkeyboard]')) { setShowCSKeyboard(false); setShowGRKeyboard(false); setShowHEKeyboard(false); setShowARKeyboard(false); } }}
                placeholder="enter word or phrase..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground/40 text-sm"
                spellCheck={false}
                autoComplete="off"
                readOnly={showCSKeyboard || showGRKeyboard || showHEKeyboard || showARKeyboard}
              />
              <div className="flex items-center gap-3 shrink-0">
                {effectiveLang && (
                  <span className="text-[11px] text-accent/70 hidden sm:block">
                    {{ english: "EN", russian: "RU", church_slavonic: "ЦСЯ", hebrew: "HE", greek: "GR", arabic: "AR" }[effectiveLang]} · {activeCiphers.length}
                  </span>
                )}

                {hasText && (
                  <button onClick={() => { setText(""); setCommitted(""); }} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    <Icon name="X" size={13} />
                  </button>
                )}
                <button
                  onClick={handleCalculate}
                  disabled={!hasText || activeCiphers.length === 0}
                  className="px-3 py-1 text-xs border border-border text-foreground/80 hover:text-accent hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors tracking-widest uppercase"
                >
                  CALC
                </button>
              </div>
            </div>

            {/* Church Slavonic virtual keyboard */}
            {showCSKeyboard && (
              <div data-cskeyboard className="border-b border-border px-3 py-2 flex flex-col gap-1.5" style={{ background: 'hsl(222 25% 6%)' }}>
                {[
                  ['А','В','Г','Д','Є','Е','Ж','Ѕ','З','И','І','Ї'],
                  ['Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф'],
                  ['Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Ѣ','Э','Ю','Я'],
                  ['Ѳ','Ѵ','Ѯ','Ѱ','Ѡ','Ѿ',' ','⌫'],
                ].map((row, ri) => (
                  <div key={ri} className="flex gap-1 flex-wrap">
                    {row.map((ch) => (
                      <button
                        key={ch}
                        onMouseDown={(e) => { e.preventDefault(); if (ch === '⌫') { setText(t => t.slice(0, -1)); } else { insertCSChar(ch); } }}
                        className={`flex items-center justify-center border border-border/60 text-foreground/80 hover:text-accent hover:border-accent/40 transition-colors select-none
                          ${ch === ' ' ? 'flex-1 text-[10px] text-foreground/30 tracking-widest' : 'min-w-[32px] h-8 text-sm'}
                          ${ch === '⌫' ? 'px-3 text-foreground/40 hover:text-red-400 hover:border-red-400/40 text-xs' : ''}
                        `}
                        style={{ background: 'hsl(222 25% 10%)' }}
                      >
                        {ch === ' ' ? 'SPACE' : ch}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Greek virtual keyboard */}
            {showGRKeyboard && (
              <div data-grkeyboard className="border-b border-border px-3 py-2 flex flex-col gap-1.5" style={{ background: 'hsl(222 25% 6%)' }}>
                {[
                  ['Α','Β','Γ','Δ','Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ'],
                  ['Ν','Ξ','Ο','Π','Ρ','Σ','Τ','Υ','Φ','Χ','Ψ','Ω'],
                  ['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ'],
                  ['ν','ξ','ο','π','ρ','σ','ς','τ','υ','φ','χ','ψ'],
                  ['ω','ϛ','ϙ','ϡ',' ','⌫'],
                ].map((row, ri) => (
                  <div key={ri} className="flex gap-1 flex-wrap">
                    {row.map((ch) => (
                      <button
                        key={ch}
                        onMouseDown={(e) => { e.preventDefault(); if (ch === '⌫') { setText(t => t.slice(0, -1)); } else { insertCSChar(ch); } }}
                        className={`flex items-center justify-center border border-border/60 text-foreground/80 hover:text-accent hover:border-accent/40 transition-colors select-none
                          ${ch === ' ' ? 'flex-1 text-[10px] text-foreground/30 tracking-widest' : 'min-w-[32px] h-8 text-sm'}
                          ${ch === '⌫' ? 'px-3 text-foreground/40 hover:text-red-400 hover:border-red-400/40 text-xs' : ''}
                        `}
                        style={{ background: 'hsl(222 25% 10%)' }}
                      >
                        {ch === ' ' ? 'SPACE' : ch}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Hebrew virtual keyboard */}
            {showHEKeyboard && (
              <div data-hekeyboard className="border-b border-border px-3 py-2 flex flex-col gap-1.5" style={{ background: 'hsl(222 25% 6%)' }}>
                {[
                  ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ך'],
                  ['ל','מ','ם','נ','ן','ס','ע','פ','ף','צ','ץ','ק'],
                  ['ר','ש','ת',' ','⌫'],
                ].map((row, ri) => (
                  <div key={ri} className="flex gap-1 flex-wrap">
                    {row.map((ch) => (
                      <button
                        key={ch}
                        onMouseDown={(e) => { e.preventDefault(); if (ch === '⌫') { setText(t => t.slice(0, -1)); } else { insertCSChar(ch); } }}
                        className={`flex items-center justify-center border border-border/60 text-foreground/80 hover:text-accent hover:border-accent/40 transition-colors select-none
                          ${ch === ' ' ? 'flex-1 text-[10px] text-foreground/30 tracking-widest' : 'min-w-[32px] h-8 text-sm'}
                          ${ch === '⌫' ? 'px-3 text-foreground/40 hover:text-red-400 hover:border-red-400/40 text-xs' : ''}
                        `}
                        style={{ background: 'hsl(222 25% 10%)' }}
                      >
                        {ch === ' ' ? 'SPACE' : ch}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Arabic virtual keyboard */}
            {showARKeyboard && (
              <div data-arkeyboard className="border-b border-border px-3 py-2 flex flex-col gap-1.5" style={{ background: 'hsl(222 25% 6%)' }}>
                {[
                  ['ا','أ','إ','آ','ء','ب','ت','ة','ث','ج','ح','خ'],
                  ['د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ'],
                  ['ف','ق','ك','ل','م','ن','ه','و','ي','ى',' ','⌫'],
                ].map((row, ri) => (
                  <div key={ri} className="flex gap-1 flex-wrap">
                    {row.map((ch) => (
                      <button
                        key={ch}
                        onMouseDown={(e) => { e.preventDefault(); if (ch === '⌫') { setText(t => t.slice(0, -1)); } else { insertCSChar(ch); } }}
                        className={`flex items-center justify-center border border-border/60 text-foreground/80 hover:text-accent hover:border-accent/40 transition-colors select-none
                          ${ch === ' ' ? 'flex-1 text-[10px] text-foreground/30 tracking-widest' : 'min-w-[32px] h-8 text-sm'}
                          ${ch === '⌫' ? 'px-3 text-foreground/40 hover:text-red-400 hover:border-red-400/40 text-xs' : ''}
                        `}
                        style={{ background: 'hsl(222 25% 10%)' }}
                      >
                        {ch === ' ' ? 'SPACE' : ch}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Results table */}
            <div className="flex-1 overflow-y-auto">
              {committed && committedResults.length > 0 ? (
                <div key={resultKey.current} className="animate-fade-in">
                  {/* Table header */}
                  <div className="flex items-center border-b border-border px-4 py-1.5 sticky top-0 z-10" style={{ background: 'hsl(222 25% 8%)' }}>
                    <span className="text-foreground/80 text-[11px] w-6 shrink-0">#</span>
                    <span className="text-foreground/80 text-[11px] flex-1">CIPHER</span>
                    <span className="text-foreground/80 text-[11px] w-16 text-right hidden sm:block">WORD</span>
                    <span className="text-foreground/80 text-[11px] w-12 text-right">ORDER</span>
                    <span className="text-foreground/80 text-[11px] w-16 text-right">VALUE</span>
                    <span className="w-6 shrink-0" />
                  </div>

                  {committedResults.map((r, i) => {
                    const cipher = CIPHERS.find((c) => c.id === r.cipherId)!;
                    const isOpen = showBreakdownFor === r.cipherId;
                    const chars = parseChars(committed, cipher.table).filter(c => !c.isSpace);
                    const concatMatch = findConcatMatch(chars.map(c => c.value));
                    return (
                      <div key={r.cipherId} className={`border-b border-border/40 ${isOpen ? "bg-secondary/60" : "hover:bg-secondary/40"} transition-colors`}>
                        <div
                          className="flex items-center px-4 py-2 cursor-pointer"
                          onClick={() => setShowBreakdownFor(isOpen ? null : r.cipherId)}
                        >
                          <span className="text-muted-foreground/30 text-[11px] w-6 shrink-0">{i + 1}</span>
                          <span className="text-foreground/80 text-[13px] flex-1 truncate">{r.cipherLabel}</span>
                          <span className="text-muted-foreground/30 text-[11px] w-16 text-right hidden sm:block truncate">{cipher.sublabel}</span>
                          <span className="w-12 flex justify-end group relative">
                            {concatMatch ? (
                              <>
                                {concatMatch.style === "box" ? (
                                  <span className="text-[11px] font-medium px-1 py-0.5 leading-none cursor-default" style={{ background: '#facc15', color: '#000' }}>{concatMatch.number}</span>
                                ) : (
                                  <span className="text-[11px] text-accent font-medium cursor-default" style={{ borderBottom: '2px solid #facc15' }}>{concatMatch.number}</span>
                                )}
                                <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded bg-popover border border-border px-2 py-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
                                  {chars.map(c => c.value).join(" · ")} → {concatMatch.number}
                                </span>
                              </>
                            ) : null}
                          </span>
                          <span className="w-16 flex justify-end">
                            {(() => {
                              const hs = getValueStyle(r.value);
                              if (hs === "box") return (
                                <span className="text-sm font-medium px-1.5 py-0.5 leading-none" style={{ background: '#facc15', color: '#000' }}>{r.value}</span>
                              );
                              if (hs === "underline") return (
                                <span className="text-accent text-sm font-medium" style={{ borderBottom: '2px solid #facc15' }}>{r.value}</span>
                              );
                              return <span className="text-accent text-sm font-medium">{r.value}</span>;
                            })()}
                          </span>
                          <span className="w-6 flex justify-end shrink-0">
                            <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={11} className="text-muted-foreground/30" />
                          </span>
                        </div>

                        {isOpen && (
                          <div className="px-4 pb-3 pt-1 animate-fade-in-fast border-t border-border/30">
                            <div className="flex flex-wrap gap-1">
                              {parseChars(committed, cipher.table).map((c, ci) =>
                                c.isSpace ? (
                                  <div key={ci} className="w-3" />
                                ) : (
                                  <div key={ci} className="char-cell flex flex-col items-center border border-border/60 px-2 py-1 cursor-default min-w-[28px]">
                                    <span className="text-foreground/80 text-[13px] leading-none">{c.char}</span>
                                    <span className="text-accent/60 text-[9px] mt-0.5">{c.value || "·"}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-foreground/50 text-xs tracking-widest uppercase">
                  {activeCiphers.length === 0 ? "— select ciphers —" : "— enter text & press CALC —"}
                </div>
              )}
            </div>
          </section>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-border" />
          <div className="lg:hidden h-px bg-border" />

          {/* Right — History */}
          <aside className="w-full lg:w-72 flex flex-col border-l-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border" style={{ background: 'hsl(222 25% 8%)' }}>
              <span className="text-[11px] tracking-widest uppercase text-foreground/80">HISTORY</span>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="text-[11px] text-foreground/60 hover:text-foreground transition-colors flex items-center gap-1">
                  <Icon name="Trash2" size={10} /> CLR
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground/50 text-xs tracking-widest uppercase">
                — empty —
              </div>
            ) : (
              <div
                ref={historyListRef}
                className="overflow-y-auto flex-1"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={(e) => {
                  if (swipedId !== null) { e.stopPropagation(); setSwipedId(null); }
                  if (confirmDeleteId !== null) setConfirmDeleteId(null);
                }}
              >
                {history.map((item, idx) => {
                  const isSwiped = swipedId === item.id;
                  const isConfirming = confirmDeleteId === item.id;
                  const isDragging = draggingId === item.id;
                  const isDragOver = dragOverIdx === idx && draggingId !== null && draggingId !== item.id;
                  return (
                    <div
                      key={item.id}
                      className={`animate-fade-in relative border-b border-border/40 overflow-hidden transition-colors ${isDragging ? "opacity-40" : ""} ${isDragOver ? "border-t-2 border-t-accent" : ""}`}
                      style={{ animationDelay: `${idx * 20}ms`, cursor: isDragging ? "grabbing" : "default" }}
                      onMouseDown={(e) => handleMouseDown(e, item.id)}
                      onTouchStart={(e) => handleTouchStartDrag(e, item.id)}
                      onTouchMove={handleTouchMoveDrag}
                      onTouchEnd={handleTouchEndDrag}
                    >
                      {/* Delete reveal — swipe: instant delete / desktop: YES/NO */}
                      <div
                        className={`absolute inset-y-0 right-0 flex items-center transition-all duration-200 ${isSwiped || isConfirming ? "w-24" : "w-0"}`}
                        style={{ background: 'hsl(0 60% 30%)' }}
                      >
                        {isConfirming ? (
                          <div className="flex w-full h-full">
                            <button
                              className="flex-1 h-full text-[11px] text-white/80 hover:text-white tracking-widest uppercase px-2"
                              onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                            >
                              YES
                            </button>
                            <button
                              className="flex-1 h-full text-[11px] text-white/50 hover:text-white/80 tracking-widest uppercase px-2 border-l border-white/20"
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); setSwipedId(null); }}
                            >
                              NO
                            </button>
                          </div>
                        ) : (
                          <button
                            className="w-full h-full text-[11px] text-white/70 hover:text-white tracking-widest uppercase"
                            onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                          >
                            DEL
                          </button>
                        )}
                      </div>

                      {/* Main content */}
                      <div
                        className={`transition-transform duration-200 ${isSwiped ? "-translate-x-24" : "translate-x-0"}`}
                        onTouchStart={(e) => handleSwipeStart(e, item.id)}
                        onTouchEnd={(e) => handleSwipeEnd(e, item.id)}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors"
                          onClick={() => {
                            if (isSwiped) { setSwipedId(null); return; }
                            setText(item.text); setCommitted(item.text); resultKey.current += 1;
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-foreground/90 text-[13px] flex-1 break-words min-w-0">
                              {item.text}
                            </span>
                            <span className="text-foreground/50 text-[10px] shrink-0 ml-2">{item.date}</span>
                          </div>
                          <div
                            className="flex justify-center mb-1.5"
                            onTouchStart={(e) => { e.stopPropagation(); handleSwipeStart(e, item.id, true); handleTouchStartDrag(e, item.id); }}
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            <Icon name="GripHorizontal" size={12} className="text-foreground/40 select-none" />
                          </div>
                          <div className="border border-border/40 overflow-hidden">
                            <div className="flex border-b border-border/40" style={{ background: 'hsl(222 22% 10%)' }}>
                              {item.results.map((r) => (
                                <div key={r.cipherId} className="flex-1 min-w-0 px-1.5 py-1 text-center border-r border-border/30 last:border-0">
                                  <span className="text-[9px] text-foreground/60 tracking-wider uppercase leading-none block truncate">
                                    {r.cipherLabel.replace(/[^A-ZА-ЯЁ]/g, "").slice(0, 3) || r.cipherLabel.slice(0, 3).toUpperCase()}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="flex border-b border-border/40">
                              {item.results.map((r) => (
                                <div key={r.cipherId} className="flex-1 min-w-0 px-1 py-1 text-center border-r border-border/30 last:border-0 flex items-center justify-center">
                                  {(() => {
                                    const hs = getValueStyle(r.value);
                                    if (hs === "box") return (
                                      <span className="text-[11px] font-medium leading-none px-0.5" style={{ background: '#facc15', color: '#000' }}>{r.value}</span>
                                    );
                                    if (hs === "underline") return (
                                      <span className="text-[12px] text-accent/80 leading-none" style={{ borderBottom: '1.5px solid #facc15' }}>{r.value}</span>
                                    );
                                    return <span className="text-[12px] text-accent/80 leading-none">{r.value}</span>;
                                  })()}
                                </div>
                              ))}
                            </div>
                            {item.results.some(r => r.order) && (
                              <div className="flex" style={{ background: 'hsl(222 22% 8%)' }}>
                                {item.results.map((r) => (
                                  <div key={r.cipherId} className="flex-1 min-w-0 px-1 py-1 text-center border-r border-border/30 last:border-0 flex items-center justify-center">
                                    {r.order ? (
                                      r.order.style === "box" ? (
                                        <span className="text-[10px] font-medium leading-none px-0.5" style={{ background: '#facc15', color: '#000' }}>{r.order.number}</span>
                                      ) : (
                                        <span className="text-[11px] text-accent/80 leading-none" style={{ borderBottom: '1.5px solid #facc15' }}>{r.order.number}</span>
                                      )
                                    ) : (
                                      <span className="text-[10px] text-foreground/20">—</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        </main>
      )}

      {/* ── TAB: CIPHERS ── */}
      {tab === "ciphers" && (
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 border-b border-border text-[11px] text-foreground/70 tracking-wide" style={{ background: 'hsl(222 25% 8%)' }}>
            Язык определяется автоматически · выбранные шифры сохраняются
          </div>

          {(["english", "english_extended", "russian", "church_slavonic", "hebrew", "greek", "arabic"] as const).map((group) => {
            const groupCiphers = CIPHERS.filter((c) => c.group === group);
            const allEnabled = groupCiphers.every((c) => enabledCiphers.has(c.id));
            const isCollapsed = expandedGroup !== group;
            const groupLabel = { english: "ENGLISH", english_extended: "ENGLISH EXTENDED", russian: "RUSSIAN", church_slavonic: "ЦЕРК.-СЛАВ.", hebrew: "HEBREW", greek: "GREEK", arabic: "ARABIC" }[group];

            return (
              <div key={group}>
                {/* Group header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border sticky top-0 z-10" style={{ background: 'hsl(222 22% 10%)' }}>
                  <button
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => toggleGroupCollapse(group)}
                  >
                    <Icon
                      name={isCollapsed ? "ChevronRight" : "ChevronDown"}
                      size={11}
                      className="text-foreground/60"
                    />
                    <span className="text-[11px] tracking-widest uppercase text-foreground/80">
                      {groupLabel}
                    </span>
                    <span className="text-[11px] text-foreground/50">
                      {groupCiphers.filter((c) => enabledCiphers.has(c.id)).length}/{groupCiphers.length}
                    </span>
                  </button>
                  <button
                    onClick={() => toggleGroup(group, !allEnabled)}
                    className="text-[11px] text-foreground/60 hover:text-accent transition-colors tracking-widest uppercase"
                  >
                    {allEnabled ? "NONE" : "ALL"}
                  </button>
                </div>

                {/* Cipher rows */}
                {!isCollapsed && groupCiphers.map((c, i) => {
                  const enabled = enabledCiphers.has(c.id);
                  const tableOpen = expandedCipherTable === c.id;
                  const tableEntries = Object.entries(c.table).filter(([k]) => k.length === 1);

                  return (
                    <div key={c.id} className="border-b border-border/30">
                      <label
                        className={`flex items-center gap-4 px-4 py-2.5 cursor-pointer transition-colors ${
                          enabled ? "bg-secondary/30" : "hover:bg-secondary/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleCipher(c.id)}
                          className="cipher-check"
                        />
                        <button
                          className={`text-[13px] flex-1 text-left transition-colors ${enabled ? "text-foreground" : "text-muted-foreground/50"}`}
                          onClick={(e) => { e.preventDefault(); setExpandedCipherTable(tableOpen ? null : c.id); }}
                        >
                          {c.label}
                        </button>
                        <span className="text-[11px] text-muted-foreground/25 hidden sm:block">{c.sublabel}</span>
                        <button
                          onClick={(e) => { e.preventDefault(); setExpandedCipherTable(tableOpen ? null : c.id); }}
                          className="text-foreground/50 hover:text-foreground transition-colors"
                        >
                          <Icon name={tableOpen ? "ChevronUp" : "ChevronDown"} size={11} />
                        </button>
                      </label>

                      {/* Letter-value table */}
                      {tableOpen && (
                        <div className="px-4 pb-3 pt-1 animate-fade-in-fast" style={{ background: 'hsl(222 25% 6%)' }}>
                          <div className="flex flex-wrap gap-0 border border-border/40 overflow-hidden">
                            {tableEntries.map(([letter, value]) => (
                              <div
                                key={letter}
                                className="flex flex-col items-center border-r border-b border-border/30 last:border-r-0"
                                style={{ minWidth: '2.2rem' }}
                              >
                                <span className="text-[11px] text-foreground/70 px-1.5 py-1 border-b border-border/30 w-full text-center uppercase">
                                  {letter}
                                </span>
                                <span className="text-[11px] text-accent/70 px-1.5 py-1 w-full text-center">
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-border px-4 py-1.5 flex items-center justify-between" style={{ background: 'hsl(222 25% 6%)' }}>
        <span className="text-[11px] text-muted-foreground/25 tracking-wide">
          {enabledCount} ciphers selected
        </span>
        <span className="text-[11px] text-muted-foreground/20">
          {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}