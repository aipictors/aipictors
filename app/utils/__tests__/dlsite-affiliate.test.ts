import { describe, expect, test } from "bun:test"
import {
  pickDlsiteSearchTags,
  toDlsiteAffiliateUrl,
  toDlsiteAiRankingUrl,
  toDlsiteAiSearchUrl,
  toDlsiteWorks,
  toDlsiteWorkUrl,
} from "~/utils/dlsite-affiliate"

describe("dlsite-affiliate", () => {
  test("リンク作成と同じ形でアフィリエイト ID を付ける", () => {
    expect(
      toDlsiteAffiliateUrl("https://www.dlsite.com/aix/fsr/=/keyword/test/"),
    ).toBe(
      "https://dlaf.jp/home/dlaf/=/aid/AIPICTORS/url/https%3A%2F%2Fwww.dlsite.com%2Faix%2Ffsr%2F%3D%2Fkeyword%2Ftest%2F",
    )
  })

  test("日本語のタグは二重にエンコードして検索に渡す", () => {
    const url = toDlsiteAiSearchUrl(" メイド ")
    const target = decodeURIComponent(url.split("/url/")[1])
    expect(target).toBe(
      "https://www.dlsite.com/aix/fsr/=/keyword/%E3%83%A1%E3%82%A4%E3%83%89/",
    )
  })

  test("ランキングは AI 生成の週間", () => {
    expect(decodeURIComponent(toDlsiteAiRankingUrl().split("/url/")[1])).toBe(
      "https://www.dlsite.com/aix/ranking/week",
    )
  })

  test("タグは空と重複を除いて最大 3 つ", () => {
    expect(
      pickDlsiteSearchTags(["メイド", " ", "メイド", "猫耳", "制服", "水着"]),
    ).toEqual(["メイド", "猫耳", "制服"])
  })

  test("成人向け・オリジナルなどの広いタグは使わない", () => {
    expect(
      pickDlsiteSearchTags(["成人向け", "オリジナル", "r18", "漫画"]),
    ).toEqual(["漫画"])
  })

  test("作品ページのリンクもアフィリエイト経由", () => {
    expect(
      decodeURIComponent(toDlsiteWorkUrl("RJ01730150").split("/url/")[1]),
    ).toBe("https://www.dlsite.com/aix/work/=/product_id/RJ01730150.html")
  })

  test("ランキング API の中身から表示用の項目だけ残す", () => {
    const works = toDlsiteWorks([
      {
        workno: "RJ01730150",
        work_name: "作品A",
        maker_name: "サークルA",
        ranking: 1,
        image_main: {
          resize_url:
            "resize/images2/work/doujin/RJ01731000/RJ01730150_img_main",
        },
      },
      { workno: "bad", work_name: "x", image_main: { resize_url: "a" } },
      { workno: "RJ1", work_name: "画像なし", image_main: null },
      {
        workno: "RJ2",
        work_name: "元画像",
        image_main: { url: "//img.dlsite.jp/a.jpg" },
      },
    ])
    expect(works).toEqual([
      {
        workno: "RJ01730150",
        name: "作品A",
        maker: "サークルA",
        rank: 1,
        imageUrl:
          "https://img.dlsite.jp/resize/images2/work/doujin/RJ01731000/RJ01730150_img_main_300x300.jpg",
      },
      {
        workno: "RJ2",
        name: "元画像",
        maker: "",
        rank: null,
        imageUrl: "https://img.dlsite.jp/a.jpg",
      },
    ])
    expect(toDlsiteWorks(null)).toEqual([])
  })
})
