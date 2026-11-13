import { PictorChan3dSection } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-3d-section"
import { useTranslation } from "~/hooks/use-translation"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Button } from "~/components/ui/button"
import { Copy, Download, ExternalLink, Heart, Star } from "lucide-react"
import { useToast } from "~/hooks/use-toast"
import { Link } from "~/lib/app/locale-router"

export function PictorChanProfile () {
  const t = useTranslation()
  const { toast } = useToast()

  const handleCopyPrompt = () => {
    const prompt = `masterpiece, best quality, ultra-detailed, illustration
pktc,1girl, solo, multicolored hair, ahoge, colored inner hair, blush stickers, orange hair, blue hair, long hair, bangs, green hair, blue eyes,
maid, maid headdress, maid apron, teacup, saucer, teapot,
simple background, white background,ahoge, full body, gravure pose, looking at viewer,`
    navigator.clipboard.writeText(prompt)
    toast({
      title: t("コピーしました", "Copied"),
      description: t(
        "プロンプトをクリップボードにコピーしました",
        "Prompt copied to clipboard",
      ),
    })
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      {/* ヘッダー */}
      <div className="space-y-4 text-center">
        <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-gradient-to-r from-orange-400 via-blue-400 to-green-400 p-1">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
            <img
              src="https://assets.aipictors.com/6308eaf00a05fd7c3001b709dbe8e39a.webp"
              alt="ぴくたーちゃん"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>
        <h1 className="font-bold text-4xl">
          <span className="bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 bg-clip-text text-transparent">
            ぴくたーちゃん
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          {t(
            "Aipictorsの公式マスコットキャラクター",
            "Official mascot character of Aipictors",
          )}
        </p>
      </div>

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {t("基本情報", "Basic Information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-16 font-medium text-muted-foreground text-sm">
                  {t("性別", "Gender")}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-pink-100 text-pink-800"
                >
                  {t("女の子", "Girl")}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-16 font-medium text-muted-foreground text-sm">
                  {t("年齢", "Age")}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {t("不明", "Unknown")}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-16 font-medium text-muted-foreground text-sm">
                  {t("誕生日", "Birthday")}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  11月21日
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-16 font-medium text-muted-foreground text-sm">
                  {t("好きな食べ物", "Favorite Food")}
                </span>
                <div className="flex items-center gap-2">
                  <span>🥔</span>
                  <span className="text-sm">{t("じゃがいも", "Potato")}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-16 font-medium text-muted-foreground text-sm">
                  {t("趣味", "Hobby")}
                </span>
                <div className="flex items-center gap-2">
                  <span>🎨</span>
                  <span className="text-sm">
                    {t(
                      "Aipictorsでみんなの作品を閲覧すること",
                      "Browsing everyone's works on Aipictors",
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg bg-gradient-to-r from-orange-50 via-blue-50 to-green-50 p-6 dark:from-orange-950 dark:via-blue-950 dark:to-green-950">
            <h3 className="mb-3 font-semibold text-lg">
              {t("ぴくたーちゃんについて", "About Pictor-chan")}
            </h3>
            <p className="text-sm leading-relaxed">
              {t(
                "ぴくたーちゃんは、Aipictorsが開設された2022年11月21日に誕生した公式マスコットキャラクターです。オレンジ、ブルー、グリーンの美しいマルチカラーヘアが特徴的で、いつも学生服を着ています。みんなの素敵な作品を見ることが大好きで、今日も楽しそうにAipictorsを巡回しています。",
                "Pictor-chan is the official mascot character who was born on November 21, 2022, when Aipictors was launched. She is characterized by her beautiful multicolored hair in orange, blue, and green, and always wears a maid outfit. She loves looking at everyone's wonderful works and happily browses Aipictors every day.",
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ミニゲームと 3D モデルの配布 */}
      <PictorChan3dSection />

      {/* Discordでの交流 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💬</span>
            {t("ぴくたーちゃんと話そう", "Chat with Pictor-chan")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-purple-950 dark:to-pink-950">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-lg">
              <span>🎮</span>
              {t(
                "Discordでぴくたーちゃんと会話",
                "Chat with Pictor-chan on Discord",
              )}
            </h3>
            <p className="mb-4 text-sm leading-relaxed">
              {t(
                "AipictorsのDiscordサーバーにある専用チャンネルで、ぴくたーちゃんと直接会話することができます！AIで動いているぴくたーちゃんが、みなさんの質問や雑談に答えてくれます。",
                "You can chat directly with Pictor-chan in the dedicated channel on Aipictors Discord server! AI-powered Pictor-chan will answer your questions and chat with you.",
              )}
            </p>
            <div className="space-y-3">
              <h4 className="font-medium">
                {t("できること", "What you can do")}
              </h4>
              <ul className="space-y-1 text-sm">
                <li>
                  •{" "}
                  {t("ぴくたーちゃんと雑談", "Chat casually with Pictor-chan")}
                </li>
                <li>
                  •{" "}
                  {t("Aipictorsについて質問", "Ask questions about Aipictors")}
                </li>
                <li>
                  • {t("AI生成のコツを聞く", "Get tips for AI generation")}
                </li>
                <li>• {t("創作の相談", "Discuss your creative work")}</li>
              </ul>
            </div>
            <div className="mt-4">
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <a
                  href="https://discord.gg/7jA2MmtvtR"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t(
                    "Discordでぴくたーちゃんと話す",
                    "Chat with Pictor-chan on Discord",
                  )}
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI生成用プロンプト */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤖</span>
            {t("AI生成用プロンプト", "AI Generation Prompt")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {t(
              "ぴくたーちゃんをAIで生成する際に使用できるプロンプトです。",
              "Prompt that can be used when generating Pictor-chan with AI.",
            )}
          </p>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <pre className="whitespace-pre-wrap text-sm">
              {`masterpiece, best quality, ultra-detailed, illustration
pktc,1girl, solo, multicolored hair, ahoge, colored inner hair, blush stickers, orange hair, blue hair, long hair, bangs, green hair, blue eyes,
maid, maid headdress, maid apron, teacup, saucer, teapot,
simple background, white background,ahoge, full body, gravure pose, looking at viewer,`}
            </pre>
          </div>
          <Button
            onClick={handleCopyPrompt}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Copy className="mr-2 h-4 w-4" />
            {t("プロンプトをコピー", "Copy Prompt")}
          </Button>
        </CardContent>
      </Card>

      {/* LoRAダウンロード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-500" />
            {t("LoRAモデル", "LoRA Model")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {t(
              "ぴくたーちゃんを生成するためのLoRAモデルをダウンロードできます。",
              "You can download the LoRA model for generating Pictor-chan.",
            )}
          </p>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">
                  {t("ぴくたーちゃん LoRA", "Pictor-chan LoRA")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("Google Drive", "Google Drive")}
                </p>
              </div>
              <Button asChild>
                <a
                  href="https://drive.google.com/drive/folders/1Cu8Y1SQdc1UKJN2OKdYBCP-Q2HTmvf8P?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("ダウンロード", "Download")}
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ギャラリー / 作品一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🖼️</span>
            {t("ぴくたーちゃんの作品を見る", "View Pictor-chan Works")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-orange-300 border-dashed bg-gradient-to-r from-orange-50 via-blue-50 to-green-50 p-8 dark:from-orange-950/20 dark:via-blue-950/20 dark:to-green-950/20">
            <div className="text-center">
              <div className="mb-4">
                <img
                  src="https://assets.aipictors.com/pictor-chan-01.webp"
                  alt="ぴくたーちゃん 立ち絵"
                  className="mx-auto h-48 w-auto rounded-lg object-contain"
                />
              </div>
              <h3 className="mb-2 font-semibold text-lg">
                {t(
                  "みんなが作ったぴくたーちゃん",
                  "Pictor-chan created by everyone",
                )}
              </h3>
              <p className="mb-4 text-muted-foreground text-sm">
                {t(
                  "Aipictorsにはたくさんのぴくたーちゃんイラストが投稿されています。「ぴくたーちゃん」タグで探してみましょう！",
                  "Many Pictor-chan illustrations are posted on Aipictors. Search with the 'ぴくたーちゃん' tag!",
                )}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 text-white hover:from-orange-600 hover:via-blue-600 hover:to-green-600"
                >
                  <Link to="/tags/ぴくたーちゃん">
                    <span>🏷️</span>
                    {t(
                      "#ぴくたーちゃん の作品を見る",
                      "View #ぴくたーちゃん works",
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用上の注意 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {t("使用上の注意", "Usage Guidelines")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
            <ul className="space-y-2 text-sm">
              <li>
                •{" "}
                {t(
                  "ぴくたーちゃんは個人利用・商用利用ともに自由にご利用いただけます",
                  "Pictor-chan can be used freely for both personal and commercial purposes",
                )}
              </li>
              <li>
                •{" "}
                {t(
                  "ただし、不適切な内容や他者を傷つける表現での使用はご遠慮ください",
                  "However, please refrain from using it for inappropriate content or expressions that may harm others",
                )}
              </li>
              <li>
                •{" "}
                {t(
                  "ぴくたーちゃんを使用した作品をAipictorsに投稿する際は、「pictor-chan」「ぴくたーちゃん」タグなどを付けることを推奨いたします",
                  "When posting works featuring Pictor-chan on Aipictors, please use the 'pktc' and 'ぴくたーちゃん' tags",
                )}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* フッター */}
      <div className="space-y-4 border-t pt-8 text-center">
        <p className="text-muted-foreground text-sm">
          {t(
            "ぴくたーちゃんと一緒に、素敵な創作活動を楽しみましょう！",
            "Let's enjoy wonderful creative activities together with Pictor-chan!",
          )}
        </p>
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className="bg-gradient-to-r from-orange-100 via-blue-100 to-green-100"
          >
            💝{" "}
            {t(
              "みんなで作る、みんなのぴくたーちゃん",
              "Pictor-chan created by everyone, for everyone",
            )}
          </Badge>
        </div>
      </div>
    </div>
  )
}
