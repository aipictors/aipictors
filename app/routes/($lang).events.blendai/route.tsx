import { Button } from "~/components/ui/button"
import { EventImage } from "~/routes/($lang).events.blendai/components/event-image"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { MousePointerClickIcon } from "lucide-react"
import { ImageGenerationReferenceCard } from "~/routes/($lang).events.blendai/components/image-generation-reference-card"
import { useTranslation } from "~/hooks/use-translation"
import { config } from "~/config"

export default function BlendAi() {
  const t = useTranslation()

  return (
    <div className="space-y-2 py-4">
      <div className="flex flex-col items-center md:flex-row">
        <div className="flex flex-grow-3">
          <EventImage
            alt={t("BlendAI×Aipictors企画", "BlendAI×Aipictors Project")}
            imageURL={
              "https://www.aipictors.com/wp-content/uploads/2024/03/blendai_aipictors.webp"
            }
          />
        </div>
        <div className="w-full flex-2 space-y-8 py-8 md:px-4">
          <div className="space-y-4">
            <h1 className={"font-bold text-4xl text-blue-300"}>
              {t("BlendAI×Aipictors企画", "BlendAI×Aipictors Project")}
            </h1>
          </div>
          <p className="leading-relaxed">
            {t(
              "デルタもん生成をして投稿・シェアしてみましょう！",
              "Let's create and share Deltamon!",
            )}
          </p>
          <Link
            to="https://blendai.jp/contents"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant={"outline"} className="m-4 font-bold text-lg">
              {t("デルタもんについて", "About Deltamon")}
              <MousePointerClickIcon className="ml-2" />
            </Button>
          </Link>
          <Link
            to="https://www.aipictors.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant={"outline"} className="m-4 font-bold text-lg">
              Aipictors
              <MousePointerClickIcon className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-2">
        <div className="text-sm">
          {t(
            "人とAIが互いに理解し合うことを目的に未来からやってきたデルタもん。",
            "Deltamon, who came from the future with the purpose of helping humans and AI understand each other.",
          )}
        </div>
        <div className="text-sm">
          {t(
            "デルタもんと創作活動を通じて、AI創作の楽しさのきっかけにしてみませんか？",
            "Why not start enjoying AI creation through creative activities with Deltamon?",
          )}
        </div>
        <Link
          className="text-sm"
          to="https://www.aipictors.com/events/blendai/"
        >
          {t(
            "イベント特設ページはこちら",
            "Click here for the special event page",
          )}
        </Link>
        <div className="m-4">
          <ImageGenerationReferenceCard
            title={t("デルタもんを生成してみる！", "Try generating Deltamon!")}
            prompts="1girl,deltamon_beta, solo, blue eyes, simple background, thighhighs, long sleeves, white background, dress, animal ears, shoulders, blue tail, earrings,pink boots, detached sleeves, green hair, sleeveless, cat ears, bag, white dress, white thighhighs, cat tail,pink backpack,yellow delta tie,pink randseru <lora:deltamon_v1:1>"
          >
            <img
              alt="デルタもん"
              src="https://www.aipictors.com/wp-content/uploads/2024/03/deltamon.K3cATy8R.webp"
            />
          </ImageGenerationReferenceCard>
        </div>
      </div>
    </div>
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMonth,
})

export const meta: MetaFunction = () => {
  return [
    { title: "BlendAI×Aipictors企画 - デルタもん生成企画" },
    { name: "description", content: "BlendAIとAipictorsの企画ページです。" },
    {
      property: "og:title",
      content: "BlendAI×Aipictors企画 - デルタもん生成企画",
    },
    {
      property: "og:description",
      content: "BlendAIとAipictorsの企画ページです。",
    },
    {
      property: "og:image",
      content:
        "https://www.aipictors.com/wp-content/uploads/2024/03/blendai_aipictors.webp",
    },
    {
      name: "twitter:title",
      content: "BlendAI×Aipictors企画 - デルタもん生成企画",
    },
    {
      name: "twitter:description",
      content: "BlendAIとAipictorsの企画ページです。",
    },
    {
      name: "twitter:image",
      content:
        "https://www.aipictors.com/wp-content/uploads/2024/03/blendai_aipictors.webp",
    },
  ]
}
