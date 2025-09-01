import { useState } from "react"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import {
  CalendarIcon,
  StarIcon,
  RocketIcon,
  SettingsIcon,
  MessageCircleIcon,
  TrendingUpIcon,
  UsersIcon,
  ImageIcon,
  DatabaseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  HeartIcon,
  EyeIcon,
  ZapIcon,
  AwardIcon,
  PaintbrushIcon,
  SmartphoneIcon,
  BrainIcon,
  ThumbsUpIcon,
  ShareIcon,
  PartyPopperIcon,
} from "lucide-react"
import { cn } from "~/lib/utils"

type TimelineItem = {
  id: string
  date: string
  year: number
  title: string
  description: string
  category: "launch" | "feature" | "event" | "update" | "milestone" | "planned"
  icon: React.ReactNode
  highlight?: boolean
  status?: "completed" | "in-progress" | "planned"
  details?: string
}

export function RoadmapPage() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // 過去から未来まで統合したタイムライン
  const timelineItems: TimelineItem[] = [
    {
      id: "launch",
      date: "2022年11月21日",
      year: 2022,
      title: "AIピクターズ サービス立ち上げ",
      description:
        "AIイラストを気軽に投稿して交流できる場を公開。投稿・コメント・スタンプ・ランキングなど、まずは基本機能から。",
      category: "launch",
      icon: <RocketIcon className="h-5 w-5" />,
      highlight: false,
      status: "completed",
    },
    {
      id: "profile-translation",
      date: "2023年2月8日",
      year: 2023,
      title: "プロフィール設定と自動翻訳機能",
      description:
        "プロフィール編集機能と自動翻訳を追加。海外のユーザーともより交流しやすく。",
      category: "feature",
      icon: <UsersIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "stamp-plaza",
      date: "2023年2月14日",
      year: 2023,
      title: "スタンプ広場と作成スタンプ機能",
      description:
        "スタンプ広場をオープン。オリジナルスタンプが作れて、コメントでも使えるように。",
      category: "feature",
      icon: <HeartIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "theater-collection",
      date: "2023年7月",
      year: 2023,
      title: "シアターモードとコレクション機能",
      description:
        "画面いっぱいで作品を楽しめるシアターモードと、お気に入り作品を集められるコレクション機能を追加。",
      category: "feature",
      icon: <EyeIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "donation-dialog",
      date: "2023年8月31日",
      year: 2023,
      title: "投げ銭機能と作品ダイアログ機能",
      description:
        "クリエイターを応援する投げ銭機能と、作品詳細ダイアログを追加。投稿数も10万件を突破！",
      category: "milestone",
      icon: <AwardIcon className="h-5 w-5" />,
      highlight: false,
      status: "completed",
    },
    {
      id: "subscription-ai-generation",
      date: "2023年9月11日",
      year: 2023,
      title: "Aipictors+とAI画像生成機能",
      description:
        "月額2,000円のAipictors+を開始。サイト内でAI画像生成ができるように。LoRAやモデル切り替えも充実。",
      category: "feature",
      icon: <BrainIcon className="h-5 w-5" />,
      highlight: false,
      status: "completed",
    },
    {
      id: "mobile-app",
      date: "2023年11月20日",
      year: 2023,
      title: "モバイルアプリリリース",
      description:
        "日本初のAIイラスト投稿アプリが誕生。iPhone・Androidどちらでも使えて、投稿数は18万件を突破。",
      category: "launch",
      icon: <SmartphoneIcon className="h-5 w-5" />,
      highlight: false,
      status: "completed",
    },
    {
      id: "chromaft-v4",
      date: "2024年2月26日",
      year: 2024,
      title: "ChromaFT_v4モデル追加",
      description:
        "新AIモデル「ChromaFT_v4」を追加。アニメ調のイラストがより鮮やかで安定して生成できるように。",
      category: "update",
      icon: <PaintbrushIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "controlnet-highres",
      date: "2024年4月6日",
      year: 2024,
      title: "ControlNet/高解像度生成",
      description:
        "ControlNetでポーズ指定ができるように。高解像度での生成にも対応。UIもより使いやすくリニューアル。",
      category: "feature",
      icon: <ImageIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "summer-event",
      date: "2024年7月14日",
      year: 2024,
      title: "夏休み水着企画イベント",
      description:
        "夏の水着イラストを大募集。みんなで盛り上がって2,912作品も集まりました！",
      category: "event",
      icon: <PartyPopperIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "flux-model",
      date: "2024年10月26日",
      year: 2024,
      title: "Flux.1搭載",
      description:
        "最新の「Flux.1」モデルを搭載。たった2秒で高品質な画像が生成できて、日本語にもしっかり対応。",
      category: "update",
      icon: <ZapIcon className="h-5 w-5" />,
      highlight: false,
      status: "completed",
    },
    {
      id: "domain-renewal",
      date: "2024年11月18日",
      year: 2024,
      title: "ドメイン変更/リニューアル",
      description:
        "新しいドメイン「aipictors.com」でリニューアル。サイト全体がより使いやすく生まれ変わりました。",
      category: "update",
      icon: <SettingsIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "like-privacy",
      date: "2024年11月20日",
      year: 2024,
      title: "いいね非表示設定追加",
      description:
        "匿名でいいねができる機能を追加。プライバシーに配慮した交流ができるように。",
      category: "feature",
      icon: <ThumbsUpIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "sns-thumbnail",
      date: "2025年1月1日",
      year: 2025,
      title: "SNSサムネイル調整機能",
      description:
        "SNS投稿用のサムネイルを自由に調整できるように。モザイク機能と組み合わせて使えます。",
      category: "feature",
      icon: <ShareIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "comment-like",
      date: "2025年2月15日",
      year: 2025,
      title: "コメントいいね機能",
      description:
        "コメントにもいいねができるように。投稿者からのいいねには特別なマークが付いて、コミュニティがより活発に。",
      category: "feature",
      icon: <MessageCircleIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "follow-feed",
      date: "2025年6月18日",
      year: 2025,
      title: "フォロー新着機能",
      description:
        "フォローしているユーザーの新着作品がもっと見やすく。無限スクロールとページ切り替えに対応。",
      category: "feature",
      icon: <TrendingUpIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "mute-expansion",
      date: "2025年7月3日",
      year: 2025,
      title: "ミュート機能拡張",
      description:
        "ミュートしたユーザーの作品やコメントの表示・非表示を自由に切り替えられるように。快適な閲覧体験を実現。",
      category: "feature",
      icon: <EyeIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "ai-auto-evaluation",
      date: "2025年8月30日",
      year: 2025,
      title: "AI自動評価UI",
      description:
        "投稿画面にAI評価機能を追加。AIの性格を選んで、コメントやグラフで作品を分析してもらえます。",
      category: "feature",
      icon: <BrainIcon className="h-5 w-5" />,
      status: "completed",
    },
    {
      id: "ai-auto-generation",
      date: "2025年8月31日",
      year: 2025,
      title: "AI自動生成機能",
      description:
        "画像をアップロードするだけで、タイトル・説明・タグをAIが自動生成。日本語と英語の両方に対応。",
      category: "feature",
      icon: <SparklesIcon className="h-5 w-5" />,
      highlight: false,
      status: "completed",
    },
    // 今後の予定
    {
      id: "seamless-mode",
      date: "2025年10月予定",
      year: 2025,
      title: "シームレス閲覧モード",
      description:
        "作品だけに集中できる新しい閲覧体験。画面いっぱいにタイル状に作品が並んで、UIを最小限に。",
      category: "planned",
      icon: <EyeIcon className="h-5 w-5" />,
      status: "in-progress",
      details:
        "作品の世界観に集中して楽しめるようにすることを目的とした、没入感のある新しい閲覧体験です。ユーザーインターフェースの要素を最小限に抑え、作品そのものの魅力を最大限に引き出します。",
    },
    {
      id: "ai-ranking",
      date: "調整中",
      year: 2025,
      title: "AI評価ランキング",
      description:
        "AIが作品を評価してランキングに反映。今はスコアの調整とテストを重ねて、より良いシステムを準備中。",
      category: "planned",
      icon: <TrendingUpIcon className="h-5 w-5" />,
      status: "planned",
      details:
        "作品の魅力をより多面的に評価し、ランキングに新たな視点を導入することを目的としています。AIが作品の技術的側面や芸術的価値を客観的に評価し、従来の人気投票とは異なる観点からの発見をサポートします。",
    },
    {
      id: "achievement-system",
      date: "2025年9月予定",
      year: 2025,
      title: "アチーブメント機能",
      description:
        "投稿や閲覧、コメントなどの活動に応じて実績を獲得。AI評価とも連動して、新しい楽しみ方を提供予定。",
      category: "planned",
      icon: <StarIcon className="h-5 w-5" />,
      status: "planned",
      details:
        "ユーザー活動を可視化し、継続利用をより楽しくすることを目的とした機能です。投稿数、いいね数、コメント数などの活動指標に加え、AI評価との連動により新しい成長の楽しみを提供します。",
    },
    {
      id: "db-migration",
      date: "進行中",
      year: 2025,
      title: "データベースサーバ移転",
      description:
        "サイトをもっと速く快適にするため、データベースサーバーを新しくリニューアルを進めさせていただいております。",
      category: "planned",
      icon: <DatabaseIcon className="h-5 w-5" />,
      status: "in-progress",
      details:
        "快適な利用環境を提供し、同時アクセスの増加にも耐えられる仕組みづくりを行っています。新しいインフラにより、ページ読み込み速度の向上と安定性の確保を目指します。",
    },
  ]

  const getCategoryColor = (category: TimelineItem["category"]) => {
    switch (category) {
      case "launch":
        return "bg-purple-500"
      case "feature":
        return "bg-blue-500"
      case "event":
        return "bg-pink-500"
      case "update":
        return "bg-green-500"
      case "milestone":
        return "bg-yellow-500"
      case "planned":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryText = (category: TimelineItem["category"]) => {
    switch (category) {
      case "launch":
        return "サービス開始"
      case "feature":
        return "新機能"
      case "event":
        return "イベント"
      case "update":
        return "アップデート"
      case "milestone":
        return "マイルストーン"
      case "planned":
        return "今後の予定"
      default:
        return "その他"
    }
  }

  const getStatusColor = (status?: TimelineItem["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500"
      case "in-progress":
        return "bg-blue-500"
      case "planned":
        return "bg-amber-500"
      default:
        return "bg-gray-500"
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id)
  }

  // 過去と未来を分ける
  const pastItems = timelineItems.filter((item) => item.status === "completed")
  const futureItems = timelineItems.filter(
    (item) => item.status !== "completed",
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-20"
          style={{
            backgroundImage:
              "url('https://assets.aipictors.com/Aipictors_01.webp')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80" />
        <div className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-6 flex justify-center">
              <Badge
                variant="secondary"
                className="border-white/30 bg-white/20 px-6 py-3 text-lg text-white backdrop-blur-sm"
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                2022年〜未来へ
              </Badge>
            </div>
            <h1 className="mb-6 font-bold text-4xl drop-shadow-lg sm:text-5xl lg:text-6xl">
              <SparklesIcon className="mr-4 inline h-12 w-12 text-yellow-300" />
              AIpictors の歩みと展望
            </h1>
            <p className="mb-8 text-lg opacity-90 drop-shadow-lg sm:text-xl">
              AIイラスト交流サイトの先駆けとして、
              <br />
              継続的な進化と成長を続けています。
            </p>
            <p className="mb-8 text-base opacity-80 drop-shadow-lg">
              これまでの軌跡と今後の展望を一本のタイムラインでご紹介します
            </p>
          </div>
        </div>
      </div>

      {/* ぴくたーちゃんからの感謝メッセージ */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 py-16 dark:from-orange-900/20 dark:to-pink-900/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-orange-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-orange-700 dark:bg-gray-800/80">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src="https://assets.aipictors.com/pictor-chan-01%20(1).webp"
                      alt="ぴくたーちゃん"
                      className="h-64 w-auto object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="mb-6 font-bold text-3xl text-orange-600 dark:text-orange-400">
                    ぴくたーちゃんからの感謝メッセージ
                  </h2>
                  <div className="mb-6 rounded-xl bg-gradient-to-r from-orange-100 to-pink-100 p-6 shadow-inner dark:from-orange-900/30 dark:to-pink-900/30">
                    <p className="mb-4 text-gray-700 text-lg dark:text-gray-300">
                      みなさん、いつもAipictorsをご利用いただき、本当にありがとうございます！✨
                    </p>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      2022年の立ち上げから現在まで、たくさんの素晴らしい作品と出会い、
                      クリエイターのみなさんの成長を見守ることができて、私もとても嬉しいです！
                    </p>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      これからも新しい機能を追加して、みなさんの創作活動がもっと楽しくなるよう、
                      開発チーム一同頑張ってまいります。
                    </p>
                    <p className="text-gray-600 text-sm dark:text-gray-400">
                      引き続き、Aipictorsをよろしくお願いいたします！
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* メインタイムライン */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* これまでの歩み */}
        <section className="mb-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-4xl text-gray-800 dark:text-gray-200">
              これまでの歩み
            </h2>
            <p className="text-gray-600 text-lg dark:text-gray-400">
              2022年のサービス開始から現在まで
            </p>
          </div>

          {/* シンプルなタイムライン */}
          <div className="relative mx-auto max-w-4xl">
            {/* メインライン */}
            <div className="absolute top-0 bottom-0 left-8 w-px bg-gray-300 dark:bg-gray-600" />

            {/* タイムラインアイテム */}
            <div className="space-y-8">
              {pastItems.map((item) => (
                <div key={item.id} className="relative flex items-start">
                  {/* タイムライン点 */}
                  <div className="absolute top-6 left-6 z-10 flex h-4 w-4 items-center justify-center">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-4 border-white shadow-lg",
                        getCategoryColor(item.category),
                      )}
                    />
                  </div>

                  {/* コンテンツカード */}
                  <div className="ml-16 w-full">
                    <Card
                      className={cn(
                        "border transition-colors hover:border-gray-300 dark:hover:border-gray-600",
                        item.highlight
                          ? "border-yellow-300 bg-yellow-50/50 dark:border-yellow-600 dark:bg-yellow-900/20"
                          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="mb-3 flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full text-white",
                              getCategoryColor(item.category),
                            )}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-1 text-xs">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {item.date}
                            </Badge>
                            {item.highlight && (
                              <Badge
                                variant="outline"
                                className="ml-2 border-yellow-400 text-yellow-600"
                              >
                                <StarIcon className="mr-1 h-3 w-3" />
                                注目
                              </Badge>
                            )}
                          </div>
                        </div>
                        <h3 className="mb-2 font-semibold text-gray-900 text-lg dark:text-gray-100">
                          {item.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            getCategoryColor(item.category),
                            "mb-3 text-white",
                          )}
                        >
                          {getCategoryText(item.category)}
                        </Badge>
                        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 今後の展望 - 背景を変えて未来セクションとして継続 */}
        <section className="-mx-8 rounded-3xl bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50 px-8 py-16 dark:from-purple-900/20 dark:via-orange-900/20 dark:to-pink-900/20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-4xl text-purple-800 dark:text-purple-200">
              今後の展望
            </h2>
            <p className="text-lg text-purple-600 dark:text-purple-400">
              現在開発中・計画中の新機能
            </p>
          </div>

          {/* 継続したシンプルなタイムライン */}
          <div className="relative mx-auto max-w-4xl">
            {/* メインライン（未来は紫-オレンジグラデーション） */}
            <div className="absolute top-0 bottom-0 left-8 w-px bg-gradient-to-b from-purple-400 to-orange-400 dark:from-purple-500 dark:to-orange-500" />

            {/* タイムラインアイテム */}
            <div className="space-y-8">
              {futureItems.map((item) => (
                <div key={item.id} className="relative flex items-start">
                  {/* タイムライン点 */}
                  <div className="absolute top-6 left-6 z-10 flex h-4 w-4 items-center justify-center">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-4 border-white shadow-lg",
                        getStatusColor(item.status),
                      )}
                    />
                  </div>

                  {/* コンテンツカード */}
                  <div className="ml-16 w-full">
                    <Card
                      className={cn(
                        "cursor-pointer border-2 border-purple-200 bg-white/80 backdrop-blur-sm transition-all hover:border-purple-300 hover:shadow-lg dark:border-purple-600 dark:bg-gray-800/80 dark:hover:border-purple-500",
                        expandedItem === item.id &&
                          "border-purple-300 shadow-lg dark:border-purple-500",
                      )}
                      onClick={() => toggleExpanded(item.id)}
                    >
                      <CardContent className="p-6">
                        <div className="mb-3 flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full text-white",
                              getStatusColor(item.status),
                            )}
                          >
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                {item.date}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-white text-xs",
                                  getStatusColor(item.status),
                                )}
                              >
                                {item.status === "in-progress"
                                  ? "開発中"
                                  : "計画中"}
                              </Badge>
                            </div>
                          </div>
                          {expandedItem === item.id ? (
                            <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <h3 className="mb-2 font-semibold text-gray-900 text-lg dark:text-gray-100">
                          {item.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="mb-3 bg-purple-500 text-white"
                        >
                          今後の予定
                        </Badge>
                        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
                          {item.description}
                        </p>

                        {expandedItem === item.id && item.details && (
                          <div className="mt-4 rounded-lg border-purple-400 border-l-4 bg-purple-100/50 p-4 dark:bg-purple-900/30">
                            <div className="mb-2 flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-purple-500" />
                              <span className="font-semibold text-purple-600 text-sm dark:text-purple-400">
                                詳細情報
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed dark:text-gray-400">
                              {item.details}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
