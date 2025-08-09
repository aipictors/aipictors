import { Button } from "~/components/ui/button"
import { Link } from "@remix-run/react"
import { SparklesIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  workId: string
  prompt?: string | null
  negativePrompt?: string | null
}

/**
 * 作品の生成ボタン
 * プロンプト情報がある作品の場合に表示され、生成ページにリダイレクトする
 */
export function WorkGenerationButton(props: Props) {
  const t = useTranslation()

  // プロンプト情報がない場合は表示しない
  if (!props.prompt) {
    return null
  }

  // 生成ページのURLを構築
  const generateUrl = () => {
    const params = new URLSearchParams()
    params.set("work", props.workId)

    if (props.prompt) {
      params.set("prompts", props.prompt)
    }

    if (props.negativePrompt) {
      params.set("negativeprompts", props.negativePrompt)
    }

    return `/generation?${params.toString()}`
  }

  return (
    <Link to={generateUrl()}>
      <Button
        className="space-x-2"
        size="sm"
        variant="secondary"
        aria-label={t(
          "この作品を参考に生成する",
          "Generate using this work as reference",
        )}
      >
        <SparklesIcon width={16} />
        <p>{t("参考生成", "Reference Generation")}</p>
      </Button>
    </Link>
  )
}
