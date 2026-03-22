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

const RU_ORDINAL: Record<string, number> = {
  а:1,б:2,в:3,г:4,д:5,е:6,ё:7,ж:8,з:9,и:10,й:11,к:12,л:13,м:14,
  н:15,о:16,п:17,р:18,с:19,т:20,у:21,ф:22,х:23,ц:24,ч:25,ш:26,щ:27,
  ъ:28,ы:29,ь:30,э:31,ю:32,я:33,
};

const RU_REDUCTION: Record<string, number> = Object.fromEntries(
  Object.entries(RU_ORDINAL).map(([k, v]) => [k, ((v - 1) % 9) + 1])
);

type CipherId = "en_ordinal" | "en_reduction" | "ru_ordinal" | "ru_reduction";

interface Cipher {
  id: CipherId;
  label: string;
  sublabel: string;
  table: Record<string, number>;
}

const CIPHERS: Cipher[] = [
  { id: "en_ordinal",   label: "English Ordinal",   sublabel: "A=1 … Z=26",      table: EN_ORDINAL },
  { id: "en_reduction", label: "English Reduction",  sublabel: "A–Z цикл 1–9",   table: EN_REDUCTION },
  { id: "ru_ordinal",   label: "Russian Ordinal",    sublabel: "А=1 … Я=33",      table: RU_ORDINAL },
  { id: "ru_reduction", label: "Russian Reduction",  sublabel: "А–Я цикл 1–9",   table: RU_REDUCTION },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

interface CharInfo { char: string; value: number; isSpace: boolean }

interface HistoryItem {
  id: number;
  text: string;
  cipher: CipherId;
  cipherLabel: string;
  value: number;
  reduced: number;
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

// ── Component ──────────────────────────────────────────────────────────────────

export default function Index() {
  const [text, setText] = useState("");
  const [committed, setCommitted] = useState("");
  const [cipherId, setCipherId] = useState<CipherId>("en_ordinal");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultKey = useRef(0);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const cipher = CIPHERS.find((c) => c.id === cipherId)!;
  const hasText = text.trim().length > 0;

  function handleCalculate() {
    const trimmed = text.trim();
    if (!trimmed) return;
    resultKey.current += 1;
    setCommitted(trimmed);
    const val = sumText(trimmed, cipher.table);
    setHistory((prev) => [
      {
        id: Date.now(),
        text: trimmed,
        cipher: cipher.id,
        cipherLabel: cipher.label,
        value: val,
        reduced: digitalRoot(val),
        date: formatDate(),
      },
      ...prev.slice(0, 49),
    ]);
  }

  function loadFromHistory(item: HistoryItem) {
    setText(item.text);
    setCommitted(item.text);
    setCipherId(item.cipher);
    resultKey.current += 1;
  }

  const committedCipher = CIPHERS.find((c) => c.id === cipherId)!;
  const committedVal = committed ? sumText(committed, committedCipher.table) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-8 py-6 flex items-baseline justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-2xl font-light tracking-widest text-foreground/80">
            ГЕМАТРИЯ
          </span>
          <span className="text-xs text-muted-foreground font-body tracking-wide uppercase">
            числовой анализ
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row">

        {/* Left — Input + Result */}
        <section className="flex-1 flex flex-col px-8 py-10 max-w-2xl">

          {/* Cipher selector */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CIPHERS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCipherId(c.id)}
                className={`px-4 py-2 text-xs font-body tracking-wide border transition-colors duration-150 ${
                  cipherId === c.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                <span>{c.label}</span>
                <span className={`ml-2 text-[10px] opacity-60`}>{c.sublabel}</span>
              </button>
            ))}
          </div>

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

          <button
            onClick={handleCalculate}
            disabled={!hasText}
            className="mt-8 self-start px-8 py-3 bg-foreground text-background font-body text-sm tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/80 transition-colors duration-200"
          >
            Вычислить
          </button>

          {/* Result */}
          {committed && (
            <div key={resultKey.current} className="mt-12 animate-fade-in">
              <div className="flex items-end gap-6 flex-wrap">
                <div>
                  <p className="text-xs text-muted-foreground font-body tracking-widest uppercase mb-1">
                    {committedCipher.label}
                  </p>
                  <span
                    key={"val-" + resultKey.current}
                    className="animate-number-pop block"
                    style={{ fontFamily: "'Cormorant', serif", fontSize: "clamp(3.5rem, 10vw, 6rem)", lineHeight: 1, fontWeight: 300 }}
                  >
                    {committedVal}
                  </span>
                </div>
                <div className="pb-2 border-l border-border pl-6">
                  <p className="text-xs text-muted-foreground font-body tracking-widest uppercase mb-1">
                    Цифровой корень
                  </p>
                  <span
                    className="text-4xl font-light text-muted-foreground"
                    style={{ fontFamily: "'Cormorant', serif" }}
                  >
                    {digitalRoot(committedVal)}
                  </span>
                </div>
              </div>

              {/* Breakdown toggle */}
              <button
                onClick={() => setShowBreakdown((v) => !v)}
                className="mt-6 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-body tracking-wide uppercase transition-colors"
              >
                <Icon name={showBreakdown ? "ChevronUp" : "ChevronDown"} size={12} />
                {showBreakdown ? "Скрыть разбивку" : "Показать разбивку по буквам"}
              </button>

              {showBreakdown && (
                <div className="mt-4 animate-fade-in-fast flex flex-wrap gap-1.5">
                  {parseChars(committed, committedCipher.table).map((c, i) =>
                    c.isSpace ? (
                      <div key={i} className="w-4" />
                    ) : (
                      <div
                        key={i}
                        className="char-cell flex flex-col items-center justify-between border border-border px-2.5 py-2 cursor-default"
                      >
                        <span className="text-lg leading-none" style={{ fontFamily: "'Cormorant', serif" }}>
                          {c.char}
                        </span>
                        <span className="font-body text-[10px] text-muted-foreground mt-1">
                          {c.value || "—"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
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
                  onClick={() => loadFromHistory(item)}
                  className="animate-fade-in text-left px-4 py-3.5 hover:bg-secondary transition-colors border border-transparent hover:border-border"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="text-base font-light text-foreground truncate leading-snug flex-1"
                      style={{ fontFamily: "'Cormorant', serif" }}
                    >
                      {item.text.length > 28 ? item.text.slice(0, 28) + "…" : item.text}
                    </span>
                    <span className="text-xl font-light text-foreground/70 shrink-0" style={{ fontFamily: "'Cormorant', serif" }}>
                      {item.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground/60 font-body border border-border/60 px-1.5 py-0.5">
                      {item.cipherLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-body">
                      {item.date}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 px-8 py-4">
        <p className="text-xs text-muted-foreground/40 font-body tracking-wide">
          English Ordinal A=1…Z=26 · English Reduction A–Z цикл 1–9 · Russian Ordinal А=1…Я=33 · Russian Reduction А–Я цикл 1–9
        </p>
      </footer>
    </div>
  );
}
