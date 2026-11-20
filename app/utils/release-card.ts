import type { MicroCmsApiRelease } from "~/types/micro-cms-release-response"
import {
  getReleasePublishedAtMs,
  isFeaturedReleaseTag,
} from "~/utils/micro-cms-release"
import { toJstDisplayDate } from "~/utils/to-jst-display-date"

/** 一覧のカードに出す分だけ（本文全体は HTML に入れない） */
export type ReleaseCard = {
  id: string
  title: string
  tag: string | null
  /** 投稿日（日本時間の YYYY.MM.DD） */
  dateText: string
  /** 表紙の画像。サムネイルがなければ本文の最初の画像 */
  coverUrl: string | null
  /** 本文の冒頭（Markdown・HTML を除いた文） */
  excerpt: string
  /** 投稿から 7 日以内 */
  isNew: boolean
}

const NEW_RELEASE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

const EXCERPT_LENGTH = 90

/**
 * 本文の最初の画像（Markdown の ![](url) か <img src>）
 * お知らせはサムネイルを入れずに本文の先頭に画像を置くものが多い
 */
export const findFirstReleaseImage = (description: string): string | null => {
  const markdown = description.match(/!\[[^\]]*\]\(\s*<?(https?:\/\/[^\s)>]+)/)
  const html = description.match(
    /<img\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/i,
  )
  const candidates = [markdown, html].filter(
    (match): match is RegExpMatchArray => match !== null,
  )
  if (candidates.length === 0) return null
  // 先に出てくるほう
  candidates.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  return candidates[0][1]
}

/**
 * 本文の冒頭を、一覧で読める文にする（画像・リンク・見出しの印・HTML を除く）
 * 決まり文句のあいさつは飛ばす
 */
export const toReleaseExcerpt = (description: string): string => {
  const text = description
    .replace(/<(video|iframe|script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/^\s{0,3}(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~`|]/g, "")
    .replace(/^-{3,}$/gm, " ")
    .replace(
      /いつも\s*Aipictors\s*をご利用いただき、?ありがとうございます。?/g,
      "",
    )
    .replace(/\s+/g, " ")
    .trim()
  return text.length > EXCERPT_LENGTH
    ? `${text.slice(0, EXCERPT_LENGTH)}…`
    : text
}

export const toReleaseDateText = (createdAt: number | string): string => {
  const date = toJstDisplayDate(createdAt)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}.${month}.${day}`
}

export const toReleaseCard = (
  release: MicroCmsApiRelease,
  now: number = Date.now(),
): ReleaseCard => {
  const publishedAt = getReleasePublishedAtMs(release)
  return {
    id: release.id,
    title: release.title,
    tag: release.tag ?? null,
    dateText: toReleaseDateText(release.createdAt),
    coverUrl:
      release.thumbnail_url?.url || findFirstReleaseImage(release.description),
    excerpt: toReleaseExcerpt(release.description),
    isNew:
      publishedAt !== null &&
      publishedAt <= now &&
      now - publishedAt < NEW_RELEASE_WINDOW_MS,
  }
}

/** タグの見た目の種類（表紙がないときの色に使う） */
export const toReleaseTone = (tag: string | null) =>
  isFeaturedReleaseTag(tag) ? tag : "お知らせ"
