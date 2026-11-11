import type { ReaderTheme } from "~/components/book-reader/reader-storage"

export type ReaderPalette = {
  /** 本の外側（机） */
  desk: string
  page: string
  text: string
  muted: string
  accent: string
  /** ツールバー・パネル */
  chrome: string
  chromeText: string
  border: string
  /** 見開きの綴じ目の影 */
  gutter: string
  shadow: string
}

export const PALETTES: Record<ReaderTheme, ReaderPalette> = {
  paper: {
    desk: "radial-gradient(ellipse at 50% 35%, #efe9dd 0%, #d8d0c0 100%)",
    page: "#fbf8f1",
    text: "#2b2723",
    muted: "#968d7f",
    accent: "#b4383a",
    chrome: "rgba(251, 248, 241, 0.94)",
    chromeText: "#2b2723",
    border: "rgba(60, 50, 40, 0.14)",
    gutter: "rgba(80, 60, 30, 0.16)",
    shadow: "0 18px 40px -18px rgba(60, 45, 25, 0.45)",
  },
  sepia: {
    desk: "radial-gradient(ellipse at 50% 35%, #e0d3b8 0%, #bfae8c 100%)",
    page: "#f4e9d1",
    text: "#3c3024",
    muted: "#9a876b",
    accent: "#a5402c",
    chrome: "rgba(244, 233, 209, 0.95)",
    chromeText: "#3c3024",
    border: "rgba(70, 50, 25, 0.16)",
    gutter: "rgba(90, 60, 20, 0.2)",
    shadow: "0 18px 40px -18px rgba(70, 45, 15, 0.5)",
  },
  night: {
    desk: "radial-gradient(ellipse at 50% 35%, #1d1d21 0%, #09090b 100%)",
    page: "#1c1b1f",
    text: "#d8d2c5",
    muted: "#7b766c",
    accent: "#e07a5f",
    chrome: "rgba(28, 27, 31, 0.95)",
    chromeText: "#e4dfd4",
    border: "rgba(255, 255, 255, 0.1)",
    gutter: "rgba(0, 0, 0, 0.55)",
    shadow: "0 18px 40px -16px rgba(0, 0, 0, 0.8)",
  },
  eink: {
    desk: "#ffffff",
    page: "#ffffff",
    text: "#000000",
    muted: "#444444",
    accent: "#000000",
    chrome: "#ffffff",
    chromeText: "#000000",
    border: "#000000",
    gutter: "transparent",
    shadow: "none",
  },
}

export const THEME_LABELS: Record<ReaderTheme, string> = {
  paper: "白",
  sepia: "生成り",
  night: "夜",
  eink: "電子ペーパー",
}

