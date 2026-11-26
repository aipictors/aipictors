import { expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { matchesHelpSearch, toHelpSearchTokens } from "./help-search"
import {
  HELP_GROUPS,
  HELP_SECTIONS,
  LEGACY_TAB_TO_SECTION,
  TOP_HELP_FAQS,
} from "./help-sections"

const PUBLIC_DIR = join(import.meta.dir, "../../../../public")

test("章の id は重ならず、どの章もいずれかの区分に入る", () => {
  const ids = HELP_SECTIONS.map((section) => section.id)
  expect(new Set(ids).size).toBe(ids.length)
  const groups = new Set(HELP_GROUPS.map((group) => group.id))
  for (const section of HELP_SECTIONS) {
    expect(groups.has(section.group)).toBe(true)
  }
})

test("4 コマの絵がすべて public/images/help-manga にある", () => {
  const images = [
    "hero",
    ...HELP_SECTIONS.flatMap((s) => s.panels.map((p) => p.image)),
  ]
  for (const image of images) {
    expect(
      existsSync(join(PUBLIC_DIR, "images/help-manga", `${image}.webp`)),
    ).toBe(true)
  }
  expect(existsSync(join(PUBLIC_DIR, "images/help-manga/og.jpg"))).toBe(true)
})

test("英語の文に日本語が混ざらず、円の金額にはドルの目安が付く", () => {
  const texts = HELP_SECTIONS.flatMap((s) => [
    s.title,
    s.summary,
    s.lead,
    s.mangaTitle,
    ...s.points,
    ...s.links.map((l) => l.label),
    ...s.faqs.flatMap((f) => [f.q, f.a]),
    ...s.panels.flatMap((p) => [p.caption, ...p.bubbles]),
  ])
  for (const text of texts) {
    expect(text.en).not.toMatch(/[\p{Script=Hiragana}\p{Script=Katakana}]/u)
    if (text.en.includes("¥")) {
      expect(text.en).toContain("$")
    }
  }
})

test("以前のタブの URL はすべて今の章かよくある質問のページに対応する", () => {
  const ids = new Set([...HELP_SECTIONS.map((section) => section.id), "faq"])
  for (const id of Object.values(LEGACY_TAB_TO_SECTION)) {
    expect(ids.has(id)).toBe(true)
  }
  // 以前のタブの名前と、今の章の id のどちらからも行ける
  expect(LEGACY_TAB_TO_SECTION.coins).toBe("coins")
  expect(LEGACY_TAB_TO_SECTION.overview).toBe("quickstart")
  for (const section of HELP_SECTIONS) {
    expect(LEGACY_TAB_TO_SECTION[section.id]).toBe(section.id)
  }
})

test("章の id は faq・withdrawal（別のページ）と重ならない", () => {
  for (const section of HELP_SECTIONS) {
    expect(["faq", "withdrawal"]).not.toContain(section.id)
  }
})

test("入口のよくある質問は 8〜10 件で、順番が重ならない", () => {
  expect(TOP_HELP_FAQS.length).toBeGreaterThanOrEqual(8)
  expect(TOP_HELP_FAQS.length).toBeLessThanOrEqual(10)
  const tops = TOP_HELP_FAQS.map((faq) => faq.top)
  expect(new Set(tops).size).toBe(tops.length)
})

test("ヘルプ内の検索はカタカナ・ひらがな、全角・半角、大文字・小文字を区別しない", () => {
  expect(
    matchesHelpSearch(toHelpSearchTokens("こいん"), ["コインの期限"]),
  ).toBe(true)
  expect(matchesHelpSearch(toHelpSearchTokens("Ｒ１８"), ["r18"])).toBe(true)
  expect(matchesHelpSearch(toHelpSearchTokens("ｒ１８"), ["R18 の作品"])).toBe(
    true,
  )
  expect(
    matchesHelpSearch(toHelpSearchTokens("コイン 期限"), ["コインの期限"]),
  ).toBe(true)
  expect(
    matchesHelpSearch(toHelpSearchTokens("コイン 解約"), ["コインの期限"]),
  ).toBe(false)
  expect(matchesHelpSearch(toHelpSearchTokens("  "), ["なんでも"])).toBe(true)
})
