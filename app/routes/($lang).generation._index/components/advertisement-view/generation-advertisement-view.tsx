import { Link } from "react-router"

/**
 * 広告
 */
export function GenerationAdvertisementView() {
  return (
    <Link to="/plus" className="mb-4 block sm:hidden">
      <img
        className="mb-4 w-full rounded-md border"
        src="https://www.aipictors.com/wp-content/themes/AISite/images/banner/aipictors-plus-sp-banner.webp"
        alt="Aipictors+"
        width={40}
        height={40}
      />
    </Link>
  )
}
