import { Link } from "@remix-run/react"

export const HeaderDevelopBanner = () => {
  return (
    <Link
      to={"https://www.aipictors.com"}
      className="fixed top-[72px] z-50 w-full bg-zinc-950 pt-1 pb-1 text-center font-bold text-white"
    >
      {
        "こちらは開発中のベータ版です。正常に動作しない可能性があります。現行のサイトはこちらをクリックしてください。"
      }
    </Link>
  )
}
