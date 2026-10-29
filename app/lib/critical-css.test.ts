import { __test__, inlineCriticalCss } from "./critical-css"

const { parseCss, serialize, collectClasses, requiredClasses } = __test__

const CSS = [
  "@layer theme,base,components,utilities;",
  "@layer base{*,:before{box-sizing:border-box}html{line-height:1.5}}",
  "@layer utilities{.flex{display:flex}.hidden{display:none}",
  ".md\\:grid{display:grid}",
  "@media (min-width:48rem){.md\\:flex{display:flex}.md\\:block{display:block}}",
  ".dark\\:bg-black:where([data-theme^=dark],[data-theme^=dark] *){background:#000}",
  ".group:hover .group-hover\\:underline{text-decoration:underline}",
  ".\\32xl\\:p-4{padding:1rem}",
  '.content-\\[\\"a\\{b\\"\\]{content:"a{b"}}',
  "@keyframes spin{to{transform:rotate(360deg)}}",
  "@property --tw-x{syntax:\"*\";inherits:false}",
].join("")

test("HTML にあるクラスのルールと、クラスを含まないルールだけを残す", () => {
  const html =
    '<div class="flex md:flex dark:bg-black"><a class="group"><span class="group-hover:underline 2xl:p-4">x</span></a></div>'
  const out = serialize(parseCss(CSS), collectClasses(html))
  expect(out).toContain("@layer theme,base,components,utilities;")
  expect(out).toContain("html{line-height:1.5}")
  expect(out).toContain(".flex{display:flex}")
  expect(out).toContain("@media (min-width:48rem){.md\\:flex{display:flex}}")
  expect(out).toContain(".dark\\:bg-black")
  expect(out).toContain(".group-hover\\:underline")
  expect(out).toContain(".\\32xl\\:p-4")
  expect(out).toContain("@keyframes spin")
  expect(out).toContain("@property --tw-x")
  expect(out).not.toContain(".hidden")
  expect(out).not.toContain(".md\\:grid")
  expect(out).not.toContain(".md\\:block")
  expect(out).not.toContain("content-")
})

test("全部のクラスがあれば元の CSS に戻る", () => {
  const all = { has: () => true } as unknown as Set<string>
  expect(serialize(parseCss(CSS), all)).toBe(CSS)
})

test(":where() や属性セレクタの中のクラスは必須にしない", () => {
  expect(requiredClasses(".a:not(.b) .c[data-x='.d']")).toEqual(["a", "c"])
  expect(requiredClasses(".w-\\[calc\\(100\\%_-_2px\\)\\]")).toEqual([
    "w-[calc(100%_-_2px)]",
  ])
})

test("class 属性の実体参照を戻す", () => {
  const classes = collectClasses('<p class="[&amp;_svg]:size-4 a"></p>')
  expect(classes.has("[&_svg]:size-4")).toBe(true)
  expect(classes.has("a")).toBe(true)
})

test("<link> の順番で入れ、小さい CSS は全部入れる。入れた <link> は描画を止めない読み込みにする", async () => {
  const html = [
    '<html><head><style data-critical-css=""></style>',
    '<link rel="stylesheet" href="/assets/root-a.css"/>',
    '<link rel="stylesheet" href="/assets/tailwind-b.css"/>',
    '<link rel="stylesheet" href="/assets/big-c.css"/>',
    '<link rel="stylesheet" href="/assets/rows-d.css"/>',
    '</head><body><div class="flex"></div></body></html>',
  ].join("")
  const response = await inlineCriticalCss(
    new Response(html, { headers: { "Content-Type": "text/html" } }),
    {
      href: "/assets/tailwind-b.css",
      css: ".flex{display:flex}.hidden{display:none}",
      inline: { "/assets/root-a.css": "a{color:red}", "/assets/rows-d.css": "b{x:1}" },
    },
  )
  const out = await response.text()
  expect(out).toContain(
    '<style data-critical-css="">a{color:red}.flex{display:flex}</style>',
  )
  expect(out).toContain(
    `<link rel="stylesheet" href="/assets/root-a.css" media="print" onload="this.media='all'"/>`,
  )
  expect(out).toContain(
    `<link rel="stylesheet" href="/assets/tailwind-b.css" media="print" onload="this.media='all'"/>`,
  )
  // 入れられない CSS から後ろはそのまま（順番を変えない）
  expect(out).toContain('<link rel="stylesheet" href="/assets/big-c.css"/>')
  expect(out).toContain('<link rel="stylesheet" href="/assets/rows-d.css"/>')
})

test("ビルドが違うときは何もしない", async () => {
  const html =
    '<html><head><style data-critical-css=""></style><link rel="stylesheet" href="/assets/tailwind-x.css"/></head><body></body></html>'
  const response = await inlineCriticalCss(
    new Response(html, { headers: { "Content-Type": "text/html" } }),
    { href: "/assets/tailwind-y.css", css: "" },
  )
  expect(await response.text()).toBe(html)
})

test("優先画像を Link ヘッダーの preload にする", async () => {
  const html = [
    '<html><head><style data-critical-css=""></style></head><body>',
    '<picture class="contents"><source media="not all and (max-width: 767px)" srcSet="data:image/gif;base64,R0"/>',
    '<img src="https://files.aipictors.com/a" srcSet="https://files.aipictors.com/_w/160/a 160w, https://files.aipictors.com/_w/320/a 320w" sizes="160px" fetchPriority="high"/></picture>',
    '<img src="https://files.aipictors.com/b" loading="lazy"/>',
    "</body></html>",
  ].join("")
  const response = await inlineCriticalCss(
    new Response(html, { headers: { "Content-Type": "text/html" } }),
    { href: "/assets/tailwind-y.css", css: "" },
  )
  expect(response.headers.get("Link")).toBe(
    '<https://files.aipictors.com/a>; rel=preload; as=image; fetchpriority=high; imagesrcset="https://files.aipictors.com/_w/160/a 160w, https://files.aipictors.com/_w/320/a 320w"; imagesizes="160px"; media="(max-width: 767px)"',
  )
})
