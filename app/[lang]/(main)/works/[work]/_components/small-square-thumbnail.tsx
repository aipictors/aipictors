import Link from "next/link"

type Props = {
  work: any
  isFocus?: boolean
  linkToWork?: boolean
}

/**
 * @todo 画像の表示positionの調整が未実装。クエリからpositionを取得できるようになったら実装する。
 */
export const SmallSquareThumbnail = (props: Props) => {
  if (props.work === null) {
    return <div className="w-20 h-20 mr-2"></div>
  }

  const image = (
    <img
      className="w-20 h-20 object-cover"
      src={
        props.work.smallThumbnailImageURL
          ? props.work.smallThumbnailImageURL
          : props.work.imageURL
      }
    />
    // <Image
    //   className="w-20 h-20 object-cover"
    //   src={
    //     props.work.smallThumbnailImageURL
    //       ? props.work.smallThumbnailImageURL
    //       : props.work.imageURL
    //   }
    //   width={props.work.smallThumbnailImageWidth}
    //   height={props.work.smallThumbnailImageHeight}
    // />
  )

  return (
    <div
      className={
        props.isFocus
          ? "w-20 h-20 mr-2 overflow-hidden rounded-lg border-2 border-solid border-primary opacity-75"
          : "w-20 h-20 mr-2 overflow-hidden rounded-lg hover:opacity-75 transition-all"
      }
      style={{}}
    >
      {props.linkToWork ? (
        <Link href={props.isFocus ? "" : `/works/${props.work.id}`}>
          {image}
        </Link>
      ) : (
        <>{image}</>
      )}
    </div>
  )
}
