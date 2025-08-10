import { useTranslation } from "~/hooks/use-translation"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"
import { Separator } from "~/components/ui/separator"

export function GuidelineArticle() {
  const t = useTranslation()

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      {/* ヘッダー */}
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-3xl">
          {t("コミュニティガイドライン", "Community Guidelines")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t(
            "Aipictorsを安全で創造的なコミュニティとして維持するためのガイドラインです",
            "Guidelines to maintain Aipictors as a safe and creative community",
          )}
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">
            {t("基本ルール", "Basic Rules")}
          </TabsTrigger>
          <TabsTrigger value="posting">
            {t("投稿ルール", "Posting Rules")}
          </TabsTrigger>
          <TabsTrigger value="interaction">
            {t("交流ルール", "Interaction Rules")}
          </TabsTrigger>
          <TabsTrigger value="prohibited">
            {t("禁止事項", "Prohibited Actions")}
          </TabsTrigger>
          <TabsTrigger value="reporting">
            {t("報告・対処", "Reporting")}
          </TabsTrigger>
        </TabsList>

        {/* 基本ルール */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                {t("基本的な心構え", "Basic Principles")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold">
                      {t("相互尊重", "Mutual Respect")}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t(
                        "他のユーザーの作品や意見を尊重し、建設的なコミュニケーションを心がけましょう。",
                        "Respect other users' works and opinions, and engage in constructive communication.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold">
                      {t("創造性の促進", "Promoting Creativity")}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t(
                        "AIを活用した創作活動を応援し、新しいアイデアや表現を歓迎します。",
                        "Support AI-powered creative activities and welcome new ideas and expressions.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold">
                      {t("法令遵守", "Legal Compliance")}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t(
                        "日本国内外の法律や規制を遵守し、適切な利用を心がけてください。",
                        "Comply with laws and regulations in Japan and abroad, and use the service appropriately.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t(
                "このガイドラインに違反した場合、警告、投稿削除、アカウント停止などの措置を取らせていただく場合があります。",
                "Violations of these guidelines may result in warnings, post deletion, or account suspension.",
              )}
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* 投稿ルール */}
        <TabsContent value="posting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("作品投稿に関するルール", "Rules for Content Posting")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-green-600">
                  {t("推奨される投稿", "Recommended Posts")}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-medium">
                      {t("AI生成コンテンツ", "AI-Generated Content")}
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        •{" "}
                        {t(
                          "オリジナルのAIイラスト",
                          "Original AI illustrations",
                        )}
                      </li>
                      <li>• {t("創作的なAI写真", "Creative AI photos")}</li>
                      <li>• {t("AI小説・コラム", "AI novels and columns")}</li>
                      <li>
                        •{" "}
                        {t(
                          "AI動画・アニメーション",
                          "AI videos and animations",
                        )}
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-medium">
                      {t("適切な情報開示", "Proper Information Disclosure")}
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        •{" "}
                        {t("使用したAIモデルの記載", "Specify AI models used")}
                      </li>
                      <li>
                        •{" "}
                        {t(
                          "プロンプトの共有（任意）",
                          "Share prompts (optional)",
                        )}
                      </li>
                      <li>
                        • {t("年齢制限の適切な設定", "Appropriate age rating")}
                      </li>
                      <li>
                        • {t("関連タグの正確な付与", "Accurate relevant tags")}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-red-600">
                  {t("禁止される投稿", "Prohibited Posts")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">
                        {t(
                          "著作権侵害コンテンツ",
                          "Copyright Infringing Content",
                        )}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {t(
                          "既存キャラクター、芸能人、実在人物の無断使用",
                          "Unauthorized use of existing characters, celebrities, or real persons",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">
                        {t("不適切なコンテンツ", "Inappropriate Content")}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {t(
                          "極端な暴力、差別、ヘイトスピーチを含む内容",
                          "Content including extreme violence, discrimination, or hate speech",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">
                        {t("年齢制限違反", "Age Rating Violations")}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {t(
                          "R18コンテンツの全年齢向けでの投稿",
                          "Posting R18 content as all-ages",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 交流ルール */}
        <TabsContent value="interaction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("コミュニティ交流のルール", "Community Interaction Rules")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-green-600">
                  {t("望ましい交流", "Encouraged Interactions")}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-medium">
                      {t("建設的なフィードバック", "Constructive Feedback")}
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        •{" "}
                        {t(
                          "作品への具体的な感想",
                          "Specific impressions on works",
                        )}
                      </li>
                      <li>• {t("技術的なアドバイス", "Technical advice")}</li>
                      <li>
                        • {t("創作のヒント共有", "Sharing creative tips")}
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-medium">
                      {t("クリエイター支援", "Creator Support")}
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• {t("いいねでの応援", "Support with likes")}</li>
                      <li>• {t("作品のシェア", "Sharing works")}</li>
                      <li>
                        •{" "}
                        {t(
                          "フォローでの継続応援",
                          "Ongoing support through follows",
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-red-600">
                  {t("禁止される行為", "Prohibited Behaviors")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">
                        {t("ハラスメント", "Harassment")}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {t(
                          "他のユーザーへの嫌がらせ、中傷、脅迫行為",
                          "Harassment, defamation, or threatening behavior toward other users",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">
                        {t("スパム行為", "Spam Activities")}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {t(
                          "同じコメントの連投、無関係な宣伝、bot行為",
                          "Repeated identical comments, irrelevant promotions, bot activities",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">
                        {t("なりすまし", "Impersonation")}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {t(
                          "他人になりすましたアカウント作成・運用",
                          "Creating or operating accounts impersonating others",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 禁止事項 */}
        <TabsContent value="prohibited" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t(
                "以下の行為は利用規約違反として厳しく対処いたします。",
                "The following actions will be strictly dealt with as violations of the terms of service.",
              )}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">
                {t("重大な禁止事項", "Serious Violations")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                  <h3 className="mb-2 font-semibold text-red-800 dark:text-red-200">
                    {t("法的問題に関わる行為", "Legally Problematic Actions")}
                  </h3>
                  <ul className="space-y-1 text-red-700 text-sm dark:text-red-300">
                    <li>
                      •{" "}
                      {t(
                        "児童の性的搾取を示唆するコンテンツ",
                        "Content suggesting child sexual exploitation",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "リベンジポルノや無断撮影画像",
                        "Revenge porn or unauthorized photographs",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "詐欺や違法行為の勧誘",
                        "Fraud or solicitation of illegal activities",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "個人情報の無断公開",
                        "Unauthorized disclosure of personal information",
                      )}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950">
                  <h3 className="mb-2 font-semibold text-orange-800 dark:text-orange-200">
                    {t(
                      "コミュニティを害する行為",
                      "Actions Harmful to the Community",
                    )}
                  </h3>
                  <ul className="space-y-1 text-orange-700 text-sm dark:text-orange-300">
                    <li>
                      •{" "}
                      {t(
                        "差別的発言やヘイトスピーチ",
                        "Discriminatory remarks or hate speech",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "他ユーザーの作品の無断転載",
                        "Unauthorized reposting of other users' works",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t("組織的な荒らし行為", "Organized trolling activities")}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "外部サイトへの不適切な誘導",
                        "Inappropriate redirection to external sites",
                      )}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
                  <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
                    {t("技術的な悪用", "Technical Abuse")}
                  </h3>
                  <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                    <li>
                      •{" "}
                      {t(
                        "システムの脆弱性を突く行為",
                        "Exploiting system vulnerabilities",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "大量のアカウント作成",
                        "Creating large numbers of accounts",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "自動化ツールによる不正利用",
                        "Unauthorized use of automation tools",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "サーバーに過度な負荷をかける行為",
                        "Actions causing excessive server load",
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 報告・対処 */}
        <TabsContent value="reporting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t(
                  "問題のある投稿や行為の報告",
                  "Reporting Problematic Posts or Behavior",
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">
                  {t("報告方法", "How to Report")}
                </h3>
                <ol className="list-inside list-decimal space-y-2 text-sm">
                  <li>
                    {t(
                      "問題のある投稿やコメントの「報告」ボタンをクリック",
                      "Click the 'Report' button on problematic posts or comments",
                    )}
                  </li>
                  <li>
                    {t(
                      "違反理由を選択し、詳細を記入",
                      "Select violation reason and provide details",
                    )}
                  </li>
                  <li>
                    {t("緊急の場合は", "For urgent cases, contact")}
                    <a
                      href="/contact"
                      className="mx-1 text-blue-600 hover:underline"
                    >
                      {t("お問い合わせフォーム", "contact form")}
                    </a>
                    {t("からご連絡", "")}
                  </li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">
                  {t("対処プロセス", "Response Process")}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-4 text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="font-semibold text-blue-600">1</span>
                    </div>
                    <h4 className="mb-1 font-medium">
                      {t("報告受理", "Report Received")}
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      {t("24時間以内に確認", "Reviewed within 24 hours")}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                      <span className="font-semibold text-yellow-600">2</span>
                    </div>
                    <h4 className="mb-1 font-medium">
                      {t("内容調査", "Investigation")}
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      {t(
                        "専門チームが詳細確認",
                        "Detailed review by specialist team",
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <span className="font-semibold text-green-600">3</span>
                    </div>
                    <h4 className="mb-1 font-medium">
                      {t("対処実行", "Action Taken")}
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      {t(
                        "適切な措置を実施",
                        "Appropriate measures implemented",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                  {t("報告する際のお願い", "When Reporting, Please")}
                </h3>
                <ul className="space-y-1 text-blue-700 text-sm dark:text-blue-300">
                  <li>
                    •{" "}
                    {t(
                      "具体的な違反内容を明記してください",
                      "Specify the specific violation",
                    )}
                  </li>
                  <li>
                    •{" "}
                    {t(
                      "可能であれば証拠となる情報を添付してください",
                      "Attach supporting evidence if possible",
                    )}
                  </li>
                  <li>
                    • {t("虚偽の報告は避けてください", "Avoid false reports")}
                  </li>
                  <li>
                    •{" "}
                    {t(
                      "個人的な恨みでの報告は控えてください",
                      "Refrain from reporting based on personal grudges",
                    )}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* フッター */}
      <div className="space-y-4 border-t pt-8 text-center">
        <p className="text-muted-foreground text-sm">
          {t(
            "このガイドラインは必要に応じて更新される場合があります。最新版をご確認ください。",
            "These guidelines may be updated as needed. Please check the latest version.",
          )}
        </p>
        <div className="flex justify-center space-x-4">
          <a href="/contact" className="text-blue-600 text-sm hover:underline">
            {t("お問い合わせ", "Contact")}
          </a>
          <a href="/terms" className="text-blue-600 text-sm hover:underline">
            {t("利用規約", "Terms of Service")}
          </a>
          <a href="/help" className="text-blue-600 text-sm hover:underline">
            {t("使い方ガイド", "User Guide")}
          </a>
        </div>
      </div>
    </div>
  )
}
