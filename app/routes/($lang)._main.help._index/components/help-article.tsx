import { useTranslation } from "~/hooks/use-translation"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Link } from "@remix-run/react"

export function HelpArticle() {
  const t = useTranslation()

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      {/* ヘッダー */}
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-3xl">
          {t("Aipictors 使い方ガイド", "Aipictors User Guide")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t(
            "Aipictorsの機能や使い方を詳しく説明します",
            "Learn about Aipictors features and how to use them",
          )}
        </p>
      </div>

      <Tabs defaultValue="quickstart" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 text-xs sm:grid-cols-4 sm:text-sm lg:grid-cols-8">
          <TabsTrigger value="quickstart" className="px-2 py-2 sm:px-4">
            {t("クイックスタート", "Quick Start")}
          </TabsTrigger>
          <TabsTrigger value="overview" className="px-2 py-2 sm:px-4">
            {t("概要", "Overview")}
          </TabsTrigger>
          <TabsTrigger value="registration" className="px-2 py-2 sm:px-4">
            {t("登録", "Registration")}
          </TabsTrigger>
          <TabsTrigger value="posting" className="px-2 py-2 sm:px-4">
            {t("投稿", "Posting")}
          </TabsTrigger>
          <TabsTrigger value="features" className="px-2 py-2 sm:px-4">
            {t("機能", "Features")}
          </TabsTrigger>
          <TabsTrigger value="generation" className="px-2 py-2 sm:px-4">
            {t("AI生成", "AI Generation")}
          </TabsTrigger>
          <TabsTrigger value="community" className="px-2 py-2 sm:px-4">
            {t("コミュニティ", "Community")}
          </TabsTrigger>
          <TabsTrigger value="pictor-chan" className="px-2 py-2 sm:px-4">
            {t("ぴくたーちゃん", "Pictor-chan")}
          </TabsTrigger>
        </TabsList>

        {/* クイックスタートタブ */}
        <TabsContent value="quickstart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀{" "}
                {t(
                  "5分で始めるAipictors",
                  "Get Started with Aipictors in 5 Minutes",
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-blue-950 dark:to-purple-950">
                <h3 className="mb-4 font-semibold text-lg">
                  {t("初めての方へ", "For First-Time Users")}
                </h3>
                <p className="mb-4">
                  {t(
                    "Aipictorsは登録前でも多くの作品を閲覧できます。まずはサイトを探索して、どんな作品があるかご覧ください。",
                    "You can browse many works on Aipictors without registering. First, explore the site to see what kind of works are available.",
                  )}
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-white p-4 dark:bg-gray-800">
                    <h4 className="mb-2 font-medium">
                      {t("✨ 作品を見てみる", "✨ Browse Works")}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t(
                        "トップページで最新作品やランキングをチェック",
                        "Check latest works and rankings on the homepage",
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-4 dark:bg-gray-800">
                    <h4 className="mb-2 font-medium">
                      {t("🔍 検索してみる", "🔍 Try Searching")}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t(
                        "興味のあるタグやキーワードで作品を検索",
                        "Search for works by tags or keywords you're interested in",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {t("ステップバイステップガイド", "Step-by-Step Guide")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    <Badge variant="outline" className="mt-1">
                      1
                    </Badge>
                    <div>
                      <h4 className="font-medium">
                        {t(
                          "アカウント作成（任意）",
                          "Create Account (Optional)",
                        )}
                      </h4>
                      <p className="mt-1 text-muted-foreground text-sm">
                        {t(
                          "より多くの機能を使いたい場合は、無料でアカウントを作成できます。メールアドレスまたはSNSアカウントで簡単登録。",
                          "If you want to use more features, you can create a free account. Easy registration with email or SNS account.",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
                    <Badge variant="outline" className="mt-1">
                      2
                    </Badge>
                    <Link to="/settings/profile">
                      <h4 className="cursor-pointer font-medium">
                        {t("プロフィール設定", "Set Up Profile")}
                      </h4>
                      <p className="mt-1 text-muted-foreground text-sm">
                        {t(
                          "アバター画像やプロフィール文を設定して、自分らしさを表現しましょう。",
                          "Set up your avatar and profile description to express your personality.",
                        )}
                      </p>
                    </Link>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    <Badge variant="outline" className="mt-1">
                      3
                    </Badge>
                    <div>
                      <h4 className="font-medium">
                        {t("作品投稿を始める", "Start Posting Works")}
                      </h4>
                      <p className="mt-1 text-muted-foreground text-sm">
                        {t(
                          "AI生成した作品や創作物を投稿してみましょう。適切なタグ付けでより多くの人に見てもらえます。",
                          "Try posting your AI-generated works or creations. Proper tagging helps more people discover your work.",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    <Badge variant="outline" className="mt-1">
                      4
                    </Badge>
                    <div>
                      <h4 className="font-medium">
                        {t("コミュニティ参加", "Join the Community")}
                      </h4>
                      <p className="mt-1 text-muted-foreground text-sm">
                        {t(
                          "他のユーザーをフォローしたり、いいねやコメントで交流を楽しみましょう。",
                          "Follow other users and enjoy interacting through likes and comments.",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                <h4 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
                  💡 {t("お役立ちヒント", "Helpful Tips")}
                </h4>
                <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <li>
                    •{" "}
                    {t(
                      "投稿前に利用規約とガイドラインを確認しましょう",
                      "Check the terms of service and guidelines before posting",
                    )}
                  </li>
                  <li>
                    •{" "}
                    {t(
                      "タグは作品の内容を正確に表すものを選びましょう",
                      "Choose tags that accurately represent your work's content",
                    )}
                  </li>
                  <li>
                    •{" "}
                    {t(
                      "他のユーザーと積極的に交流することで、フォロワーが増えやすくなります",
                      "Active interaction with other users helps increase followers",
                    )}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Aipictorsとは", "What is Aipictors")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                {t(
                  "AipictorsはAIイラスト・小説・動画などのクリエイティブコンテンツを投稿・共有できるプラットフォームです。",
                  "Aipictors is a platform for posting and sharing creative content such as AI illustrations, novels, and videos.",
                )}
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <h3 className="mb-2 font-semibold">
                    {t("AI生成コンテンツ", "AI-Generated Content")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      "AI技術を使用して作成されたイラスト、小説、動画を投稿・閲覧できます",
                      "Post and view illustrations, novels, and videos created using AI technology",
                    )}
                  </p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <h3 className="mb-2 font-semibold">
                    {t("クリエイター支援", "Creator Support")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      "クリエイターを支援する機能やコミュニティ機能が充実しています",
                      "Rich features and community functions to support creators",
                    )}
                  </p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <h3 className="mb-2 font-semibold">
                    {t("無料で利用", "Free to Use")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      "基本機能は無料でご利用いただけます",
                      "Basic features are available for free",
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("主な機能", "Main Features")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {t("作品投稿", "Content Posting")}
                </Badge>
                <Badge variant="secondary">
                  {t("AI画像生成", "AI Image Generation")}
                </Badge>
                <Badge variant="secondary">
                  {t("いいね・コメント", "Likes & Comments")}
                </Badge>
                <Badge variant="secondary">
                  {t("フォロー機能", "Follow Feature")}
                </Badge>
                <Badge variant="secondary">
                  {t("コレクション", "Collections")}
                </Badge>
                <Badge variant="secondary">{t("ランキング", "Rankings")}</Badge>
                <Badge variant="secondary">{t("タグ検索", "Tag Search")}</Badge>
                <Badge variant="secondary">
                  {t("プロフィール", "Profile")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 登録タブ */}
        <TabsContent value="registration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("ユーザー登録について", "About User Registration")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                  {t(
                    "登録前にお読みください",
                    "Please Read Before Registration",
                  )}
                </h3>
                <p className="text-blue-700 text-sm dark:text-blue-300">
                  {t(
                    "ユーザー登録は無料です。登録することで、作品の投稿、いいね、コメント、フォローなどの機能をご利用いただけます。",
                    "User registration is free. By registering, you can use features such as posting content, liking, commenting, and following.",
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">
                  {t(
                    "登録に必要な情報",
                    "Required Information for Registration",
                  )}
                </h3>
                <ul className="list-inside list-disc space-y-2 text-sm">
                  <li>
                    {t(
                      "メールアドレスまたはソーシャルアカウント（Google、Twitter、Line）",
                      "Email address or social account (Google, Twitter、Line)",
                    )}
                  </li>
                  <li>
                    {t(
                      "ユーザー名（後で変更可能）",
                      "Username (can be changed later)",
                    )}
                  </li>
                  <li>
                    {t(
                      "年齢確認（18歳以上の場合）",
                      "Age verification (if 18 or older)",
                    )}
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">
                  {t("個人情報の取り扱い", "Personal Information Handling")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(
                    "ご登録いただいた個人情報は、サービスの提供とユーザーサポートのためにのみ使用します。詳細は",
                    "Personal information provided during registration will only be used for service provision and user support. For details, please see our",
                  )}
                  <a
                    href="/privacy"
                    className="ml-1 text-blue-600 hover:underline"
                  >
                    {t("プライバシーポリシー", "Privacy Policy")}
                  </a>
                  {t("をご確認ください。", ".")}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">
                  {t("登録手順", "Registration Steps")}
                </h3>
                <ol className="list-inside list-decimal space-y-2 text-sm">
                  <li>
                    {t(
                      "右上の「ログイン」ボタンをクリック",
                      "Click the 'Login' button in the top right",
                    )}
                  </li>
                  <li>
                    {t(
                      "Google、Twitter、Lineアカウントでログイン",
                      "Log in with Google, Twitter, or Discord account",
                    )}
                  </li>
                  <li>
                    {t("プロフィール情報を設定", "Set up profile information")}
                  </li>
                  <li>{t("利用設定を選択", "Select usage preferences")}</li>
                  <li>{t("登録完了", "Registration complete")}</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 投稿タブ */}
        <TabsContent value="posting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("作品の投稿方法", "How to Post Content")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">
                    {t("画像投稿", "Image Posting")}
                  </h3>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {t(
                      "イラスト、写真、AI生成画像などを投稿できます",
                      "Post illustrations, photos, AI-generated images, etc.",
                    )}
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      •{" "}
                      {t(
                        "対応形式: JPEG、PNG、GIF、WEBP、BMP",
                        "Supported: JPEG、PNG、GIF、WEBP、BMP",
                      )}
                    </li>
                    <li>• {t("最大32MB", "Max 32MB")}</li>
                    <li>
                      • {t("複数枚同時投稿可能", "Multiple images allowed")}
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">
                    {t("小説・コラム投稿", "Novel/Column Posting")}
                  </h3>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {t(
                      "小説、エッセイ、コラムなどのテキスト作品を投稿",
                      "Post novels, essays, columns and other text content",
                    )}
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      •{" "}
                      {t(
                        "Markdownフォーマット対応",
                        "Markdown format supported",
                      )}
                    </li>
                    <li>• {t("表紙画像設定可能", "Cover image can be set")}</li>
                    <li>• {t("章分け機能", "Chapter division feature")}</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">
                    {t("動画投稿", "Video Posting")}
                  </h3>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {t(
                      "アニメーション、動画作品を投稿できます",
                      "Post animations and video content",
                    )}
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • {t("対応形式: MP4, WEBM", "Supported: MP4, WEBM")}
                    </li>
                    <li>• {t("最大32MB", "Max 32MB")}</li>
                    <li>
                      • {t("サムネイル自動生成", "Auto thumbnail generation")}
                    </li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">
                  {t("投稿時の設定項目", "Settings When Posting")}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-medium">
                      {t("基本設定", "Basic Settings")}
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• {t("タイトル", "Title")}</li>
                      <li>• {t("説明文", "Description")}</li>
                      <li>• {t("タグ", "Tags")}</li>
                      <li>• {t("年齢制限", "Age Rating")}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">
                      {t("詳細設定", "Advanced Settings")}
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• {t("AIツール情報", "AI Tool Information")}</li>
                      <li>• {t("プロンプト公開設定", "Prompt Visibility")}</li>
                      <li>• {t("コメント受付設定", "Comment Settings")}</li>
                      <li>
                        • {t("作品公開範囲設定など", "Download Permission")}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 機能タブ */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("主要機能の使い方", "How to Use Main Features")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-blue-500 border-l-4 pl-4">
                  <h3 className="mb-2 font-semibold">
                    {t("いいね・ブックマーク", "Likes & Bookmarks")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      "気に入った作品にいいねを押したり、後で見返すためにブックマークできます。ブックマークはコレクションフォルダで整理可能です。",
                      "Like favorite works or bookmark them to view later. Bookmarks can be organized in collection folders.",
                    )}
                  </p>
                </div>

                <div className="border-green-500 border-l-4 pl-4">
                  <h3 className="mb-2 font-semibold">
                    {t("フォロー機能", "Follow Feature")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      "お気に入りのクリエイターをフォローすると、その人の新しい作品がフィードに表示されます。",
                      "Follow your favorite creators to see their new works in your feed.",
                    )}
                  </p>
                </div>

                <div className="border-purple-500 border-l-4 pl-4">
                  <h3 className="mb-2 font-semibold">
                    {t("コメント・スタンプ", "Comments & Stamps")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      "作品にコメントを投稿したり、スタンプで気軽に反応を示すことができます。",
                      "Post comments on works or use stamps to show quick reactions.",
                    )}
                  </p>
                </div>

                <div className="border-red-500 border-l-4 pl-4">
                  <h3 className="mb-2 font-semibold">
                    {t("タグ検索", "Tag Search")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      "タグを使って興味のある作品を検索できます。人気のタグやトレンドも確認できます。",
                      "Search for works of interest using tags. You can also check popular tags and trends.",
                    )}
                  </p>
                </div>

                <div className="border-yellow-500 border-l-4 pl-4">
                  <h3 className="mb-2 font-semibold">
                    {t("ランキング", "Rankings")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      "日間・週間・月間の人気作品ランキングを確認できます。新しい作品を発見するのに便利です。",
                      "Check daily, weekly, and monthly popular work rankings. Useful for discovering new content.",
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI生成タブ */}
        <TabsContent value="generation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("AI画像生成機能", "AI Image Generation Feature")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-950 dark:to-pink-950">
                <h3 className="mb-2 font-semibold">
                  {t("AI生成機能について", "About AI Generation Feature")}
                </h3>
                <p className="text-sm">
                  {t(
                    "Aipictorsでは、最新のAI技術を使用して高品質な画像を生成できます。初心者でも簡単にAIイラストを作成できるよう、直感的なインターフェースを提供しています。",
                    "Aipictors allows you to generate high-quality images using the latest AI technology. We provide an intuitive interface so that even beginners can easily create AI illustrations.",
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">{t("使い方", "How to Use")}</h3>
                <ol className="list-inside list-decimal space-y-2 text-sm">
                  <li>
                    {t(
                      "ナビゲーションメニューから「AI生成」を選択",
                      "Select 'AI Generation' from the navigation menu",
                    )}
                  </li>
                  <li>
                    {t(
                      "使用したいAIモデルを選択",
                      "Choose the AI model you want to use",
                    )}
                  </li>
                  <li>
                    {t(
                      "プロンプト（指示文）を入力",
                      "Enter a prompt (instruction text)",
                    )}
                  </li>
                  <li>
                    {t(
                      "生成設定（画像サイズ、品質など）を調整",
                      "Adjust generation settings (image size, quality, etc.)",
                    )}
                  </li>
                  <li>
                    {t(
                      "「生成」ボタンをクリック",
                      "Click the 'Generate' button",
                    )}
                  </li>
                  <li>
                    {t(
                      "生成された画像を確認し、気に入ったものを投稿",
                      "Review the generated images and post the ones you like",
                    )}
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">
                  {t("プロンプトのコツ", "Prompt Tips")}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-medium text-green-600">
                      {t("良い例", "Good Examples")}
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li>
                        •{" "}
                        {t(
                          "具体的な描写を含める",
                          "Include specific descriptions",
                        )}
                      </li>
                      <li>
                        • {t("画風やスタイルを指定", "Specify art style")}
                      </li>
                      <li>
                        •{" "}
                        {t("色調や雰囲気を明記", "Specify color tone and mood")}
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-medium text-red-600">
                      {t("避けるべき", "What to Avoid")}
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li>• {t("曖昧すぎる表現", "Too vague expressions")}</li>
                      <li>
                        • {t("矛盾する指示", "Contradictory instructions")}
                      </li>
                      <li>• {t("性的なコンテンツ", "Sexual content")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* コミュニティタブ */}
        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("コミュニティ機能", "Community Features")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">
                    {t("作品への反応", "Reactions to Works")}
                  </h3>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {t(
                      "他のユーザーの作品に対して、いいね、コメント、スタンプで反応できます",
                      "React to other users' works with likes, comments, and stamps",
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">👍 {t("いいね", "Like")}</Badge>
                    <Badge variant="outline">
                      💬 {t("コメント", "Comment")}
                    </Badge>
                    <Badge variant="outline">
                      🎨 {t("スタンプ", "Stamps")}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">
                    {t("クリエイター同士の交流", "Creator Interactions")}
                  </h3>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {t(
                      "フォロー機能を通じて、お気に入りのクリエイターと繋がることができます",
                      "Connect with your favorite creators through the follow feature",
                    )}
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>• {t("フォロー・フォロワー", "Follow・Followers")}</li>
                    <li>
                      •{" "}
                      {t("作品へのコメント交換", "Comment exchanges on works")}
                    </li>
                    <li>• {t("コラボレーション", "Collaborations")}</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">
                    {t("イベントやコンテスト", "Events and Contests")}
                  </h3>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {t(
                      "定期的に開催されるイベントやコンテストに参加できます",
                      "Participate in regularly held events and contests",
                    )}
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>
                      • {t("月間テーマコンテスト", "Monthly theme contests")}
                    </li>
                    <li>• {t("季節イベント", "Seasonal events")}</li>
                    <li>• {t("コラボ企画", "Collaboration projects")}</li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-950 dark:to-purple-950">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <span className="text-blue-600">💬</span>
                    {t("Discordコミュニティ", "Discord Community")}
                  </h3>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {t(
                      "Aipictors公式Discordサーバーでリアルタイムに他のクリエイターと交流できます",
                      "Join the official Aipictors Discord server to interact with other creators in real-time",
                    )}
                  </p>
                  <div className="space-y-2">
                    <ul className="space-y-1 text-sm">
                      <li>
                        •{" "}
                        {t(
                          "作品共有・フィードバック",
                          "Work sharing & feedback",
                        )}
                      </li>
                      <li>
                        •{" "}
                        {t(
                          "技術的な質問・相談",
                          "Technical questions & consultation",
                        )}
                      </li>
                      <li>
                        • {t("イベント情報の共有", "Event information sharing")}
                      </li>
                    </ul>
                    <div className="mt-3">
                      <a
                        href="https://discord.gg/7jA2MmtvtR"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700"
                      >
                        <span>🚀</span>
                        {t("Discordに参加", "Join Discord")}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">
                  {t("コミュニティガイドライン", "Community Guidelines")}
                </h3>
                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
                  <p className="text-sm">
                    {t(
                      "Aipictorsは安全で創造的なコミュニティを目指しています。投稿や交流の際は",
                      "Aipictors aims to be a safe and creative community. When posting or interacting, please refer to our",
                    )}
                    <a
                      href="/guideline"
                      className="mx-1 text-blue-600 hover:underline"
                    >
                      {t("コミュニティガイドライン", "Community Guidelines")}
                    </a>
                    {t("をご確認ください。", ".")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ぴくたーちゃんタブ */}
        <TabsContent value="pictor-chan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("ぴくたーちゃん紹介", "Introducing Pictor-chan")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-32 w-32 overflow-hidden rounded-full bg-gradient-to-r from-orange-400 via-blue-400 to-green-400 p-1">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                    <img
                      src="https://assets.aipictors.com/pictor-chan-01.webp"
                      alt="ぴくたーちゃん"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="font-bold text-2xl">
                  <span className="bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 bg-clip-text text-transparent">
                    ぴくたーちゃん
                  </span>
                </h3>
                <p className="text-muted-foreground">
                  {t(
                    "Aipictorsの公式マスコットキャラクター",
                    "Official mascot character of Aipictors",
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-gradient-to-r from-orange-50 via-blue-50 to-green-50 p-4 dark:from-orange-950 dark:via-blue-950 dark:to-green-950">
                  <h4 className="mb-2 font-semibold">
                    {t("プロフィール", "Profile")}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div>
                      <span className="font-medium">
                        {t("性別", "Gender")}:
                      </span>{" "}
                      {t("女の子", "Girl")}
                    </div>
                    <div>
                      <span className="font-medium">{t("年齢", "Age")}:</span>{" "}
                      {t("2歳", "2 years old")}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t("誕生日", "Birthday")}:
                      </span>{" "}
                      11月21日
                    </div>
                    <div>
                      <span className="font-medium">
                        {t("好きな食べ物", "Favorite Food")}:
                      </span>{" "}
                      🥔 {t("じゃがいも", "Potato")}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">{t("趣味", "Hobby")}:</span>{" "}
                    {t(
                      "Aipictorsでみんなの作品を閲覧すること",
                      "Browsing everyone's works on Aipictors",
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to="/pictor-chan"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 px-6 py-3 font-medium text-white transition-all hover:scale-105"
                  >
                    <span>✨</span>
                    {t(
                      "ぴくたーちゃんの詳細ページ",
                      "Pictor-chan Details Page",
                    )}
                    <span>✨</span>
                  </Link>
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    💡{" "}
                    {t(
                      "詳細ページでは、AI生成用のプロンプトやLoRAモデルのダウンロードもできます！",
                      "On the details page, you can also download AI generation prompts and LoRA models!",
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* フッター */}
      <div className="space-y-4 border-t pt-8 text-center">
        <p className="text-muted-foreground text-sm">
          {t(
            "その他ご不明な点がございましたら、お気軽にお問い合わせください。",
            "If you have any other questions, please feel free to contact us.",
          )}
        </p>
        <div className="flex justify-center space-x-4">
          <a href="/contact" className="text-blue-600 text-sm hover:underline">
            {t("お問い合わせ", "Contact")}
          </a>
          <a href="/terms" className="text-blue-600 text-sm hover:underline">
            {t("利用規約", "Terms of Service")}
          </a>
          <a href="/privacy" className="text-blue-600 text-sm hover:underline">
            {t("プライバシーポリシー", "Privacy Policy")}
          </a>
        </div>
      </div>
    </div>
  )
}
