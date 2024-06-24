import { Link } from "@remix-run/react"

/**
 * 推薦バナー
 */
export const RecommendedBanner = () => {
  return (
    <>
      <Link to="/plus">
        <div className="relative mt-8 mb-8 h-32 w-full cursor-pointer overflow-hidden rounded-md border-2 transition-all hover:opacity-80">
          <img
            className="absolute right-2 bottom-[-8rem] h-72"
            alt="pictor-chan"
            src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/pictor-chan-left.png"
          />
          <p className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 font-semibold text-xl md:text-2xl">
            STANDARDプラン以上で好きな作品を推薦して多くの人にシェアできます！
          </p>
        </div>
      </Link>
    </>
  )
}
