import { type NextRequest, NextResponse } from "next/server"

export const middleware = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname

  // サイトマップ
  if (pathname === "/sitemap.xml") {
    const pageURL = "https://run.aipictors.com/sitemap.xml"
    return NextResponse.redirect(pageURL)
  }

  if (pathname.includes(".")) return

  if (pathname.startsWith("_")) return

  // パスに「ja」が含まれる場合はリダイレクトする
  if (pathname.startsWith("/ja")) {
    const pageURL = new URL(request.url.replace("/ja", ""))
    return NextResponse.redirect(pageURL)
  }

  // パスに「en」が含まれない場合は「ja」のパスで上書きする
  if (!pathname.startsWith("/en")) {
    const pageURL = new URL(`/ja${pathname}`, request.url)
    return NextResponse.rewrite(pageURL)
  }
}
