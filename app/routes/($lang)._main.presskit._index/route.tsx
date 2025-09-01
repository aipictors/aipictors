import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"
import {
  DownloadIcon,
  ExternalLinkIcon,
  ImageIcon,
  FileTypeIcon,
  CopyIcon,
  CheckIcon,
  SparklesIcon,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { useState } from "react"

export const meta: MetaFunction = (props) => {
  return createMeta(META.PRESSKIT, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneWeek,
})

/**
 * プレスキット（ロゴダウンロード）ページ
 */
export default function Presskit() {
  const t = useTranslation()
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const logos = [
    {
      id: "main-logo",
      title: t("メインロゴ", "Main Logo"),
      description: t(
        "Aipictorsの標準ロゴです。横長のレイアウトに適しています。",
        "The standard Aipictors logo. Suitable for horizontal layouts.",
      ),
      imageUrl: "https://assets.aipictors.com/aipictors_logo.png",
      formats: [
        { type: "PNG", url: "https://assets.aipictors.com/aipictors_logo.png" },
      ],
    },
    {
      id: "square-logo-1",
      title: t("正方形ロゴ（パターン1）", "Square Logo (Pattern 1)"),
      description: t(
        "アイコンとして使用するのに適した正方形のロゴです。",
        "A square logo suitable for use as an icon.",
      ),
      imageUrl: "https://assets.aipictors.com/aipictors_logo_square.png",
      formats: [
        {
          type: "PNG",
          url: "https://assets.aipictors.com/aipictors_logo_square.png",
        },
      ],
    },
    {
      id: "square-logo-2",
      title: t("正方形ロゴ（パターン2）", "Square Logo (Pattern 2)"),
      description: t(
        "シンプルなデザインの正方形ロゴです。SNSアイコンなどに最適です。",
        "A simple square logo design. Perfect for SNS icons.",
      ),
      imageUrl: "https://assets.aipictors.com/aipictors_square_logo.png",
      formats: [
        {
          type: "PNG",
          url: "https://assets.aipictors.com/aipictors_square_logo.png",
        },
      ],
    },
  ]

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error("Failed to copy URL:", error)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6">
      {/* ヘッダー */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
          {t("プレスキット", "Press Kit")}
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
          {t(
            "Aipictorsのロゴ素材をダウンロードしていただけます。メディア掲載や紹介記事などでご活用ください。",
            "Download Aipictors logo materials. Use them for media coverage, articles, and other promotional purposes.",
          )}
        </p>
      </div>

      {/* 利用規約セクション */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-amber-800 dark:text-amber-200">
          <FileTypeIcon className="h-6 w-6" />
          {t("利用規約", "Terms of Use")}
        </h2>
        <div className="space-y-3 text-amber-800 dark:text-amber-200">
          <p>
            {t(
              "・商用・非商用問わず、自由にご利用いただけます",
              "• Free to use for both commercial and non-commercial purposes",
            )}
          </p>
          <p>
            {t(
              "・当サービスが支援または推奨しているかのような印象を与える使用は禁止します",
              "• Usage that implies endorsement or recommendation by our service is prohibited",
            )}
          </p>
          <p>
            {t(
              "・ロゴの改変、色の変更は避けてください",
              "• Please avoid modifying the logo or changing its colors",
            )}
          </p>
          <p>
            {t(
              "・不適切な用途での使用はお控えください",
              "• Please refrain from using it for inappropriate purposes",
            )}
          </p>
        </div>
      </div>

      {/* ロゴ一覧 */}
      <div className="space-y-8">
        <h2 className="text-center text-2xl font-semibold">
          {t("ロゴ素材", "Logo Assets")}
        </h2>
        <div className="grid gap-8 lg:grid-cols-1">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                {/* ロゴプレビュー */}
                <div className="space-y-4">
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-50 p-8 dark:bg-gray-900">
                    <img
                      src={logo.imageUrl}
                      alt={logo.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleCopyUrl(logo.imageUrl)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {copiedUrl === logo.imageUrl ? (
                        <>
                          <CheckIcon className="mr-2 h-3 w-3" />
                          {t("コピー済み", "Copied")}
                        </>
                      ) : (
                        <>
                          <CopyIcon className="mr-2 h-3 w-3" />
                          {t("URLをコピー", "Copy URL")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* ロゴ情報・ダウンロード */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold">{logo.title}</h3>
                    <p className="text-muted-foreground">{logo.description}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">
                      {t("ダウンロード", "Download")}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {logo.formats.map((format) => (
                        <Button
                          key={format.type}
                          onClick={() =>
                            handleDownload(
                              format.url,
                              `aipictors_logo_${logo.id}.${format.type.toLowerCase()}`,
                            )
                          }
                          className="flex items-center gap-2"
                          variant="default"
                        >
                          <DownloadIcon className="h-4 w-4" />
                          {format.type}形式
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "画像を右クリックして「名前を付けて保存」からも保存できます",
                        "You can also right-click the image and select 'Save as' to download",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* マスコットキャラクター */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          {t("マスコットキャラクター", "Mascot Character")}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          {/* キャラクター画像 */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="-inset-1 absolute rounded-full bg-gradient-to-r from-red-500 to-purple-500 opacity-20 blur-sm" />
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white dark:bg-gray-800">
                <img
                  src="https://assets.aipictors.com/6308eaf00a05fd7c3001b709dbe8e39a.webp"
                  alt={t("ぴくたーちゃん", "Pictor-chan")}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* キャラクター説明 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text font-semibold text-2xl text-transparent">
                {t("ぴくたーちゃん", "Pictor-chan")}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  "Aipictorsの公式マスコットキャラクターです。AI画像生成の世界を案内する可愛らしいキャラクターとして親しまれています。",
                  "The official mascot character of Aipictors. A lovable character who guides users through the world of AI image generation.",
                )}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <p className="text-sm text-muted-foreground">
                {t(
                  "ぴくたーちゃんの詳細情報やキャラクター設定については、専用ページをご覧ください。",
                  "For detailed information and character settings of Pictor-chan, please visit the dedicated page.",
                )}
              </p>
            </div>

            <Button asChild variant="outline">
              <a href="/pictor-chan" className="inline-flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
                {t("ぴくたーちゃんについて", "About Pictor-chan")}
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* SVGファイル・その他の素材 */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/20">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-blue-800 dark:text-blue-200">
          <ImageIcon className="h-6 w-6" />
          {t("SVGファイル・その他の素材", "SVG Files & Other Assets")}
        </h2>
        <p className="mb-4 text-blue-800 dark:text-blue-200">
          {t(
            "SVGファイルやその他の形式のロゴ素材は、Google Driveで提供しています。",
            "SVG files and other logo formats are available on Google Drive.",
          )}
        </p>
        <Button asChild variant="default">
          <a
            href="https://drive.google.com/drive/u/2/folders/14P8S880GRH91gaHQ_ZyAt-7VnpCYZlL7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            {t("Google Driveで素材を見る", "View Assets on Google Drive")}
          </a>
        </Button>
      </div>

      {/* フッター CTA */}
      <div className="space-y-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center dark:from-blue-950/20 dark:to-purple-950/20">
        <h3 className="text-xl font-semibold">
          {t("お問い合わせ", "Contact Us")}
        </h3>
        <p className="text-muted-foreground">
          {t(
            "ロゴの使用に関してご質問がございましたら、お気軽にお問い合わせください。",
            "If you have any questions about logo usage, please feel free to contact us.",
          )}
        </p>
        <Button asChild variant="default">
          <a href="/contact" className="inline-flex items-center gap-2">
            {t("お問い合わせページへ", "Go to Contact Page")}
          </a>
        </Button>
      </div>
    </div>
  )
}
