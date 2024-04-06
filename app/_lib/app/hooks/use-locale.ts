import { usePathname } from "next/navigation"

/**
 * 現在の言語を取得する
 * @returns
 */
export const useLocale = () => {
  const pathname = usePathname()

  if (pathname.startsWith("/en")) {
    return "en"
  }

  return "ja"
}
