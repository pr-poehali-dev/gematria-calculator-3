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

// ── Language detection ─────────────────────────────────────────────────────────

function detectLang(text: string): "english" | "russian" | null {
  const ru = (text.match(/[а-яёА-ЯЁ]/g) || []).length;
  const en = (text.match(/[a-zA-Z]/g) || []).length;
  if (ru === 0 && en === 0) return null;
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
  | "ru_sumerian" | "ru_reverse_sumerian";

interface Cipher {
  id: CipherId;
  label: string;
  sublabel: string;
  table: Record<string, number>;
  group: "english" | "russian";
}

const CIPHERS: Cipher[] = [
  { id: "en_ordinal",            label: "English Ordinal",     sublabel: "A=1 … Z=26",           table: EN_ORDINAL,            group: "english" },
  { id: "en_reduction",          label: "English Reduction",   sublabel: "A–Z цикл 1–9",          table: EN_REDUCTION,          group: "english" },
  { id: "en_reverse_ordinal",    label: "Reverse Ordinal",     sublabel: "Z=1 … A=26",            table: EN_REVERSE_ORDINAL,    group: "english" },
  { id: "en_reverse_reduction",  label: "Reverse Reduction",   sublabel: "Z–A цикл 1–9",          table: EN_REVERSE_REDUCTION,  group: "english" },
  { id: "en_sumerian",           label: "English Sumerian",    sublabel: "A=6 … Z=156",           table: EN_SUMERIAN,           group: "english" },
  { id: "en_reverse_sumerian",   label: "Reverse Sumerian",    sublabel: "Z=6 … A=156",           table: EN_REVERSE_SUMERIAN,   group: "english" },
  { id: "en_extended",           label: "English Extended",    sublabel: "A=1 … Z=26",            table: EN_EXTENDED,           group: "english" },
  { id: "en_reverse_extended",   label: "Reverse Extended",    sublabel: "Z=1 … A=26",            table: EN_REVERSE_EXTENDED,   group: "english" },
  { id: "en_agrippa_key",        label: "Agrippa Key",         sublabel: "a=1 … z=500",           table: EN_AGRIPPA_KEY,        group: "english" },
  { id: "en_agrippa_ordinal",    label: "Agrippa Ordinal",     sublabel: "ранг по Агриппе 1–23",  table: EN_AGRIPPA_ORDINAL,    group: "english" },
  { id: "en_agrippa_reduction",  label: "Agrippa Reduction",   sublabel: "Агриппа → цифр. корень",table: EN_AGRIPPA_REDUCTION,  group: "english" },
  { id: "en_qaballa",            label: "English Qaballa",     sublabel: "EQ: a=21 … b=26",       table: EN_QABALLA,            group: "english" },
  { id: "en_illuminati_novice",  label: "Illuminati Novice",   sublabel: "A=1, B=3, C=6…",        table: EN_ILLUMINATI_NOVICE,  group: "english" },
  { id: "en_illuminati_reverse", label: "Illuminati Reverse",  sublabel: "Z=1, Y=3, X=6…",        table: EN_ILLUMINATI_REVERSE, group: "english" },
  { id: "ru_ordinal",            label: "Russian Ordinal",     sublabel: "А=1 … Я=33",            table: RU_ORDINAL,            group: "russian" },
  { id: "ru_reduction",          label: "Russian Reduction",   sublabel: "А–Я цикл 1–9",          table: RU_REDUCTION,          group: "russian" },
  { id: "ru_reverse_ordinal",    label: "Russian R Ordinal",   sublabel: "Я=1 … А=33",            table: RU_REVERSE_ORDINAL,    group: "russian" },
  { id: "ru_reverse_reduction",  label: "Russian R Reduction", sublabel: "Я–А цикл 1–9",          table: RU_REVERSE_REDUCTION,  group: "russian" },
  { id: "ru_sumerian",           label: "Russian Sumerian",    sublabel: "А=6 … Я=198",           table: RU_SUMERIAN,           group: "russian" },
  { id: "ru_reverse_sumerian",   label: "Russian R Sumerian",  sublabel: "Я=6 … А=198",           table: RU_REVERSE_SUMERIAN,   group: "russian" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

interface CharInfo { char: string; value: number; isSpace: boolean }

interface HistoryItem {
  id: number;
  text: string;
  results: { cipherId: CipherId; cipherLabel: string; value: number; reduced: number }[];
  date: string;
}

function getCharValue(char: string, table: Record<string, number>): number {
  return table[char.toLowerCase()] ?? 0;
}

function parseChars(text: string, table: Record<string, number>): CharInfo[] {
  return text.split("").map((char) => ({
    char,
    value: getCharValue(char, table),
    isSpace: char === " ",
  }));
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
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date());
}

const DEFAULT_ENABLED: CipherId[] = ["en_ordinal", "en_reduction", "ru_ordinal", "ru_reduction"];
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  const detectedLang = detectLang(text);
  const hasText = text.trim().length > 0;

  // Ciphers to use for calculation — filtered by detected language
  const activeCiphers = CIPHERS.filter((c) => {
    if (!enabledCiphers.has(c.id)) return false;
    if (detectedLang === "russian") return c.group === "russian";
    if (detectedLang === "english") return c.group === "english";
    return true;
  });

  function handleCalculate() {
    const trimmed = text.trim();
    if (!trimmed || activeCiphers.length === 0) return;
    resultKey.current += 1;
    setCommitted(trimmed);
    const results = activeCiphers.map((c) => {
      const val = sumText(trimmed, c.table);
      return { cipherId: c.id, cipherLabel: c.label, value: val, reduced: digitalRoot(val) };
    });
    setHistory((prev) => [
      { id: Date.now(), text: trimmed, results, date: formatDate() },
      ...prev.slice(0, 49),
    ]);
    setShowBreakdownFor(null);
  }

  function toggleCipher(id: CipherId) {
    setEnabledCiphers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleGroup(group: "english" | "russian", enable: boolean) {
    setEnabledCiphers((prev) => {
      const next = new Set(prev);
      CIPHERS.filter((c) => c.group === group).forEach((c) => {
        if (enable) next.add(c.id); else next.delete(c.id);
      });
      return next;
    });
  }

  const committedResults = history[0]?.text === committed ? history[0]?.results ?? [] : [];
  const firstCipher = committedResults[0] ? CIPHERS.find((c) => c.id === committedResults[0].cipherId) : null;

  const enabledCount = enabledCiphers.size;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-8 py-5 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-2xl font-light tracking-widest text-foreground/80" style={{ fontFamily: "'Cormorant', serif" }}>
            ГЕМАТРИЯ
          </span>
          <span className="text-xs text-muted-foreground font-body tracking-wide uppercase hidden sm:block">
            числовой анализ
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex gap-0 border border-border">
          {([["calc", "Калькулятор"], ["ciphers", "Шифры"]] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-xs font-body tracking-widest uppercase transition-colors duration-150 relative ${
                tab === t
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {t === "ciphers" && (
                <span className={`ml-2 text-[10px] ${tab === t ? "opacity-60" : "opacity-40"}`}>
                  {enabledCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* ── TAB: CALCULATOR ── */}
      {tab === "calc" && (
        <main className="flex-1 flex flex-col lg:flex-row">
          {/* Left — Input + Results */}
          <section className="flex-1 flex flex-col px-8 py-10 max-w-2xl">

            {/* Language badge */}
            {detectedLang && (
              <div className="mb-6 flex items-center gap-2 animate-fade-in-fast">
                <span className="text-[10px] font-body tracking-widest uppercase text-muted-foreground/50">Язык:</span>
                <span className="text-[10px] font-body text-accent border border-accent/40 px-1.5 py-0.5 leading-none">
                  {detectedLang === "russian" ? "Русский" : "English"}
                </span>
                <span className="text-[10px] text-muted-foreground/40 font-body">
                  · {activeCiphers.length} шифров активно
                </span>
              </div>
            )}

            {/* Input */}
            <div className="relative">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCalculate();
                  }
                }}
                placeholder="Введите слово или фразу…"
                rows={3}
                className="w-full resize-none bg-transparent border-0 border-b-2 border-border focus:border-foreground outline-none transition-colors duration-200 text-3xl font-light text-foreground placeholder:text-muted-foreground/40 pb-4 pt-2 leading-snug"
                style={{ fontFamily: "'Cormorant', serif" }}
              />
              {hasText && (
                <button
                  onClick={() => { setText(""); setCommitted(""); }}
                  className="absolute bottom-4 right-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <Icon name="X" size={14} />
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-muted-foreground font-body tracking-wide">
              Enter — вычислить · Shift+Enter — новая строка
            </p>

            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handleCalculate}
                disabled={!hasText || activeCiphers.length === 0}
                className="self-start px-8 py-3 bg-foreground text-background font-body text-sm tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/80 transition-colors duration-200"
              >
                Вычислить
              </button>
              {activeCiphers.length === 0 && (
                <span className="text-xs text-muted-foreground/60 font-body">
                  Выберите шифры во вкладке «Шифры»
                </span>
              )}
            </div>

            {/* Results table */}
            {committed && committedResults.length > 0 && (
              <div key={resultKey.current} className="mt-10 animate-fade-in">
                <p className="text-xs text-muted-foreground font-body tracking-widest uppercase mb-4">
                  Результаты для «{committed}»
                </p>

                <div className="flex flex-col gap-0">
                  {committedResults.map((r, i) => {
                    const cipher = CIPHERS.find((c) => c.id === r.cipherId)!;
                    const isOpen = showBreakdownFor === r.cipherId;
                    return (
                      <div key={r.cipherId} className="border-b border-border/60 last:border-0">
                        <div
                          className="flex items-center justify-between py-3 cursor-pointer hover:bg-secondary/50 px-2 -mx-2 transition-colors"
                          onClick={() => setShowBreakdownFor(isOpen ? null : r.cipherId)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span
                              className="text-[10px] font-body tracking-wider text-muted-foreground/40 w-5 text-right shrink-0"
                            >
                              {i + 1}
                            </span>
                            <span className="text-sm font-body text-foreground/80 truncate">
                              {r.cipherLabel}
                            </span>
                            <span className="text-[10px] text-muted-foreground/40 font-body hidden sm:block">
                              {cipher.sublabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span
                              className="text-muted-foreground/40 text-xs font-body"
                              title="Цифровой корень"
                            >
                              /{r.reduced}
                            </span>
                            <span
                              className="font-display text-2xl font-light"
                              style={{ fontFamily: "'Cormorant', serif", minWidth: "3rem", textAlign: "right" }}
                            >
                              {r.value}
                            </span>
                            <Icon
                              name={isOpen ? "ChevronUp" : "ChevronDown"}
                              size={12}
                              className="text-muted-foreground/30"
                            />
                          </div>
                        </div>

                        {isOpen && (
                          <div className="pb-3 px-2 animate-fade-in-fast">
                            <div className="flex flex-wrap gap-1">
                              {parseChars(committed, cipher.table).map((c, ci) =>
                                c.isSpace ? (
                                  <div key={ci} className="w-3" />
                                ) : (
                                  <div
                                    key={ci}
                                    className="char-cell flex flex-col items-center border border-border px-2 py-1.5 cursor-default"
                                  >
                                    <span className="text-base leading-none" style={{ fontFamily: "'Cormorant', serif" }}>
                                      {c.char}
                                    </span>
                                    <span className="font-body text-[9px] text-muted-foreground mt-0.5">
                                      {c.value || "—"}
                                    </span>
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
              </div>
            )}
          </section>

          {/* Dividers */}
          <div className="hidden lg:block w-px bg-border/60 my-8" />
          <div className="lg:hidden h-px bg-border/60 mx-8" />

          {/* Right — History */}
          <aside className="w-full lg:w-80 px-8 py-10 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-body text-xs tracking-widest uppercase text-muted-foreground">
                История
              </h2>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs text-muted-foreground/60 hover:text-muted-foreground font-body tracking-wide transition-colors flex items-center gap-1"
                >
                  <Icon name="Trash2" size={11} />
                  Очистить
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                <div className="text-5xl font-light text-border mb-4" style={{ fontFamily: "'Cormorant', serif" }}>
                  א
                </div>
                <p className="text-xs text-muted-foreground/50 font-body tracking-wide">
                  Здесь появятся ваши расчёты
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[70vh] pr-1">
                {history.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => { setText(item.text); setCommitted(item.text); resultKey.current += 1; }}
                    className="animate-fade-in text-left px-4 py-3 hover:bg-secondary transition-colors border border-transparent hover:border-border"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="text-base font-light text-foreground truncate leading-snug flex-1"
                        style={{ fontFamily: "'Cormorant', serif" }}
                      >
                        {item.text.length > 28 ? item.text.slice(0, 28) + "…" : item.text}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40 font-body shrink-0 mt-1">
                        {item.results.length} шифров
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.results.slice(0, 3).map((r) => (
                        <span key={r.cipherId} className="text-[10px] font-body text-muted-foreground/60 border border-border/50 px-1.5 py-0.5">
                          {r.cipherLabel.split(" ").slice(-1)[0]} {r.value}
                        </span>
                      ))}
                      {item.results.length > 3 && (
                        <span className="text-[10px] font-body text-muted-foreground/40">+{item.results.length - 3}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground/30 font-body mt-1">{item.date}</p>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </main>
      )}

      {/* ── TAB: CIPHERS ── */}
      {tab === "ciphers" && (
        <main className="flex-1 px-8 py-10 max-w-3xl">
          <p className="text-sm text-muted-foreground font-body mb-8">
            Выберите шифры, по которым будет вестись расчёт. Язык определяется автоматически — активны только шифры соответствующей группы.
          </p>

          {(["english", "russian"] as const).map((group) => {
            const groupCiphers = CIPHERS.filter((c) => c.group === group);
            const allEnabled = groupCiphers.every((c) => enabledCiphers.has(c.id));
            const someEnabled = groupCiphers.some((c) => enabledCiphers.has(c.id));

            return (
              <div key={group} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-body text-xs tracking-widest uppercase text-muted-foreground">
                    {group === "english" ? "English" : "Russian"}
                    <span className="ml-2 text-muted-foreground/40">
                      ({groupCiphers.filter((c) => enabledCiphers.has(c.id)).length}/{groupCiphers.length})
                    </span>
                  </h3>
                  <button
                    onClick={() => toggleGroup(group, !allEnabled)}
                    className="text-[10px] font-body tracking-wide text-muted-foreground/60 hover:text-foreground transition-colors uppercase"
                  >
                    {allEnabled ? "Снять все" : "Выбрать все"}
                  </button>
                </div>

                <div className="flex flex-col gap-0 border border-border">
                  {groupCiphers.map((c, i) => {
                    const enabled = enabledCiphers.has(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors border-b border-border/60 last:border-0 ${
                          enabled ? "bg-secondary/40" : "hover:bg-secondary/20"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${
                            enabled ? "bg-foreground border-foreground" : "border-border"
                          }`}>
                            {enabled && <Icon name="Check" size={10} className="text-background" />}
                          </div>
                          <div>
                            <p className="text-sm font-body text-foreground leading-none mb-0.5">{c.label}</p>
                            <p className="text-[10px] font-body text-muted-foreground/50">{c.sublabel}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleCipher(c.id)}
                          className="sr-only"
                        />
                        <span className="text-[10px] font-body text-muted-foreground/30 hidden sm:block">
                          #{i + 1}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-border/60 px-8 py-4">
        <p className="text-xs text-muted-foreground/40 font-body tracking-wide">
          {enabledCount} шифров выбрано · язык определяется автоматически
        </p>
      </footer>
    </div>
  );
}