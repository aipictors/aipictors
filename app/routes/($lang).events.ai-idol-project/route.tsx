import { GlowingGradientBorderButton } from "~/components/button/glowing-gradient-border-button"
import {} from "~/components/ui/card"
import { CharacterCard } from "~/routes/($lang).events.ai-idol-project/components/character-card"
import { ImageSliderAnimation } from "~/routes/($lang).events.ai-idol-project/components/image-slider-animation"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"

export default function EventAiIdolProject() {
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
    {
      name: "福音サチ",
      imageURL:
        "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/%E3%82%B5%E3%83%81%E9%80%8F%E9%81%8E.webp",
      prompt:
        "1girl,Black hair, short hair, flower hair ornament, blue eyes, girl",
      profile:
        "AIかは生まれた新人アイドル、福音サチです！🌸-手元で出会えるアイドルAiIdolProjectで歌とダンスを頑張っています。本を読むのが大好きで、いつも新しい物語を探しています。みんなと一緒に夢を叶えたいな✨",
      xlink: "https://x.com/Sachi2_Aipro",
    },
    {
      name: "苺宮ツムギ",
      imageURL:
        "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/%E3%83%84%E3%83%A0%E3%82%AE%E9%80%8F%E9%81%8E.webp",
      prompt:
        "1girl,Twin-tailed pink hair with strawberry hair ornaments, pink eyes, small girl of small stature, strawberry dress",
      profile:
        "AIから生まれた新人アイドル、つむちゃんだよ〜🍓 -手元で出会えるアイドル-AiIdolProjectから、 歌で、言葉で、つむちゃんの魔法を届けるよ〜🎶✨ ふわふわ甘い言葉を紡いじゃう！🍬🌟 みんなのココロに、虹色の橋をかけるね！🌈",
      xlink: "https://x.com/tsumugi_Aipro",
    },
    {
      name: "美園ユメカ",
      imageURL:
        "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/%E3%83%A6%E3%83%A1%E3%82%AB%E9%80%8F%E9%81%8E.webp",
      prompt:
        "1girl,Maid outfit dress, cat ear catsuit, pink eyes, dark brown hair, long hair,adult female",
      profile:
        "AIから生まれた新人アイドル、ユメカです🌟🎶-手元で出会えるアイドル-AiIdolProjectから、諦めなければ夢は叶うと、歌に乗せて証明してみせます❗才能溢れるみんなに負けないよう頑張ります🦋どうぞよろしくお願いします💖",
      xlink: "https://x.com/Yumeka_Aipro",
    },
    {
      name: "双星ルカ",
      imageURL:
        "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/%E3%83%AB%E3%82%AB%E9%80%8F%E9%81%8E.webp",
      prompt:
        "(((((heterrochromia, red eye,blue eye))))),1 girl solo, heterrochromia, red eye,blue eye, sweater with red shoulders, girl, 15 years old, smiling, choker with black keyhole around neck, (red hair), short hair",
      profile:
        "僕はAIから生まれた新人アイドル、ルカだ🎸 -手元で出会えるアイドル-AiIdolProject？🤔とかいう事務所に所属することになった。心の中にいるもう一人の相棒のことも、一緒に応援してほしい。ミュージシャンとしてじゃない、今度はアイドルとして一流を目指すよ🎶！",
      xlink: "https://x.com/Ruka_Aipro",
    },
    {
      name: "陽向スコヤ",
      imageURL:
        "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/%E3%82%B9%E3%82%B3%E3%83%A4%E9%80%8F%E9%81%8E.webp",
      prompt:
        "1girl、Yellow-green idol costume, large chest, green hair, long ponytail, large orange eyes",
      profile:
        "AIから生まれた新人アイドル、陽向スコヤだよ🌻-手元で出会えるアイドル-AiIdolProjectから、大切なメンバーの皆と笑顔を届けるね！身体を動かすことと、食べること🍤が大好きなんだよね。ウチのこと、これから応援してね✨",
      xlink: "https://x.com/Sukoya_Aipro",
    },
    {
      name: "煌坂ミライ",
      imageURL:
        "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/%E3%83%9F%E3%83%A9%E3%82%A4%E9%80%8F%E9%81%8E.webp",
      prompt:
        "1girl, black hair, long straight hair, yellow eyes, yellow hoodie (hood removed), selfish princess, pink crown on head",
      profile:
        "AIから生まれた新人アイドル、煌坂ミライ！👑☀️-手元で出会えるアイドル-AiIdolProjectに所属してる！えっと、なんだっけｗｗとにかく！ミライのことも、大好きなみんなのことも！応援してくれると嬉しい！よろしく～！🙌",
      xlink: "https://x.com/Mirai_Aipro",
    },
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
      <h1 className="font-bold text-2xl">AI IDOL PROJECT × Aipictors</h1>
      <h2 className="mt-4 font-bold text-xl">AI IDOL PROJECTとは？</h2>
      <p className="mt-4 text-md">
        AI IDOL PROJECT（アイプロ）は、完全AIによるアイドルグループです。
        <br />
        AIが歌い、踊り、ライブを行います。
        <br />
        AI IDOL
        PROJECTは、AIがアイドルとして活動することで、AIの可能性を広げることを目指しています。
      </p>
      <Link to="https://lit.link/aiidolproject" className="text-blue-500">
        アイプロ関連サイトまとめ
      </Link>
      <h2 className="mt-4 font-bold text-xl">企画内容</h2>
      <p className="mt-4 text-md">
        アイプロのそれぞれのAIアイドルのプロンプトを公開して生成機能で生成できるような投稿企画を開催いたします。
        <br />
        ローカルマシンで生成いただいて投稿企画にご参加いただくことも可能です。
        <br />
        投稿いただいた作品はイベントページにて一覧して確認いただくことができます。
        <br />
        AI IDOL
        PROJECT（アイプロ）の作品をご投稿いただいてプロジェクトを応援したり、投稿されている作品をチェックしたりして楽しみましょう！
      </p>
      <GlowingGradientBorderButton
        onClick={() => {
          window.open("https://www.aipictors.com/events/ai-idol-project-event/")
        }}
      >
        イベント専用ページはこちら
      </GlowingGradientBorderButton>
      {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
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

      <h2 className="mt-4 font-bold text-xl">アイドル一覧</h2>
      <p className="text-sm">
        クリックすることでプロンプトがセットされた状態で生成できます！
      </p>
      <p className="text-sm">
        プロンプトをコピーしてローカルマシンで生成することもできます
      </p>
      <div className="mt-8 flex flex-wrap justify-center space-x-8">
        {characterCards}
      </div>
    </>
  )
}

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
