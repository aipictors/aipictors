import { WorkNode } from "@/graphql/__generated__/graphql"

type Props = {
  work: WorkNode | null
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
    return (
      <div
        style={{
          width: "72px",
          height: "72px",
          marginRight: "8px",
          overflow: "hidden",
        }}
      ></div>
    )
  }

  return (
    <div
      style={{
        width: "72px",
        height: "72px",
        marginRight: "8px",
        overflow: "hidden",
        borderRadius: "8px",
        border: props.isFocus ? "solid" : "initial",
        borderColor: props.isFocus ? "#0090f0" : "initial",
      }}
    >
      <img
        src={
          props.work.smallThumbnailImageURL
            ? props.work.smallThumbnailImageURL
            : props.work.imageURL
        }
        style={{
          width: "72px",
          height: "72px",
          objectFit: "cover",
          opacity: props.isFocus ? "0.72" : "initial",
        }}
      />
    </div>
  )
}
