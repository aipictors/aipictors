import { describe, expect, test } from "bun:test"
import {
  isAdultAlbum,
  toAlbumCoverUrl,
  toAlbumJsonLd,
  toAlbumMetaText,
  toAlbumPageIndex,
  toAlbumShareImageUrl,
  toAlbumWorkOrder,
  toAlbumWorkSort,
} from "../album-page-utils"

const album = {
  title: "猫の毎日",
  description: "猫のシリーズです",
  slug: "cats",
  rating: "G",
  isSensitive: false,
  worksCount: 12,
  thumbnailImageURL: "https://files.aipictors.com/cover",
  createdAt: 1700000000,
  user: { login: "neko", name: "ねこ" },
  firstWorks: [
    {
      rating: "G",
      largeThumbnailImageURL: "https://files.aipictors.com/first",
      smallThumbnailImageURL: "https://files.aipictors.com/first-small",
    },
  ],
}

describe("URL のパラメータ", () => {
  test("ページは 1 始まりから 0 始まりにする", () => {
    expect(toAlbumPageIndex(null)).toBe(0)
    expect(toAlbumPageIndex("1")).toBe(0)
    expect(toAlbumPageIndex("3")).toBe(2)
  })

  test("不正なページや大きすぎるページは最初のページにする", () => {
    expect(toAlbumPageIndex("abc")).toBe(0)
    expect(toAlbumPageIndex("-1")).toBe(0)
    expect(toAlbumPageIndex("101")).toBe(0)
  })

  test("不明な並び順はシリーズの順にする", () => {
    expect(toAlbumWorkOrder("LIKES_COUNT")).toBe("LIKES_COUNT")
    expect(toAlbumWorkOrder("x")).toBe("MANUAL")
    expect(toAlbumWorkSort("ASC")).toBe("ASC")
    expect(toAlbumWorkSort(null)).toBe("DESC")
  })
})

describe("表紙と共有の画像", () => {
  test("全年齢のシリーズは表紙を OGP に出す", () => {
    expect(toAlbumShareImageUrl(album)).toBe(album.thumbnailImageURL)
  })

  test("表紙がなければ全年齢の 1 作目を使う", () => {
    expect(toAlbumShareImageUrl({ ...album, thumbnailImageURL: null })).toBe(
      "https://files.aipictors.com/first",
    )
  })

  test("R18 や R15 のシリーズは OGP に画像を出さない", () => {
    expect(
      toAlbumShareImageUrl({ ...album, rating: "R18", isSensitive: true }),
    ).toBeNull()
    expect(toAlbumShareImageUrl({ ...album, rating: "R15" })).toBeNull()
  })

  test("全年齢のシリーズでも 1 作目が全年齢でなければ OGP に使わない", () => {
    expect(
      toAlbumShareImageUrl({
        ...album,
        thumbnailImageURL: null,
        firstWorks: [{ ...album.firstWorks[0], rating: "R15" }],
      }),
    ).toBeNull()
  })

  test("全年齢のシリーズでは R18 の作品を表紙にしない", () => {
    const firstWorks = [{ ...album.firstWorks[0], rating: "R18" }]
    expect(
      toAlbumCoverUrl({ ...album, thumbnailImageURL: null, firstWorks }),
    ).toBeNull()
    expect(
      toAlbumCoverUrl({
        ...album,
        thumbnailImageURL: null,
        rating: "R18",
        firstWorks,
      }),
    ).toBe("https://files.aipictors.com/first")
  })

  test("R18 の判定", () => {
    expect(isAdultAlbum(album)).toBe(false)
    expect(isAdultAlbum({ rating: "R18G", isSensitive: false })).toBe(true)
    expect(isAdultAlbum({ rating: "G", isSensitive: true })).toBe(true)
  })
})

describe("title と description", () => {
  test("シリーズ名・作者名・作品数が入る", () => {
    const text = toAlbumMetaText(album, 0)
    expect(text.title).toBe("猫の毎日（全12作品） - ねこのシリーズ")
    expect(text.description).toBe(
      "ねこさんのシリーズ「猫の毎日」全12作品。猫のシリーズです",
    )
    expect(text.enTitle).toBe("猫の毎日 (12 works) by ねこ")
  })

  test("2 ページ目以降はページ番号を入れる", () => {
    expect(toAlbumMetaText(album, 1).title).toContain("（2ページ目）")
  })

  test("説明や作品がないときも文章が崩れない", () => {
    const text = toAlbumMetaText(
      { ...album, description: "", worksCount: 0 },
      0,
    )
    expect(text.title).toBe("猫の毎日 - ねこのシリーズ")
    expect(text.description).toBe(
      "ねこさんのシリーズ「猫の毎日」。AIイラストなどの作品を順番に見られます。",
    )
  })
})

describe("構造化データ", () => {
  const works = [
    {
      id: "1",
      title: "一",
      rating: "G",
      smallThumbnailImageURL: "https://a/1",
    },
    {
      id: "2",
      title: "二",
      rating: "R18",
      smallThumbnailImageURL: "https://a/2",
    },
  ]
  const build = (target = album, lang?: string) =>
    toAlbumJsonLd({
      album: target,
      works,
      siteUrl: "https://www.aipictors.com",
      lang,
      labels: { series: "シリーズ" },
    })

  test("CollectionPage と BreadcrumbList を返す", () => {
    const [page, breadcrumb] = build()
    expect(page["@type"]).toBe("CollectionPage")
    expect(page.url).toBe("https://www.aipictors.com/neko/albums/cats")
    expect(breadcrumb["@type"]).toBe("BreadcrumbList")
  })

  test("R18 の作品の画像を入れない", () => {
    const text = JSON.stringify(build()[0])
    expect(text).toContain("https://a/1")
    expect(text).not.toContain("https://a/2")
  })

  test("R18 のシリーズは画像を入れず、一覧の階層も R18 にする", () => {
    const target = { ...album, rating: "R18", isSensitive: true }
    const text = JSON.stringify(build(target))
    expect(text).not.toContain("files.aipictors.com")
    expect(text).not.toContain("https://a/1")
    expect(text).toContain("https://www.aipictors.com/r/albums")
    expect(text).toContain('"isFamilyFriendly":false')
  })

  test("英語のページは /en の URL にする", () => {
    expect(build(album, "en")[0].url).toBe(
      "https://www.aipictors.com/en/neko/albums/cats",
    )
  })
})
