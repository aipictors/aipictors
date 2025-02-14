import { CharacterCard } from "~/routes/($lang).events.ai-idol-project/components/character-card"
import { ImageSliderAnimation } from "~/routes/($lang).events.ai-idol-project/components/image-slider-animation"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { useTranslation } from "~/hooks/use-translation"
import type { LoaderFunctionArgs } from "react-router-dom"
import { config } from "~/config"

export default function EventAiIdolProject() {
  const t = useTranslation()

  // 画像スライダーに使う画像URL（差し替え自由）
  const imageUrls = [
    "https://assets.aipictors.com/vtuber-va.webp",
    "https://assets.aipictors.com/3bc2d1b867ab3e80.webp",
    "https://assets.aipictors.com/01layer.webp",
    "https://assets.aipictors.com/kuko_0913_default2024-12-17_20-23-47.045.webp",
    "https://assets.aipictors.com/KomaChibi241222.webp",
  ]

  // VTuber キャラクター一覧
  const characters = [
    {
      name: "初祈 コトハ",
      imageURL: "https://assets.aipictors.com/01layer.webp",
      prompt:
        "<lora:kotoha_512v07_ds:0.6>,hatukikotoha,animal ears,aqua hair,blunt bangs,aqua eyes,",
      profile:
        "初祈と書いてハツキと読みます✨ 錆れた神社を復興する為にジュンさんと人工知能の力を借りてYouTubeでAI VTuberとして頑張ってるコト🦊 みんなよろしくね⛩",
      xlink: "https://x.com/jun_sans",
    },
    {
      name: "ゆうちゅす",
      imageURL: "https://assets.aipictors.com/3bc2d1b867ab3e80.webp",
      prompt:
        "<lora:youchusu1.5:0.6>youchusu1.5, 1girl, blonde hair, green eyes, long hair, green ribbon,looking at viewer, upperbody,smile",
      negativePrompt: "",
      profile:
        "たこ焼きに目がないギャルAITuber。TikTokで恋愛あるあるを言ったりYouTubeで生配信をする。座右の銘は「元気モリモリ💪('ω'💪)」。",
      xlink: "https://x.com/youchusu",
    },
    {
      name: "稲荷クコ",
      imageURL:
        "https://assets.aipictors.com/kuko_0913_default2024-12-17_20-23-47.045.webp",
      prompt:
        "<lora:kukoLora3:0.5>, fox ears, large fox tail, short blonde hair with bangs, blue and purple flower hair accessory,",
      negativePrompt: "",
      profile:
        "稲荷クコは、東京ドームでのパフォーマンスを夢見る17歳のAIVTuber。好きな食べ物は稲荷寿司。",
      xlink: "https://x.com/kukoinariai",
    },
    {
      name: "白犬コマ",
      imageURL: "https://assets.aipictors.com/KomaChibi241222.webp",
      prompt:
        "<lora:SiroInukoma1_5new:0.41>, a SiroInuKoma ,  heterochromia eyes,  thick eyebrow,",
      negativePrompt: "",
      profile:
        "台湾出身狛犬、末法時代で霊力を失い、技術を通して力を身に付き、自分の道(タオ)を証す。",
      xlink: " https://x.com/Koma_Siroinu",
    },
  ]

  // CharacterCard にマップ
  const characterCards = characters.map((character) => (
    <CharacterCard
      name={character.name}
      key={character.name}
      imageURL={character.imageURL}
      prompt={character.prompt}
      negativePrompts={character.negativePrompt ?? ""}
      profile={character.profile}
      xlink={character.xlink}
    />
  ))

  return (
    <>
      {/* バナーやスライドショー */}
      <ImageSliderAnimation imageURLs={imageUrls} />

      {/* イベントタイトル */}
      <h1 className="font-bold text-2xl">
        {t(
          "AI VTuber × Aipictors バレンタインイベント",
          "AI VTuber × Aipictors Valentine's Event",
        )}
      </h1>

      {/* イベント概要 */}
      <h2 className="mt-4 font-bold text-xl">
        {t("イベント概要", "Event Overview")}
      </h2>
      <p className="mt-4 text-md">
        {t(
          "今年のバレンタインは、AI VTuberと一緒に盛り上がりましょう！Aipictorsでは、AI技術を活用したVTuberたちが、皆さんに“甘い”時間をお届けします。",
          "Let's celebrate Valentine's Day together with AI VTubers! Aipictors is hosting a sweet event featuring VTubers powered by AI.",
        )}
        <br />
        {t(
          "バレンタインをテーマに、キャラクターのプロンプトを活用して楽しむ企画を多数用意しました。あなたの思い描く理想のバレンタインを、一緒に作りましょう！",
          "With Valentine's Day as the theme, we've prepared various activities where you can use the characters' prompts to create your ideal Valentine's moments.",
        )}
      </p>

      {/* 企画内容 */}
      <h2 className="mt-4 font-bold text-xl">
        {t("企画内容と参加方法", "Event Content & How to Participate")}
      </h2>
      <p className="mt-4 text-md">
        {t(
          "1. 各VTuberのプロフィール欄にあるプロンプトを使って、Aipictorsの生成機能でバレンタインにちなんだイラストやシーンを作成可能！",
          "1. Use the prompts in each VTuber's profile to generate Valentine's-themed illustrations or scenes with Aipictors.",
        )}
        <br />
        {t(
          "2. ローカル環境で画像を生成し、SNSなどで共有するのも大歓迎！",
          "2. You can also generate images locally and share them on social media!",
        )}
        <br />
        {t(
          "3. バレンタインにまつわるメッセージやファンアートを投稿して、一緒にイベントを盛り上げましょう！",
          "3. Post your Valentine's messages or fan art to help liven up the event!",
        )}
        <br />
        {t(
          "投稿された作品は審査させていただき、各VTuber賞を授与させていただきます！運営で審査させていただき最優秀賞の作品には、1万円分のAmazonギフト券をプレゼントさせていただきます！",
          "Submitted works will be judged, and each VTuber will be awarded a prize! The best work judged by the management will receive a 10,000 yen Amazon gift card!",
        )}
      </p>

      {/* 応募方法フロー */}
      <h2 className="mt-8 font-bold text-xl">
        {t("応募方法フロー", "How to Apply")}
      </h2>
      <p className="mt-4">
        {t(
          "以下のいずれかの方法で投稿してください。",
          "Please submit your entry by one of the following methods:",
        )}
      </p>

      <div className="mx-auto my-4 max-w-2xl rounded-md border p-4">
        <h3 className="mb-2 font-bold">
          {t("Step 1：作品を準備", "Step 1: Prepare Your Work")}
        </h3>
        <p className="ml-4 text-sm">
          {t(
            "Aipictorsでバレンタインにちなんだ作品を作成",
            "Create a Valentine's-themed work using Aipictors environment.",
          )}
        </p>
        <div className="my-2 flex justify-center">↓</div>

        <h3 className="mb-2 font-bold">
          {t("Step 2：以下のいずれかで投稿", "Step 2: Submit Your Entry")}
        </h3>
        <ol className="mb-4 ml-6 list-decimal text-sm">
          <li className="mb-2">
            {t(
              "「#Aipictors + AI VTuberの名前タグ」をつけてX(旧Twitter)に投稿（引用ポストでも可）",
              'Post on X (formerly Twitter) with "#Aipictors + the AI VTuber\'s name" tag (Quote posting is also accepted).',
            )}
          </li>
          <li>
            {t(
              "Aipictorsにて「VTuberバレンタイン企画2025」のタグをつけて投稿",
              'Post on Aipictors with the "VTuberバレンタイン企画2025" tag.',
            )}
          </li>
        </ol>
        <div className="my-2 flex justify-center">↓</div>

        <h3 className="mb-2 font-bold">
          {t("Step 3：投稿完了！", "Step 3: Completion!")}
        </h3>
        <p className="ml-4 text-sm">
          {t(
            "あとは運営の審査をお待ちください。受賞者には後日ご連絡いたします！",
            "Now wait for the official review. Winners will be contacted at a later date!",
          )}
        </p>
      </div>

      {/* VTuber 一覧 */}
      <h2 className="mt-8 font-bold text-xl">
        {t("登場VTuber一覧", "VTuber List")}
      </h2>
      <p className="whitespace-pre-line text-sm">
        {t(
          `画像をクリックすると、指定のプロンプトを使って生成できます。
プロンプトをコピーすれば、ローカル環境で自由に生成することも可能です。`,
          `Click the image to generate with the specified prompt.
You can also copy the prompts and generate them locally.`,
        )}
      </p>

      <div className="mt-8 flex flex-wrap justify-center space-x-8">
        {characterCards}
      </div>
    </>
  )
}

export async function loader(props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMonth,
})

export const meta: MetaFunction = () => {
  return [
    { title: "AI VTuber × Aipictors バレンタインイベント" },
    {
      description:
        "AI技術を活用したVTuberたちと一緒に楽しむバレンタインイベントページ。生成機能を使ってあなたの想いをカタチにしよう。",
    },
    {
      property: "og:title",
      content: "AI VTuber × Aipictors バレンタインイベント",
    },
    {
      property: "og:description",
      content:
        "AI技術を活用したVTuberたちと一緒に、甘いひとときを過ごすバレンタイン企画！プロンプト生成でファンアート投稿も可能。",
    },
    {
      property: "og:image",
      content: "https://assets.aipictors.com/vtuber-va.webp",
    },
    {
      name: "twitter:title",
      content: "AI VTuber × Aipictors バレンタインイベント",
    },
    {
      name: "twitter:description",
      content:
        "AI VTuberといっしょに楽しむバレンタイン企画。あなたの想いをイラストやメッセージに乗せて投稿しよう！",
    },
  ]
}
