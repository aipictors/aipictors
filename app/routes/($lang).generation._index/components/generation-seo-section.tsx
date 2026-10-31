import { Link, useParams } from "@remix-run/react"
import type {
  BreadcrumbList,
  FAQPage,
  WebApplication,
  WithContext,
} from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

/**
 * 一覧に出さないモデル（名前が検索結果に出ると困るもの）
 */
const HIDDEN_MODEL_PATTERN = /loli/i

type FaqItem = { question: string; answer: string }

/**
 * 画像生成ページの下に出す説明（生成画面だけだと、何ができるページなのか検索エンジンに伝わらなかった）
 * - 画面の 1 枚目は今の生成画面のまま。スクロールした先に、できること・使い方・モデル・料金・よくある質問を置く
 * - WebApplication・FAQPage・BreadcrumbList の構造化データも出す
 */
export function GenerationSeoSection () {
  const t = useTranslation()

  const params = useParams()

  const context = useGenerationContext()

  const lang = params.lang === "en" ? "en" : "ja"

  const baseUrl = `${config.siteURL}${lang === "en" ? "/en" : ""}`

  const pageUrl = `${baseUrl}/generation`

  // SDXL 系（Illustrious・Pony など）を先に、名前が重複するものは 1 つに
  const models = Array.from(
    new Map(
      [...context.imageModels]
        .filter((model) => !HIDDEN_MODEL_PATTERN.test(model.displayName ?? ""))
        .filter((model) => model.type !== "FLUX")
        .sort((a, b) => Number(b.type === "SDXL") - Number(a.type === "SDXL"))
        .map((model) => [model.displayName, model] as const),
    ).values(),
  ).slice(0, 24)

  const faqs: FaqItem[] = [
    {
      question: t("無料で使えますか？", "Is it free?"),
      answer: t(
        "はい。ログインすると毎日100フリーコインが届き、1日10枚まで無料で生成できます（1回2枚まで）。もっと作りたいときは月額480円からのプランで、1回4枚・1日最大200枚まで生成できます。",
        "Yes. After logging in you get 100 free coins every day, enough for 10 images a day (2 per run). Plans from ¥480/month let you make 4 images per run and up to 200 images a day.",
      ),
    },
    {
      question: t("日本語で指示できますか？", "Can I write prompts in Japanese?"),
      answer: t(
        "できます。プロンプト欄の「日本語で入力」をオンにすると、日本語の文章からプロンプトを作って生成します。キーワード一覧から選んで組み立てることもできます。",
        "Yes. Turn on Japanese input and your Japanese sentence is turned into a prompt. You can also build prompts by picking keywords.",
      ),
    },
    {
      question: t(
        "どんな絵柄が作れますか？",
        "What styles can I make?",
      ),
      answer: t(
        "アニメ・イラスト系からリアル系、背景、動物まで、公式モデルとみんながアップロードしたモデル（LoRA・チェックポイント）から選べます。SDXL・Illustrious・Pony 系のモデルにも対応しています。",
        "Anime illustrations, realistic images, backgrounds and more. Choose from official models and community LoRA/checkpoints, including SDXL, Illustrious and Pony models.",
      ),
    },
    {
      question: t(
        "スマホでも使えますか？",
        "Does it work on smartphones?",
      ),
      answer: t(
        "使えます。アプリのインストールは不要で、スマホ・PCのブラウザからそのまま生成できます。",
        "Yes. No app is needed; it works in mobile and desktop browsers.",
      ),
    },
    {
      question: t(
        "作った画像はどうなりますか？",
        "What happens to the images I make?",
      ),
      answer: t(
        "生成履歴に保存され、ダウンロードしたり、そのまま Aipictors に作品として投稿したりできます。同じ設定を復元して作り直すこともできます。",
        "They are saved in your history. Download them, post them to Aipictors as works, or restore the same settings to make more.",
      ),
    },
  ]

  const webApplication: WithContext<WebApplication> = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("Aipictors 画像生成", "Aipictors Image Generator"),
    url: pageUrl,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: lang,
    description: t(
      "ブラウザだけで使える無料のAI画像生成。日本語のプロンプトからAIイラスト・アニメ絵・リアル系の画像を作れます。",
      "A free AI image generator in your browser for anime illustrations and realistic images.",
    ),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "JPY",
      lowPrice: 0,
      highPrice: 3980,
      offerCount: 4,
    },
    publisher: {
      "@type": "Organization",
      name: "Aipictors",
      url: config.siteURL,
    },
  }

  const faqPage: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }

  const breadcrumb: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Aipictors",
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("画像生成", "Image generation"),
        item: pageUrl,
      },
    ],
  }

  const steps = [
    {
      title: t("モデルを選ぶ", "Pick a model"),
      body: t(
        "アニメ系・リアル系など、作りたい絵柄に合うモデルを選びます。LoRA を足して画風やキャラクターを寄せることもできます。",
        "Choose a model for the style you want, and add LoRA for a specific look or character.",
      ),
    },
    {
      title: t("プロンプトを書く", "Write a prompt"),
      body: t(
        "作りたい内容を書きます。英語のキーワードでも、日本語の文章でも大丈夫です。",
        "Describe what you want in English keywords or Japanese sentences.",
      ),
    },
    {
      title: t("生成ボタンを押す", "Press generate"),
      body: t(
        "数十秒で画像ができます。気に入った画像は保存したり、そのまま投稿したりできます。",
        "Your images are ready in seconds. Save the ones you like or post them right away.",
      ),
    },
  ]

  return (
    <section
      aria-labelledby="generation-about-heading"
      className="mx-auto mt-10 w-full max-w-4xl scroll-mt-24 space-y-8 border-t px-1 pt-8 pb-16 text-sm leading-relaxed"
    >
      <AppJsonLdScript jsonLd={[webApplication, faqPage, breadcrumb]} />

      <div className="space-y-3">
        <h1 id="generation-about-heading" className="font-bold text-xl">
          {t(
            "無料のAI画像生成・AIイラスト生成",
            "Free AI image generator",
          )}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "Aipictors の画像生成は、ブラウザだけで使えるAI画像生成ツールです。日本語のプロンプトから、アニメ・イラスト系やリアル系の画像を作れます。毎日10枚まで無料で、作った画像はそのまま Aipictors に投稿してみんなに見てもらえます。",
            "Aipictors Image Generator is an AI image generator that runs in your browser. Create anime illustrations and realistic images from prompts, 10 images a day for free, and share them with the Aipictors community.",
          )}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-bold text-lg">
          {t("できること", "What you can do")}
        </h2>
        <ul className="grid gap-2 md:grid-cols-2">
          <li className="rounded-lg border p-3">
            <span className="font-semibold">
              {t("日本語でプロンプト", "Japanese prompts")}
            </span>
            <br />
            {t(
              "日本語の文章からプロンプトを作って生成できます。",
              "Write in Japanese and we turn it into a prompt.",
            )}
          </li>
          <li className="rounded-lg border p-3">
            <span className="font-semibold">
              {t("たくさんのモデルとLoRA", "Models and LoRA")}
            </span>
            <br />
            {t(
              "公式モデルに加えて、みんながアップロードしたモデルでも生成できます。",
              "Use official models and models uploaded by the community.",
            )}{" "}
            <Link className="text-primary underline" to="/models">
              {t("モデルを探す", "Browse models")}
            </Link>
          </li>
          <li className="rounded-lg border p-3">
            <span className="font-semibold">
              {t("1回で最大4枚・高解像度", "Up to 4 per run, high resolution")}
            </span>
            <br />
            {t(
              "まとめて作って選べます。高解像度にも対応しています。",
              "Make several at once and upscale your favorites.",
            )}
          </li>
          <li className="rounded-lg border p-3">
            <span className="font-semibold">
              {t("作品を参考に生成・そのまま投稿", "Remix and post")}
            </span>
            <br />
            {t(
              "投稿作品のプロンプトを参考に作り、できた画像はそのまま投稿できます。",
              "Start from prompts of posted works and post your results.",
            )}{" "}
            <Link className="text-primary underline" to="/search">
              {t("作品を探す", "Find works")}
            </Link>
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="font-bold text-lg">
          {t("使い方（3ステップ）", "How to use (3 steps)")}
        </h2>
        <ol className="grid gap-2 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-lg border p-3">
              <span className="font-semibold">
                {index + 1}. {step.title}
              </span>
              <br />
              {step.body}
            </li>
          ))}
        </ol>
      </div>

      {models.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg">
            {t("生成に使えるモデル", "Models you can use")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {models.map((model) => (
              <li key={model.id}>
                <Link
                  className="inline-block rounded-full border px-3 py-1 hover:bg-muted"
                  to={`/models/${encodeURIComponent(model.displayName)}`}
                >
                  {model.displayName}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground">
            {t(
              "このほか、みんながアップロードした LoRA・チェックポイントも使えます。",
              "Plus LoRA and checkpoints uploaded by the community.",
            )}{" "}
            <Link className="text-primary underline" to="/models">
              {t("モデル一覧", "All models")}
            </Link>
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-bold text-lg">{t("料金", "Pricing")}</h2>
        <p>
          {t(
            "無料：毎日10枚まで（1回2枚）。ライト月額480円（1日50枚）・スタンダード月額1,980円（1日100枚）・プレミアム月額3,980円（1日200枚）は1回4枚、広告の非表示や画像から生成なども使えます。はじめての方は初月半額です。",
            "Free: 10 images a day (2 per run). Lite ¥480 (50/day), Standard ¥1,980 (100/day) and Premium ¥3,980 (200/day) make 4 per run, with no ads and image-to-image. 50% off your first month.",
          )}{" "}
          <Link className="text-primary underline" to="/generation/plans">
            {t("プランを見る", "See plans")}
          </Link>
          {" ・ "}
          <Link className="text-primary underline" to="/generation/about">
            {t("生成機能について", "About the generator")}
          </Link>
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-bold text-lg">
          {t("よくある質問", "FAQ")}
        </h2>
        <div className="space-y-2">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-lg border p-3">
              <summary className="cursor-pointer font-semibold">
                {faq.question}
              </summary>
              <p className="mt-2 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