/** 本文の組版（.rb-flow の中だけに効く） */
export const BOOK_READER_CSS = `
.rb-flow {
  font-family: var(--rb-font);
  font-size: var(--rb-size);
  line-height: var(--rb-lh);
  color: var(--rb-text);
  text-align: justify;
  text-justify: inter-character;
  line-break: strict;
  word-break: normal;
  overflow-wrap: anywhere;
  hanging-punctuation: allow-end;
  font-kerning: normal;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  orphans: 1;
  widows: 1;
  column-fill: auto;
}
.rb-flow > * { margin: 0; }
.rb-flow p { margin: 0; }
.rb-flow .rb-blank { display: block; block-size: calc(var(--rb-lh) * 1em); overflow: hidden; }
.rb-compact .rb-flow .rb-blank { block-size: calc(var(--rb-lh) * 0.42em); }
.rb-flow h1, .rb-flow h2, .rb-flow h3, .rb-flow h4 {
  font-weight: 700;
  line-height: 1.5;
  margin-block: 1.4em 0.8em;
  break-after: avoid;
  font-feature-settings: "palt";
  letter-spacing: 0.04em;
}
.rb-flow h1 { font-size: 1.45em; }
.rb-flow h2 { font-size: 1.28em; }
.rb-flow h3, .rb-flow h4 { font-size: 1.12em; }
.rb-flow > :first-child { margin-block-start: 0; }
.rb-flow strong, .rb-flow b { font-weight: 700; }
.rb-flow em { font-style: normal; font-weight: 700; }
.rb-flow em.rb-dots {
  font-weight: inherit;
  -webkit-text-emphasis: filled sesame;
  text-emphasis: filled sesame;
}
.rb-flow ruby rt { font-size: 0.5em; letter-spacing: 0; font-feature-settings: normal; }
.rb-flow a { color: inherit; text-decoration: underline; text-underline-offset: 0.2em; }
.rb-flow ul, .rb-flow ol { padding-inline-start: 1.6em; margin-block: 0.6em; }
.rb-flow ul { list-style: disc; }
.rb-flow ol { list-style: decimal; }
.rb-flow li { margin-block: 0.2em; }
.rb-flow blockquote {
  margin-block: 0.8em;
  padding-inline-start: 1em;
  border-inline-start: 3px solid var(--rb-border);
  color: var(--rb-muted);
}
.rb-flow pre {
  margin-block: 0.8em;
  padding: 0.8em 1em;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.12);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.82em;
  line-height: 1.6;
  white-space: pre-wrap;
  break-inside: avoid;
}
.rb-flow code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.88em; }
.rb-flow hr {
  border: none;
  margin-block: 1.2em;
  text-align: center;
  color: var(--rb-muted);
  overflow: visible;
  block-size: 1.5em;
}
.rb-flow hr::after { content: "＊　　＊　　＊"; letter-spacing: 0.1em; }
.rb-flow img {
  display: block;
  max-inline-size: 100%;
  max-block-size: calc(var(--rb-page-block) - 1.5em);
  inline-size: auto;
  block-size: auto;
  margin: 0.8em auto;
  object-fit: contain;
  break-inside: avoid;
  border-radius: 3px;
}
/* 挿絵はページの 6 割まで（ページ全体の大きさだと前の文章と同じページに入らず、手前のページが空く。タップで拡大できる） */
.rb-horizontal .rb-flow img { max-height: calc(var(--rb-text-h) * 0.6); max-width: 100%; cursor: zoom-in; }
.rb-vertical .rb-flow img { max-width: calc(var(--rb-text-w) * 0.6); max-height: calc(var(--rb-col-h) - 1em); cursor: zoom-in; }
.rb-vertical .rb-flow { text-orientation: mixed; }
.rb-vertical .rb-flow .rb-tcy {
  -webkit-text-combine: horizontal;
  text-combine-upright: all;
}
.rb-vertical .rb-flow pre { writing-mode: horizontal-tb; max-block-size: 100%; overflow: hidden; }
.rb-eink * { transition: none !important; animation: none !important; }
@keyframes rb-turn-forward {
  from { opacity: 0.25; transform: translateX(calc(var(--rb-turn-dir) * 2.5%)); }
  to { opacity: 1; transform: none; }
}
@keyframes rb-turn-backward {
  from { opacity: 0.25; transform: translateX(calc(var(--rb-turn-dir) * -2.5%)); }
  to { opacity: 1; transform: none; }
}
@keyframes rb-sheen {
  from { opacity: 0.55; transform: translateX(calc(var(--rb-turn-dir) * 40%)); }
  to { opacity: 0; transform: translateX(calc(var(--rb-turn-dir) * -40%)); }
}
.rb-turn-forward { animation: rb-turn-forward 280ms cubic-bezier(0.2, 0.7, 0.2, 1); }
.rb-turn-backward { animation: rb-turn-backward 280ms cubic-bezier(0.2, 0.7, 0.2, 1); }
.rb-sheen {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
  animation: rb-sheen 420ms ease-out forwards;
}
@keyframes rb-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.rb-fade-in { animation: rb-fade-in 180ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .rb-turn-forward, .rb-turn-backward, .rb-sheen, .rb-fade-in { animation: none; }
}
.rb-range { -webkit-appearance: none; appearance: none; background: transparent; height: 24px; }
.rb-range::-webkit-slider-runnable-track { height: 3px; border-radius: 3px; background: var(--rb-border); }
.rb-range::-moz-range-track { height: 3px; border-radius: 3px; background: var(--rb-border); }
.rb-range::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 16px; height: 16px; margin-top: -6.5px; border-radius: 50%;
  background: var(--rb-accent); border: 2px solid var(--rb-page);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.rb-range::-moz-range-thumb {
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--rb-accent); border: 2px solid var(--rb-page);
}
`
