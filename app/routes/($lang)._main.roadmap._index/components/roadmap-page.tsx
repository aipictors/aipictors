import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
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
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  HeartIcon,
  EyeIcon,
  ZapIcon,
  GaugeIcon,
} from "lucide-react"
import { cn } from "~/lib/utils"

type RoadmapItem = {
  id: string
  title: string
  description: string
  status: "completed" | "in-progress" | "planned"
  priority: "high" | "medium" | "low"
  category: "feature" | "infrastructure" | "improvement"
  estimatedDate: string
  icon: React.ReactNode
  details?: string
}

export function RoadmapPage() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const roadmapItems: RoadmapItem[] = [
    {
      id: "seamless-mode",
      title: "シームレス閲覧モード",
      description:
        "作品にのみ集中できる新しい閲覧体験。タイル状に作品が画面全体に並び、UIの干渉を最小限に抑制",
      status: "in-progress",
      priority: "high",
      category: "feature",
      estimatedDate: "2025年9月中",
      icon: <EyeIcon className="h-6 w-6" />,
      details:
        "作品の世界観に集中して楽しめるようにすることを目的とした、没入感のある新しい閲覧体験です。ユーザーインターフェースの要素を最小限に抑え、作品そのものの魅力を最大限に引き出します。",
    },
    {
      id: "ai-ranking",
      title: "AI評価ランキング",
      description:
        "投稿作品にAI評価が加わり、ランキングに反映。運用中のスコアモニタリングと調整を経て導入予定",
      status: "planned",
      priority: "high",
      category: "feature",
      estimatedDate: "調整中",
      icon: <TrendingUpIcon className="h-6 w-6" />,
      details:
        "作品の魅力をより多面的に評価し、ランキングに新たな視点を導入することを目的としています。AIが作品の技術的側面や芸術的価値を客観的に評価し、従来の人気投票とは異なる観点からの発見をサポートします。",
    },
    {
      id: "achievement-system",
      title: "アチーブメント機能",
      description:
        "投稿や閲覧などのアクティブ度に応じて実績を獲得可能。一部はAI評価と連動",
      status: "planned",
      priority: "medium",
      category: "feature",
      estimatedDate: "2025年9月中目標",
      icon: <StarIcon className="h-6 w-6" />,
      details:
        "ユーザー活動を可視化し、継続利用をより楽しくすることを目的とした機能です。投稿数、いいね数、コメント数などの活動指標に加え、AI評価との連動により新しい成長の楽しみを提供します。",
    },
    {
      id: "db-migration",
      title: "データベースサーバ移転",
      description:
        "サイト速度改善のため、DBサーバ移転を進行。パフォーマンスの安定化と大規模拡張に備えた基盤整備",
      status: "in-progress",
      priority: "high",
      category: "infrastructure",
      estimatedDate: "並行作業中",
      icon: <DatabaseIcon className="h-6 w-6" />,
      details:
        "快適な利用環境を提供し、同時アクセスの増加にも耐えられる仕組みづくりを行っています。新しいインフラにより、ページ読み込み速度の向上と安定性の確保を目指します。",
    },
  ]

  const getStatusColor = (status: RoadmapItem["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500"
      case "in-progress":
        return "bg-blue-500"
      case "planned":
        return "bg-amber-500"
    }
  }

  const getStatusText = (status: RoadmapItem["status"]) => {
    switch (status) {
      case "completed":
        return "完了"
      case "in-progress":
        return "開発中"
      case "planned":
        return "予定"
    }
  }

  const getPriorityColor = (priority: RoadmapItem["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
    }
  }

  const getCategoryIcon = (category: RoadmapItem["category"]) => {
    switch (category) {
      case "feature":
        return <RocketIcon className="h-4 w-4" />
      case "infrastructure":
        return <SettingsIcon className="h-4 w-4" />
      case "improvement":
        return <TrendingUpIcon className="h-4 w-4" />
    }
  }

  const getCategoryText = (category: RoadmapItem["category"]) => {
    switch (category) {
      case "feature":
        return "新機能"
      case "infrastructure":
        return "インフラ"
      case "improvement":
        return "改善"
    }
  }

  const getPriorityText = (priority: RoadmapItem["priority"]) => {
    switch (priority) {
      case "high":
        return "高優先度"
      case "medium":
        return "中優先度"
      case "low":
        return "低優先度"
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id)
  }

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
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <Badge
                variant="secondary"
                className="border-white/30 bg-white/20 px-6 py-3 text-lg text-white backdrop-blur-sm"
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                2025年9月移行予定
              </Badge>
            </div>
            <h1 className="mb-6 font-bold text-4xl drop-shadow-lg sm:text-5xl lg:text-6xl">
              <SparklesIcon className="mr-4 inline h-12 w-12 text-yellow-300" />
              AIpictors 開発ロードマップ
            </h1>
            <p className="mb-8 text-lg opacity-90 drop-shadow-lg sm:text-xl">
              皆さまに快適で魅力的な創作体験を提供するため、
              <br />
              新機能の追加や改善を継続的に行っています。
            </p>
            <p className="mb-8 text-base opacity-80 drop-shadow-lg">
              本ページでは、9月中に予定している開発項目をご紹介します。
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="transform border-2 border-white/30 bg-white/20 px-8 py-4 font-bold text-lg text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/30"
              >
                <MessageCircleIcon className="mr-2 h-5 w-5" />
                フィードバックを送る
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* ロードマップタイムライン */}
        <section className="mb-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl">開発予定</h2>
            <p className="text-gray-600 dark:text-gray-400">
              各項目をクリックすると詳細をご覧いただけます
            </p>
          </div>

          <div className="relative">
            {/* タイムライン線 */}
            <div className="absolute left-8 top-0 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 md:left-1/2 md:-translate-x-0.5" />

            <div className="space-y-12">
              {roadmapItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "relative flex items-center",
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
                  )}
                >
                  {/* タイムライン点 */}
                  <div className="absolute left-8 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg md:left-1/2">
                    <div
                      className={cn(
                        "h-3 w-3 rounded-full",
                        getStatusColor(item.status),
                      )}
                    />
                  </div>

                  {/* カードコンテンツ */}
                  <div
                    className={cn(
                      "ml-20 w-full md:ml-0",
                      index % 2 === 0
                        ? "md:mr-8 md:w-5/12"
                        : "md:ml-8 md:w-5/12",
                    )}
                  >
                    <Card
                      className={cn(
                        "transform border-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl",
                        item.priority === "high"
                          ? "border-red-200 dark:border-red-800"
                          : "border-gray-200 dark:border-gray-700",
                      )}
                    >
                      <CardHeader
                        className="cursor-pointer"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 p-3 text-white shadow-lg">
                              {item.icon}
                            </div>
                            <div>
                              <CardTitle className="mb-3 text-lg">
                                {item.title}
                              </CardTitle>
                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    getStatusColor(item.status),
                                    "text-white",
                                  )}
                                >
                                  <CheckCircleIcon className="mr-1 h-3 w-3" />
                                  {getStatusText(item.status)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  {getCategoryIcon(item.category)}
                                  {getCategoryText(item.category)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    getPriorityColor(item.priority),
                                    "text-white",
                                  )}
                                >
                                  <ZapIcon className="mr-1 h-3 w-3" />
                                  {getPriorityText(item.priority)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <ClockIcon className="h-3 w-3" />
                              {item.estimatedDate}
                            </Badge>
                            {expandedItem === item.id ? (
                              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">
                          {item.description}
                        </p>

                        {expandedItem === item.id && item.details && (
                          <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:border-gray-700 dark:from-blue-900/20 dark:to-purple-900/20">
                              <div className="mb-2 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                                <h4 className="font-semibold text-sm">
                                  詳細情報
                                </h4>
                              </div>
                              <p className="text-gray-600 text-sm dark:text-gray-400">
                                {item.details}
                              </p>
                            </div>
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

        {/* 統計セクション */}
        <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 text-center dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-6">
                <div className="mb-3 flex justify-center">
                  <div className="rounded-full bg-blue-500 p-3">
                    <RocketIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 font-bold text-2xl text-blue-700 dark:text-blue-400">
                  3
                </h3>
                <p className="text-blue-600 text-sm dark:text-blue-300">
                  新機能予定
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100 text-center dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-6">
                <div className="mb-3 flex justify-center">
                  <div className="rounded-full bg-green-500 p-3">
                    <GaugeIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 font-bold text-2xl text-green-700 dark:text-green-400">
                  1
                </h3>
                <p className="text-green-600 text-sm dark:text-green-300">
                  インフラ改善
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100 text-center dark:border-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20">
              <CardContent className="p-6">
                <div className="mb-3 flex justify-center">
                  <div className="rounded-full bg-yellow-500 p-3">
                    <StarIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 font-bold text-2xl text-yellow-700 dark:text-yellow-400">
                  2
                </h3>
                <p className="text-yellow-600 text-sm dark:text-yellow-300">
                  高優先度項目
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 text-center dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="p-6">
                <div className="mb-3 flex justify-center">
                  <div className="rounded-full bg-purple-500 p-3">
                    <UsersIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 font-bold text-2xl text-purple-700 dark:text-purple-400">
                  ∞
                </h3>
                <p className="text-purple-600 text-sm dark:text-purple-300">
                  ユーザー満足度
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 今後の展望セクション */}
        <section className="mb-16">
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg dark:border-purple-700 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 font-bold text-2xl text-purple-800 dark:text-purple-400">
                <RocketIcon className="h-6 w-6" />
                今後の展望
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-white/80 p-6 shadow-sm dark:bg-gray-800/80">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-blue-500 p-2">
                      <UsersIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold">ユーザーフィードバック</h3>
                  </div>
                  <p className="text-gray-600 text-sm dark:text-gray-400">
                    新機能はユーザーのフィードバックを踏まえて改善を続けます
                  </p>
                </div>

                <div className="rounded-lg bg-white/80 p-6 shadow-sm dark:bg-gray-800/80">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-green-500 p-2">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold">段階的リリース</h3>
                  </div>
                  <p className="text-gray-600 text-sm dark:text-gray-400">
                    順次公開・調整を行い、完成度を高めながらリリース
                  </p>
                </div>

                <div className="rounded-lg bg-white/80 p-6 shadow-sm dark:bg-gray-800/80">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-purple-500 p-2">
                      <MessageCircleIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold">双方向性強化</h3>
                  </div>
                  <p className="text-gray-600 text-sm dark:text-gray-400">
                    お問い合わせ・ご意見を通じてユーザーとの双方向性を強化
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                  皆さまのご意見・ご要望をお聞かせください。より良いサービスを提供するため、
                  積極的にフィードバックを活用してまいります。
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  >
                    <MessageCircleIcon className="mr-2 h-4 w-4" />
                    お問い合わせ
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                    <HeartIcon className="mr-2 h-4 w-4" />
                    ご意見・ご要望
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* キャラクターセクション */}
        <section className="text-center">
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-pink-50 shadow-lg dark:border-orange-700 dark:from-orange-900/20 dark:to-pink-900/20">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="relative h-32 w-32 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 p-1 shadow-lg">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-4xl">
                      🎨
                    </div>
                    <div className="absolute -top-2 -right-2 rounded-full bg-yellow-400 p-1">
                      <SparklesIcon className="h-4 w-4 text-yellow-800" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="mb-4 font-bold text-orange-600 text-xl dark:text-orange-400">
                    ぴくたーちゃんからのメッセージ
                  </h3>
                  <div className="mb-4 rounded-lg bg-white/80 p-4 shadow-sm dark:bg-gray-800/80">
                    <p className="mb-3 text-gray-700 dark:text-gray-300">
                      みなさん、いつもAipictorsをご利用いただき、ありがとうございます！✨
                      <br />
                      新しい機能がたくさん予定されていて、私もワクワクしています！
                    </p>
                    <p className="mb-3 text-gray-700 dark:text-gray-300">
                      特に<strong>シームレス閲覧モード</strong>
                      は、作品をもっと楽しく見られるようになりそうですね〜💫
                      AIランキングも、新しい発見がありそうで楽しみです！
                    </p>
                    <p className="text-gray-600 text-sm dark:text-gray-400">
                      皆さんの創作活動がもっと楽しくなるよう、開発チーム一同頑張っています！
                      新機能を楽しみにしていてくださいね〜🌟
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-orange-500 text-sm">
                    <HeartIcon className="h-4 w-4" />
                    <span>みんなの素敵な作品、いつも見させてもらってます♪</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
