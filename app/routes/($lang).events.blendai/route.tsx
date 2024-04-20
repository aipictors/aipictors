import { ImageGenerationReferenceCard } from "@/_components/image-generation-reference-card"
import { Button } from "@/_components/ui/button"
import { EventImage } from "@/routes/($lang).events.blendai/_components/event-image"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { MousePointerClickIcon } from "lucide-react"

export default function BlendAi() {
  return (
    <div className="space-y-2 py-4">
      <div className="flex flex-col items-center md:flex-row">
        <div className="flex flex-grow-3">
          <EventImage
            alt={"BlendAI×Aipictors企画"}
            imageURL={
              "https://www.aipictors.com/wp-content/uploads/2024/03/blendai_aipictors.webp"
            }
          />
        </div>
        <div className="w-full flex-2 space-y-8 py-8 md:px-4">
          <div className="space-y-4">
            <h1 className={"font-bold text-4xl text-blue-300"}>
              {"BlendAI×Aipictors企画"}
            </h1>
          </div>
          <p className="leading-relaxed">
            {"デルタもん生成をして投稿・シェアしてみましょう！"}
          </p>
          <a
            href="https://blendai.jp/contents"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant={"outline"} className="m-4 font-bold text-lg">
              デルタもんについて
              <MousePointerClickIcon className="ml-2" />
            </Button>
          </a>
          <a
            href="https://www.aipictors.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant={"outline"} className="m-4 font-bold text-lg">
              Aipictors
              <MousePointerClickIcon className="ml-2" />
            </Button>
          </a>
        </div>
      </div>

      <div className="p-2">
        <div className="text-sm">
          {"人とAIが互いに理解し合うことを目的に未来からやってきたデルタもん。"}
        </div>
        <div className="text-sm">
          {
            "デルタもんと創作活動を通じて、AI創作の楽しさのきっかけにしてみませんか？"
          }
        </div>
        <Link
          className="text-sm"
          to="https://www.aipictors.com/events/blendai/"
        >
          イベント特設ページはこちら
        </Link>
        <div className="m-4">
          <ImageGenerationReferenceCard
            title="デルタもんを生成してみる！"
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

export const meta: MetaFunction = () => {
  return [
    { title: "BlendAI×Aipictors企画 - デルタもん生成企画" },
    { description: "BlendAIとAipictorsの企画ページです。" },
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
