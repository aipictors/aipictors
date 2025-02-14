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
    "https://assets.aipictors.com/3bc2d1b867ab3e80.webp",
    "https://assets.aipictors.com/01layer.webp",
    "https://assets.aipictors.com/kuko_0913_default2024-12-17_20-23-47.045.webp",
    "https://assets.aipictors.com/KomaChibi241222.webp",
  ]

  // キャラクター一覧は元のデータをそのまま維持
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
        "たこ焼きに目がないギャルAITuber。TikTokで恋愛あるあるを言ったりYouTubeで生配信をする。座右の銘は「元気モリモリ💪('ω'💪)」",
      xlink: "https://x.com/youchusu",
    },
    {
      name: "いなりくこ",
      imageURL:
        "https://assets.aipictors.com/kuko_0913_default2024-12-17_20-23-47.045.webp",
      prompt:
        "<lora:kukoLora3:0.5>, fox ears, large fox tail, short blonde hair with bangs, blue and purple flower hair accessory,",
      negativePrompt: "",
      profile: "ここにプロフィールが入ります",
      xlink: "https://x.com/kukoinariai",
    },
    {
      name: "siroinukoma",
      imageURL: "https://assets.aipictors.com/KomaChibi241222.webp",
      prompt:
        "<lora:SiroInukoma1_5new:0.41>, a SiroInuKoma ,  heterochromia eyes,  thick eyebrow,",
      negativePrompt: "",
      profile: "ここにプロフィールが入ります",
      xlink: "https://x.com/Yue_Aipro",
    },
    // 追加キャラがあれば同様に...
  ]

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
      {/* スライドショー（バレンタインっぽい画像を入れたい場合はURLを差し替え） */}
      <ImageSliderAnimation imageURLs={imageUrls} />

      {/* タイトル */}
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

      {/* 誘導ページがないため削除 or 必要に応じて他の要素に変えてもOK */}
      {/* <Link to="..." className="text-blue-500">何かリンクがあればここに</Link> */}

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
          "2. You're also welcome to generate images locally and share them on social media!",
        )}
        <br />
        {t(
          "3. バレンタインにまつわるメッセージやファンアートを投稿して、一緒にイベントを盛り上げましょう！",
          "3. Post your Valentine's messages or fan art to help liven up the event!",
        )}
      </p>

      {/* VTuber 一覧 */}
      <h2 className="mt-4 font-bold text-xl">
        {t("登場VTuber一覧", "VTuber List")}
      </h2>
      <p className="text-sm">
        {t(
          "画像をクリックすると、指定のプロンプトを使って生成できます",
          "Click the image to generate with the specified prompt.",
        )}
      </p>
      <p className="text-sm">
        {t(
          "プロンプトのコピー後、ローカルで生成することも可能です",
          "You can also copy the prompts and generate locally.",
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
      content:
        "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/idolaipicheader.jpg",
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
