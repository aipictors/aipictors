import { expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { join } from "node:path"
import {
  HELP_GROUPS,
  HELP_SECTIONS,
  LEGACY_TAB_TO_SECTION,
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

test("以前のタブの URL はすべて今の章に対応する", () => {
  const ids = new Set(HELP_SECTIONS.map((section) => section.id))
  for (const id of Object.values(LEGACY_TAB_TO_SECTION)) {
    expect(ids.has(id)).toBe(true)
  }
})
