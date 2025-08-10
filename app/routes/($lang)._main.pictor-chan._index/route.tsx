import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"
import { PictorChanProfile } from "./components/pictor-chan-profile"

export const meta: MetaFunction = (props) => {
  const t = useTranslation()
  return createMeta(
    {
      title: t(
        "ぴくたーちゃん - Aipictorsマスコットキャラクター",
        "Pictor-chan - Aipictors Mascot Character",
      ),
      description: t(
        "Aipictorsの公式マスコットキャラクター「ぴくたーちゃん」の紹介ページです。プロフィール、AI生成用プロンプト、LoRAモデルの配布を行っています。",
        "Introduction page for Pictor-chan, the official mascot character of Aipictors. Features profile, AI generation prompts, and LoRA model distribution.",
      ),
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneWeek,
})

/**
 * ぴくたーちゃん紹介ページ
 */
export default function PictorChan() {
  return <PictorChanProfile />
}
