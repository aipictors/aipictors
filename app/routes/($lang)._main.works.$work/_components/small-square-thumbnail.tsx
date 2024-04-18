import { Link } from "@remix-run/react"

type Props = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  work: any
  isFocus?: boolean
  linkToWork?: boolean
}

/**
 * @todo 画像の表示positionの調整が未実装。クエリからpositionを取得できるようになったら実装する。
 */
export const SmallSquareThumbnail = (props: Props) => {
  if (props.work === null) {
    return <div className="mr-2 h-20 w-20" />
  }

  const image = (
    // <img
    //   className="w-20 h-20 object-cover"
    //   src={
    //     props.work.smallThumbnailImageURL
    //       ? props.work.smallThumbnailImageURL
    //       : props.work.imageURL
    //   }
    //   alt=""
    // />
    <img
      className="h-20 w-20 object-cover"
      src={
        props.work.smallThumbnailImageURL
          ? props.work.smallThumbnailImageURL
          : props.work.imageURL
      }
      width={props.work.smallThumbnailImageWidth}
      height={props.work.smallThumbnailImageHeight}
      alt=""
    />
  )

  return (
    <div
      className={
        props.isFocus
          ? "mr-2 h-20 w-20 overflow-hidden rounded-lg border-2 border-primary border-solid opacity-75"
          : "mr-2 h-20 w-20 overflow-hidden rounded-lg transition-all hover:opacity-75"
      }
      style={{}}
    >
      {props.linkToWork ? (
        <Link to={props.isFocus ? "" : `/works/${props.work.id}`}>{image}</Link>
      ) : (
        <>{image}</>
      )}
    </div>
  )
}
