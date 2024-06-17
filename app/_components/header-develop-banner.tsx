import { Link } from "@remix-run/react"

export const HeaderDevelopBanner = () => {
  return (
    <Link
      to={"https://www.aipictors.com"}
      className="fixed top-[72px] z-50 h-8 w-full bg-zinc-950 text-center font-bold text-white"
    >
      {
        "こちらは開発中のベータ版です。現行のサイトはこちらをクリックしてください。"
      }
    </Link>
  )
}
