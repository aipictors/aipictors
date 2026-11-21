import { expect, test } from "bun:test"
import { toProfileLinkServiceName } from "~/utils/profile-link-service"

test("支援・販売サイトはサービス名", () => {
  expect(
    toProfileLinkServiceName(
      "https://www.dmm.co.jp/dc/doujin/-/list/=/article=maker/id=1/",
    ),
  ).toBe("FANZA")
  expect(toProfileLinkServiceName("https://fantia.jp/fanclubs/1")).toBe(
    "Fantia",
  )
  expect(toProfileLinkServiceName("https://abc.fanbox.cc/")).toBe("FANBOX")
  expect(toProfileLinkServiceName("https://ci-en.dlsite.com/creator/1")).toBe(
    "Ci-en",
  )
  expect(
    toProfileLinkServiceName("https://www.dlsite.com/maniax/circle/x"),
  ).toBe("DLsite")
})

test("それ以外はドメイン（www は外す）", () => {
  expect(toProfileLinkServiceName("https://www.example.com/a")).toBe(
    "example.com",
  )
  // 似た名前の別ドメインはサービス名にしない
  expect(toProfileLinkServiceName("https://notfantia.jp/")).toBe("notfantia.jp")
  expect(toProfileLinkServiceName("not a url")).toBe("not a url")
})
