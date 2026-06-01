import { Badge } from "~/components/ui/badge"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  displayName: string | null
  description?: string | null
  type?: string | null
  thumbnailImageURL: string | null
  isActive: boolean
  onSelect(): void
}

export function ImageModelCard(props: Props) {
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

  const t = useTranslation()
  const isNoQueueModel =
    props.type === "FLUX" ||
    props.type === "SD5" ||
    props.displayName?.toLowerCase().includes("gemini")
  const trimmedDisplayName = trimString(props.displayName ?? "")

  return (
    <div className={classes} onClick={props.onSelect} onKeyUp={() => {}}>
      <div className="relative">
        <img
          className={
            "relative w-full rounded-lg border-2 bg-center bg-cover focus:outline-hidden"
          }
          src={props.thumbnailImageURL ?? ""}
          alt={props.displayName ?? ""}
          style={{ transformOrigin: "center" }}
        />
        {props.type && (
          <div className="absolute top-2 left-2 right-12 z-10 flex flex-wrap gap-1">
            {props.type === "FLUX" && (
              <Badge variant={"destructive"}>{props.type}</Badge>
            )}
            {props.displayName === "flux.1 schnell" && (
              <Badge>{t("10枚分消費", "cost of 10")}</Badge>
            )}
            {props.displayName === "flux.1 schnell" && (
              <Badge>{t("超高速生成", "super fast generation")}</Badge>
            )}
            {props.displayName === "flux.1 pro" && (
              <Badge>{t("30枚分消費", "cost of 30")}</Badge>
            )}
            {props.displayName === "flux.1 pro" && (
              <Badge>{t("高速生成", "super fast generation")}</Badge>
            )}
            {props.displayName === "GeminiNanoBanana" && (
              <Badge>{t("5枚分消費", "cost of 5")}</Badge>
            )}
            {props.displayName === "GeminiNanoBanana2" && (
              <Badge>{t("8枚分消費", "cost of 8")}</Badge>
            )}
            {props.type !== "FLUX" && <Badge>{props.type}</Badge>}
          </div>
        )}
        <div className="absolute right-2 bottom-2 left-2 z-10 flex flex-wrap gap-1">
          {props.type === "FLUX" && (
            <Badge>{t("STANDARD以上", "super fast generation")}</Badge>
          )}
          {isNoQueueModel && (
            <Badge variant={"outline"}>{t("待ち人数なし", "No queue")}</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2">
        <p className="min-h-10 break-words font-bold text-sm leading-5">
          {trimmedDisplayName}
        </p>
        {isNoQueueModel && (
          <p className="text-muted-foreground text-xs">
            {t(
              "Gemini/Fluxは待ち人数なしで開始されます",
              "Gemini/Flux starts without queue wait",
            )}
          </p>
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
