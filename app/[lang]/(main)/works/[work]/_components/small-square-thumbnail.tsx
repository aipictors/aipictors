type Props = {
  work: any
  isFocus?: boolean
}

/**
 *
 * @param props
 * @returns JSX.Element
 * @todo 正方形の中に表示する部分の調整が未対応。横長作品はtranslateX、縦長作品はtranslateYを使って調整する。おそらく"thumnailPos"というカラムに調整値の情報がある。
 * @todo [Q][E]キーでの移動は未実装
 * @todo ホバー時のアニメーション未実装
 */
export const SmallSquareThumbnail = (props: Props) => {
  if (props.work === null) {
    return <div className="w-20 h-20 mr-2"></div>
  }

  return (
    <div
      className={
        props.isFocus
          ? "w-20 h-20 mr-2 overflow-hidden rounded-lg border-2 border-solid border-indigo-600 opacity-75"
          : "w-20 h-20 mr-2 overflow-hidden rounded-lg"
      }
    >
      <img
        className="w-20 h-20 mr-2 object-cover"
        src={
          props.work.smallThumbnailImageURL
            ? props.work.smallThumbnailImageURL
            : props.work.imageURL
        }
      />
    </div>
  )
}
