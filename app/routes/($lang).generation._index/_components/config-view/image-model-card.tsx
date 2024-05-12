import { Badge } from "@/_components/ui/badge"

type Props = {
  displayName: string | null
  description?: string | null
  type?: string | null
  thumbnailImageURL: string | null
  isActive: boolean
  onSelect(): void
}

export const ImageModelCard = (props: Props) => {
  /**
   * v2などのバージョン情報は残した状態でモデル名のアンダーバー以降の詳細文字列を削除する
   * @param input
   * @returns
   */
  const trimString = (input: string) => {
    if (input === "blue_pencil-v10") {
      return "blue_pencil"
    }
    if (input === "lametta_v1745_fp16") {
      return "lametta"
    }
    if (input === "bluePencil_ex") {
      return "bluePencil_ex"
    }
    if (input === "animaPencilXL_v310") {
      return "animaPencilXL_v3.1"
    }

    const suffix = input.match(/_v\d+.*$/)?.[0]

    const underscoreIndex = input.indexOf("_")

    if (underscoreIndex !== -1) {
      return (
        input.substring(0, underscoreIndex) +
        (suffix !== undefined ? suffix : "")
      )
    }

    return input
  }

  const classes = `flex relative cursor-pointer flex-col rounded-md border border-neutral-1100 bg-neutral-1100 transition-all hover:bg-gray-200 dark:hover:bg-gray-600 ${
    props.isActive ? "border-2 border-blue-500" : ""
  }`

  return (
    <div className={classes} onClick={props.onSelect} onKeyUp={() => {}}>
      <img
        className={
          "relative w-full rounded-lg border-2 bg-center bg-cover focus:outline-none"
        }
        src={props.thumbnailImageURL ?? ""}
        alt={props.displayName ?? ""}
        style={{ transformOrigin: "center" }}
      />
      <div className="">
        <span className="whitespace-pre-wrap break-words font-bold text-sm">
          {trimString(props.displayName ?? "")}
        </span>
        {props.type && (
          <div className="absolute top-0 left-0">
            <Badge>{props.type}</Badge>
          </div>
        )}
        {props.description && (
          <span className="whitespace-pre-wrap break-words text-sm">
            {props.description}
          </span>
        )}
      </div>
    </div>
  )
}
