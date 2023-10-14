import { type NextRequest, NextResponse } from "next/server"

export const middleware = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname

  const extensions = [
    ".css",
    ".ico",
    ".jpg",
    ".js",
    ".json",
    ".png",
    ".svg",
    ".svg",
  ]

  for (const path of extensions) {
    if (pathname.endsWith(path)) return
  }

  if (pathname.startsWith("_next")) return

  // サイトマップ
  if (pathname === "/sitemap.xml") {
    const pageURL =
      "https://subgraph-aipictors-6ouzjmdzha-an.a.run.app/sitemap.xml"
    return NextResponse.redirect(pageURL)
  }

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
