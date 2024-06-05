import { HomeWorkDummy } from "@/routes/($lang)._main._index/_components/home-work-dummy"
import { PhotoAlbum } from "react-photo-album"

/**
 * ホームの作品ダミー一覧
 */
export function HomeWorkDummies() {
  const randomWidthList = [240, 196, 320]

  const photos = [
    {
      src: "",
      // ランダムな幅に決定
      width:
        randomWidthList[Math.floor(Math.random() * randomWidthList.length)],
      height: 196,
    },
    {
      src: "",
      width:
        randomWidthList[Math.floor(Math.random() * randomWidthList.length)],
      height: 196,
    },
    {
      src: "",
      width:
        randomWidthList[Math.floor(Math.random() * randomWidthList.length)],
      height: 196,
    },
    {
      src: "",
      width:
        randomWidthList[Math.floor(Math.random() * randomWidthList.length)],
      height: 196,
    },
  ]

  return (
    <>
      {/* CSS生成用 */}
      <div className="hidden h-[196px] w-[240px]" />
      <div className="hidden h-[196px] w-[196px]" />
      <div className="hidden h-[196px] w-[320px]" />
      {/* ダミー */}
      <PhotoAlbum
        layout="rows"
        columns={3}
        photos={photos}
        renderPhoto={(photoProps) => (
          <>
            <HomeWorkDummy
              {...photoProps}
              width={photoProps.photo.width}
              height={photoProps.photo.height}
            />
          </>
        )}
        defaultContainerWidth={800}
        sizes={{
          size: "calc(100vw - 640px)",
          sizes: [{ viewport: "(max-width: 960px)", size: "80vw" }],
        }}
      />
    </>
  )
}
