import { GlowingGradientBorderButton } from "~/components/button/glowing-gradient-border-button"
import { CharacterCard } from "~/routes/($lang).events.ai-idol-project/components/character-card"
import { ImageSliderAnimation } from "~/routes/($lang).events.ai-idol-project/components/image-slider-animation"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { Link } from "~/lib/app/locale-router"
import { useTranslation } from "~/hooks/use-translation"
import type { LoaderFunctionArgs } from "react-router-dom"
import { config } from "~/config"

export default function EventAiIdolProject () {
  const t = useTranslation()

  const imageUrls = [
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/idolaipicheader.jpg",
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/GKsjL9Bb0AAK2Gq.jpg",
    "https://prd.storage.lit.link/images/creators/f62dc4df-f7cc-4400-9d8b-c0efe765ade5/73416303-ac2f-4d2f-b003-ce0d2ebfbcf5.jpg",
    "https://prd.storage.lit.link/images/creators/f62dc4df-f7cc-4400-9d8b-c0efe765ade5/9b0af88c-7c57-49ac-836a-56aa06e44f52.jpg",
  ]

  const characters = [
    {
      name: "エリカ・ベネット",
      imageURL:
        "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/%E3%82%A8%E3%83%AA%E3%82%AB%E9%80%8F%E9%81%8E.webp",
      prompt:
        "1girl,School uniform, blond ponytail, big blue ribbon,tsundere, tight eyes, confident expression, a little bit gal, American girl, blue eyes, age15",
      profile:
        "AIから生まれた新人アイドル、エリカ・ベネットよ！🛬電子の海の向こうから、-手元で出会えるアイドル-として、AiIdolProjectに移籍して来たわ！どこかに消えた“アイツ”よりも、私が世界一のアイドルだってことを魅せてあげる。私についてきなさい！",
      xlink: "https://x.com/Erica_Aipro",
    },
    {
      name: "朧霧ユエ",
      imageURL:
        "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/%E3%83%A6%E3%82%A8%E9%80%8F%E9%81%8E_1.webp",
      prompt:
        "((((long fish-bone braid hair, pony-tail-style)))),1 girl solo, she has purple hair, green eyes, intelligent glasses ,expressionless, about 16 years old, white coat",
      negativePrompt:
        "(((Biological fish, snakes,Animal Ears,smile,short-hair,medium hair))), twintails",
      profile:
        "AIから生まれた新人アイドル、ユエ...。-手元で出会えるアイドル-AiIdolProject所属。あの子たちの、笑顔の理由。この頭脳で解き明かす...。えっ、絵文字...？......これでいい🤗？",
      xlink: "https://x.com/Yue_Aipro",
    },
    // 追加のキャラクターも同様に設定
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
      <ImageSliderAnimation imageURLs={imageUrls} />
      <h1 className="font-bold text-2xl">
        {t("AI IDOL PROJECT × Aipictors", "AI IDOL PROJECT × Aipictors")}
      </h1>
      <h2 className="mt-4 font-bold text-xl">
        {t("AI IDOL PROJECTとは？", "What is AI IDOL PROJECT?")}
      </h2>
      <p className="mt-4 text-md">
        {t(
          "AI IDOL PROJECT（アイプロ）は、完全AIによるアイドルグループです。",
          "AI IDOL PROJECT is a fully AI-based idol group.",
        )}
        <br />
        {t(
          "AIが歌い、踊り、ライブを行います。",
          "AI sings, dances, and performs live.",
        )}
        <br />
        {t(
          "AI IDOL PROJECTは、AIがアイドルとして活動することで、AIの可能性を広げることを目指しています。",
          "AI IDOL PROJECT aims to expand the possibilities of AI by allowing it to work as an idol.",
        )}
      </p>
      <Link to="https://lit.link/aiidolproject" className="text-blue-500">
        {t("アイプロ関連サイトまとめ", "Related sites of AiPro")}
      </Link>
      <h2 className="mt-4 font-bold text-xl">
        {t("企画内容", "Project Details")}
      </h2>
      <p className="mt-4 text-md">
        {t(
          "アイプロのそれぞれのAIアイドルのプロンプトを公開して生成機能で生成できるような投稿企画を開催いたします。",
          "We are holding a project where prompts of each AI idol from AiPro will be released, and users can generate their content.",
        )}
        <br />
        {t(
          "ローカルマシンで生成いただいて投稿企画にご参加いただくことも可能です。",
          "You can also generate them locally and participate in the project.",
        )}
        <br />
        {t(
          "投稿いただいた作品はイベントページにて一覧して確認いただくことができます。",
          "Submitted works will be listed and viewable on the event page.",
        )}
        <br />
        {t(
          "AI IDOL PROJECT（アイプロ）の作品をご投稿いただいてプロジェクトを応援したり、投稿されている作品をチェックしたりして楽しみましょう！",
          "Let's support the AI IDOL PROJECT by submitting works or checking submitted works!",
        )}
      </p>
      <GlowingGradientBorderButton
        onClick={() => {
          window.open("https://www.aipictors.com/events/ai-idol-project-event/")
        }}
      >
        {t("イベント専用ページはこちら", "Event dedicated page here")}
      </GlowingGradientBorderButton>
      {/* biome-ignore lint/style/useSelfClosingElements: Intentional (JSX kept explicit) */}
      <iframe
        className="m-auto mt-8 mb-24"
        width={"auto"}
        height="315"
        src="https://www.youtube.com/embed/q1wVDZe5rMg?si=wu-mwywyLZ9xZLVD"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>

      <h2 className="mt-4 font-bold text-xl">
        {t("アイドル一覧", "Idol List")}
      </h2>
      <p className="text-sm">
        {t(
          "クリックすることでプロンプトがセットされた状態で生成できます！",
          "Click to generate with the set prompt!",
        )}
      </p>
      <p className="text-sm">
        {t(
          "プロンプトをコピーしてローカルマシンで生成することもできます",
          "You can also copy the prompt and generate locally.",
        )}
      </p>
      <div className="mt-8 flex flex-wrap justify-center space-x-8">
        {characterCards}
      </div>
    </>
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
    { title: "Ai Idol Project - Aipictors" },
    {
      description:
        "Ai Idol Project（アイプロ）のご紹介、Aipictorsとの連携特設ページ",
    },
    {
      property: "og:title",
      content: "Ai Idol Project - Aipictors",
    },
    {
      property: "og:description",
      content:
        "Ai Idol Project（アイプロ）のご紹介、生成機能との連携特設ページです。",
    },
    {
      property: "og:image",
      content:
        "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/idolaipicheader.jpg",
    },
    {
      name: "twitter:title",
      content: "Ai Idol Project - Aipictors",
    },
    {
      name: "twitter:description",
      content:
        "Ai Idol Project（アイプロ）のご紹介、Aipictorsとの連携特設ページ",
    },
  ]
}
