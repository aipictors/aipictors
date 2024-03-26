import { ImageGenerationReferenceCard } from "@/app/[lang]/_components/image-generation-reference-card"
import { EventImage } from "@/app/[lang]/events/blendai/_components/event-image"
import { eventUsers } from "@/app/[lang]/events/wakiaiai/_assets/event-users"
import { Button } from "@/components/ui/button"
import { MousePointerClickIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

const BlendAiPage = async () => {
  const length = Math.floor(eventUsers.length / 3)

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
          href="https://www.aipictors.com/events/blendai/"
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

export const metadata: Metadata = {
  title: { absolute: "BlendAI×Aipictors企画 - デルタもん生成企画" },
  description: "BlendAIとAipictorsの企画ページです。",
  openGraph: {
    title: { absolute: "BlendAI×Aipictors企画 - デルタもん生成企画" },
    description: "BlendAIとAipictorsの企画ページです。",
    images: {
      url: "https://www.aipictors.com/wp-content/uploads/2024/03/blendai_aipictors.webp",
    },
  },
  twitter: {
    title: { absolute: "BlendAI×Aipictors企画 - デルタもん生成企画" },
    description: "BlendAIとAipictorsの企画ページです。",
  },
}

export default BlendAiPage
