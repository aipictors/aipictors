import { usePathname } from "next/navigation"

export const useLocale = () => {
  const pathname = usePathname()

  if (pathname.startsWith("/en")) {
    return "en"
  }

  return "ja"
}
