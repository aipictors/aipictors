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
        "Aipictorsの公式マスコットキャラクター「ぴくたーちゃん」の紹介ページです。プロフィール、無料で使える3Dモデル（VRM・FBX・glTF）、ミニゲーム、AI生成用プロンプト、LoRAモデルを公開しています。",
        "Introduction page for Pictor-chan, the official mascot character of Aipictors. Features her profile, a free 3D model (VRM, FBX, glTF), a mini game, AI generation prompts, and a LoRA model.",
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
