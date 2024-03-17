import Image from "next/image"
import Link from "next/link"

/**
 * 広告
 * @returns
 */
export function GenerationAdvertisementView() {
  return (
    <Link href="/plus" className="mb-4 block sm:hidden">
      <Image
        className="mb-4 w-full rounded-md border"
        src="https://www.aipictors.com/wp-content/themes/AISite/images/banner/aipictors-plus-sp-banner.webp"
        alt="Aipictors+"
        width={40}
        height={40}
      />
    </Link>
  )
}
