import type { MicroCmsApiRelease } from "~/types/micro-cms-release-response"
import { getReleasePublishedAtMs } from "~/utils/micro-cms-release"

/**
 * スマホのトップのお知らせ（開催イベント・サイトのお知らせ）を閉じた記録。
 * 枠ごとに、閉じたときに出ていた中身の鍵（ID と日付）を覚え、鍵がすべて記録にあれば次から出さない。
 * 新しいイベント・お知らせが来ると記録に無い鍵が混ざるので、また出る
 */
export const HOME_NOTICE_STORAGE_KEY = "aipictors:home-notice-dismissed:v1"

/** <html> に付ける属性。値は閉じている枠の名前を空白区切りで（CSS で最初の描画から隠す） */
export const HOME_NOTICE_HIDDEN_ATTRIBUTE = "data-home-notice-hidden"

export type HomeNoticeCard = "events" | "releases"

export type HomeNoticeKeys = Partial<Record<HomeNoticeCard, string[]>>

type DismissedRecord = Partial<Record<HomeNoticeCard, string[]>>

/** 中身が無い枠（「表示できる〜はありません」）も閉じられるようにする鍵 */
const EMPTY_KEY = "none"

/** 大事なお知らせは出してから 48 時間は閉じられない（重要なお知らせの帯と同じ長さ） */
const PINNED_RELEASE_WINDOW_MS = 48 * 60 * 60 * 1000

export const toEventNoticeKeys = (
  events: { id: string; startAt: number; endAt: number }[],
) =>
  events.length === 0
    ? [EMPTY_KEY]
    : events.map((event) => `${event.id}@${event.startAt}-${event.endAt}`)

export const toReleaseNoticeKeys = (
  releases: Pick<MicroCmsApiRelease, "id" | "createdAt" | "publishedAt">[],
) =>
  releases.length === 0
    ? [EMPTY_KEY]
    : releases.map(
        (release) =>
          `${release.id}@${getReleasePublishedAtMs(release) ?? release.createdAt}`,
      )

/**
 * 閉じられないお知らせ（大事なもの）。出してから 48 時間以内の、重要の印（is_important）が付いたもの
 * またはメンテナンスのお知らせ（重要なお知らせの帯と同じ長さ。古い重要のお知らせで枠がずっと閉じられなくならないように）
 */
export const isPinnedRelease = (
  release: Pick<
    MicroCmsApiRelease,
    "createdAt" | "publishedAt" | "is_important" | "tag"
  >,
  now = Date.now(),
) => {
  if (!release.is_important && release.tag !== "メンテナンス") return false
  const publishedAtMs = getReleasePublishedAtMs(release)
  if (publishedAtMs === null) return false
  return (
    now - publishedAtMs >= 0 && now - publishedAtMs <= PINNED_RELEASE_WINDOW_MS
  )
}

export const parseDismissedRecord = (
  value: string | null | undefined,
): DismissedRecord => {
  if (!value) return {}
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== "object" || parsed === null) return {}
    const record: DismissedRecord = {}
    for (const card of ["events", "releases"] as const) {
      const keys = (parsed as Record<string, unknown>)[card]
      if (Array.isArray(keys)) {
        record[card] = keys.filter((key) => typeof key === "string")
      }
    }
    return record
  } catch {
    return {}
  }
}

/** 今の中身がすべて閉じた記録にある枠 */
export const getHiddenNoticeCards = (
  keys: HomeNoticeKeys,
  record: DismissedRecord,
): HomeNoticeCard[] => {
  const hidden: HomeNoticeCard[] = []
  for (const card of ["events", "releases"] as const) {
    const current = keys[card]
    const dismissed = record[card]
    if (!current || current.length === 0 || !dismissed) continue
    if (current.every((key) => dismissed.includes(key))) hidden.push(card)
  }
  return hidden
}

/** 枠を閉じたときの記録。今の中身の鍵だけを残す（古い鍵はたまらない） */
export const dismissNoticeCard = (
  record: DismissedRecord,
  card: HomeNoticeCard,
  keys: string[],
): DismissedRecord => ({ ...record, [card]: [...keys] })

const readRecord = () => {
  try {
    return parseDismissedRecord(localStorage.getItem(HOME_NOTICE_STORAGE_KEY))
  } catch {
    return {}
  }
}

/** <html> の属性を今の記録に合わせる（クライアントでの画面の切り替え・閉じたとき） */
export const applyHiddenNoticeCards = (keys: HomeNoticeKeys) => {
  const hidden = getHiddenNoticeCards(keys, readRecord())
  if (hidden.length > 0) {
    document.documentElement.setAttribute(
      HOME_NOTICE_HIDDEN_ATTRIBUTE,
      hidden.join(" "),
    )
  } else {
    document.documentElement.removeAttribute(HOME_NOTICE_HIDDEN_ATTRIBUTE)
  }
}

export const saveDismissedNoticeCard = (
  keys: HomeNoticeKeys,
  card: HomeNoticeCard,
) => {
  const current = keys[card]
  if (!current) return
  try {
    localStorage.setItem(
      HOME_NOTICE_STORAGE_KEY,
      JSON.stringify(dismissNoticeCard(readRecord(), card, current)),
    )
  } catch {
    // 保存できない（プライベートモードなど）ときは、今の画面で隠すだけにする
  }
  const hidden = new Set(getHiddenNoticeCards(keys, readRecord()))
  hidden.add(card)
  document.documentElement.setAttribute(
    HOME_NOTICE_HIDDEN_ATTRIBUTE,
    [...hidden].join(" "),
  )
}

/**
 * サーバーで描いた HTML の中で、お知らせの枠より前に置く小さいスクリプト。
 * 閉じた記録があれば最初の描画の前に <html> へ属性を付け、CSS で隠す（読み込み後に消えて下の作品がずれるのを防ぐ）
 */
export const buildHomeNoticeInlineScript = (keys: HomeNoticeKeys) => {
  // </script> で途切れないよう < を逃がす
  const json = JSON.stringify(keys).replace(/</g, "\\u003c")
  return `(function(){try{var c=${json};var s=JSON.parse(localStorage.getItem(${JSON.stringify(HOME_NOTICE_STORAGE_KEY)})||"{}")||{};var h=[];for(var n in c){var k=c[n],d=s[n];if(k&&k.length&&Array.isArray(d)&&k.every(function(x){return d.indexOf(x)>=0}))h.push(n)}if(h.length)document.documentElement.setAttribute(${JSON.stringify(HOME_NOTICE_HIDDEN_ATTRIBUTE)},h.join(" "))}catch(e){}})()`
}
