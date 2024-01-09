import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type Props = {
  workImageURL?: string
  subWorkImageURLs: string[]
}

export const WorkImageView = ({ workImageURL, subWorkImageURLs }: Props) => {
  // 全ての画像URLを1つの配列に
  const allImageURLs = workImageURL
    ? [workImageURL, ...subWorkImageURLs]
    : subWorkImageURLs

  // カルーセルを表示する条件
  const shouldRenderCarousel = allImageURLs.length > 1

  // カルーセルのレンダリング
  if (shouldRenderCarousel) {
    return (
      <Carousel>
        <CarouselContent>
          {allImageURLs.map((imageURL, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <CarouselItem key={index}>
              <img className="w-auto h-auto rounded" alt="" src={imageURL} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    )
  }

  // 単一画像のレンダリング
  if (workImageURL) {
    return (
      <img
        className="w-full h-auto object-cover rounded"
        alt=""
        src={workImageURL}
      />
    )
  }

  // 画像がない場合は何も表示しない
  return null
}
