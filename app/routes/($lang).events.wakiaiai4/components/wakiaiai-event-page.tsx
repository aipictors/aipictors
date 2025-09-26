import { Link } from "@remix-run/react"
import { useState, useId } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  PaletteIcon,
  ExternalLinkIcon,
  ImageIcon,
  StoreIcon,
  HelpCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BadgeIcon,
} from "lucide-react"

export function WakiAiAiEventPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const participationMethodsId = useId()

  const eventInfo = {
    title: "和気あいAI4",
    subtitle:
      "生成AI仲間と出会える！全国一アットホームな生成AIを利用したイラストの展示やグッズ等の展示・即売会、第４回",
    date: "2025年10月25日(土)",
    time: "10:00〜16:00",
    location: "名古屋鉄道 太田川駅前 大屋根広場",
    address: "愛知県東海市大田町下浜田137",
    access: "太田川駅から徒歩1分",
    admission: "無料",
    deadline: "8月31日〆切！",
  }

  const features = [
    {
      icon: <UsersIcon className="h-6 w-6" />,
      title: "一般参加無料",
      description: "屋外開催！どなたでも無料でAI作品の展示を見ることができます",
    },
    {
      icon: <PaletteIcon className="h-6 w-6" />,
      title: "AI活用者同士の交流",
      description: "生成AIを活用している方々と直接交流できる貴重な機会です",
    },
    {
      icon: <ImageIcon className="h-6 w-6" />,
      title: "大迫力のAI作品展示",
      description: "大型A0サイズのAIイラスト作品を多数展示",
    },
  ]

  const participationMethods = [
    {
      title: "リアル出展",
      description:
        "当日会場で実際にブースを出展し、作品販売やグッズ展示を行いたい方向けの参加形式です。",
      icon: <StoreIcon className="h-6 w-6" />,
      link: "https://forms.gle/r7CAmK9vri1NEKWj9",
    },
    {
      title: "AIイラストA0展示",
      description: "A0サイズ（841×1189mm）の大型パネルに印刷して展示できます。",
      icon: <ImageIcon className="h-6 w-6" />,
      link: "https://forms.gle/r7CAmK9vri1NEKWj9",
    },
    {
      title: "生成AIなんでも宣伝",
      description:
        "生成AIに関する宣伝や告知をA4サイズで展示できます。サービス、アプリ、イベントなどの宣伝にぜひご活用ください。",
      icon: <BadgeIcon className="h-6 w-6" />,
      link: "https://forms.gle/wDt5bUtYvzXGcU256",
    },
  ]

  const faqItems = [
    {
      question: "イベントは誰でも参加できますか？",
      answer:
        "はい、どなたでも無料でご参加いただけます。生成AIに興味のある方、AI作品を見たい方、クリエイター同士で交流したい方など、どなたでも歓迎です。",
    },
    {
      question: "クリエイターとして参加するにはどうすれば？",
      answer:
        "リアル出展、AIイラストA0展示、生成AIなんでも宣伝の3つの参加方法があります。それぞれ申込フォームからお申し込みください。",
    },
    {
      question: "どんな作品が展示されますか？",
      answer:
        "生成AIを使って作られたイラスト、アート作品、グッズなど様々な作品が展示されます。大型A0サイズの迫力ある作品もご覧いただけます。",
    },
    {
      question: "作品の年齢制限はありますか？",
      answer:
        "はい、和気あいAIはリアルイベントのため、全年齢向けの作品のみ募集・展示させていただきます。R15、R18等の年齢制限のある作品はご出展いただけませんのでご了承ください。",
    },
  ]

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-purple-600 text-white">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://assets.aipictors.com/cc52625d-887c-46f4-afbc-757b7655797f.webp')",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex flex-col items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-orange-500 px-4 py-2 text-lg text-white"
              >
                🎃 ハロウィン企画開催中！
              </Badge>
              <Badge variant="secondary" className="bg-yellow-500 text-black">
                {eventInfo.deadline}
              </Badge>
            </div>
            <h1 className="mb-4 font-bold text-4xl drop-shadow-lg sm:text-5xl lg:text-6xl">
              {eventInfo.title}
            </h1>
            <p className="mb-8 text-lg opacity-90 drop-shadow-lg sm:text-xl">
              {eventInfo.subtitle}
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span className="font-semibold">{eventInfo.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                <span>{eventInfo.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                <span>{eventInfo.location}</span>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="transform border-2 border-orange-300 bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 font-bold text-lg text-white shadow-xl transition-all duration-200 hover:scale-105 hover:from-orange-600 hover:to-orange-700"
                onClick={() => {
                  document
                    .getElementById(participationMethodsId)
                    ?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                🎯 参加方法を見る
              </Button>
              <Link to="/new/image">
                <Button
                  size="lg"
                  className="transform border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 font-bold text-lg text-white shadow-xl transition-all duration-200 hover:scale-105 hover:from-purple-700 hover:to-purple-800"
                >
                  🎨 作品を投稿する
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* 和気あいAIとは */}
        <section className="mb-16">
          <h2 className="mb-8 text-center font-bold text-3xl">
            和気あいAIとは？
          </h2>
          <Card className="mb-8">
            <CardContent className="p-8">
              <p className="mb-6 text-lg leading-relaxed">
                「和気あいAI」は、生成AIを使ったイラストの展示・即売・交流のためのイベントです。
              </p>
              <p className="mb-6 leading-relaxed">
                生成AIツールによって作られたイラストや作品を展示・販売するだけでなく、生成AI技術に興味を持つ参加者同士の交流の場を提供しています。
              </p>
              <p className="leading-relaxed">
                第4回となる今回も、大型展示作品やイラスト集、グッズ販売など、多彩なコンテンツをご用意しています。
              </p>
              <div className="mt-6 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <BadgeIcon className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800">
                    重要なお知らせ
                  </h4>
                </div>
                <p className="text-yellow-700">
                  和気あいAIイベントはリアルイベントのため、
                  <strong>全年齢向けの作品のみ</strong>
                  の募集・展示とさせていただきます。
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index.toString()} className="text-center">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ハロウィン企画セクション */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-lg border-4 border-orange-300 bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-2xl">
            <div
              className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-30"
              style={{
                backgroundImage:
                  "url('https://assets.aipictors.com/cc52625d-887c-46f4-afbc-757b7655797f.webp')",
              }}
            />
            <div className="relative p-8">
              <div className="text-center">
                <Badge
                  variant="secondary"
                  className="mb-4 animate-pulse bg-yellow-400 px-6 py-2 font-bold text-black text-lg"
                >
                  🔥 特別企画開催中！
                </Badge>
                <h2 className="mb-4 font-bold text-3xl drop-shadow-lg md:text-4xl">
                  🎃 和気あいAI2025ハロウィン企画 🎃
                </h2>
                <p className="mb-6 text-lg drop-shadow-lg md:text-xl">
                  愛知県のリアルイベント「和気あいAI」にてハロウィン企画を実施いたします！
                </p>
                <div className="mb-6">
                  <a
                    href="https://www.aipictors.com/events/halloween-2025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    詳細ページを見る
                  </a>
                </div>
              </div>

              <Card className="bg-white/90 text-gray-800">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="mb-3 font-bold text-orange-600 text-xl">
                        参加方法
                      </h3>
                      <div className="rounded-lg bg-orange-100 p-4">
                        <p className="font-bold text-lg text-orange-800">
                          「!和気あいAI2025ハロウィン企画」
                        </p>
                        <p className="text-orange-700">
                          このタグをつけて作品を投稿するとイベントに参加できます！
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-purple-50 p-4">
                        <h4 className="mb-2 font-semibold text-purple-800">
                          📋 ポスター掲載
                        </h4>
                        <p className="text-purple-700 text-sm">
                          応募いただいた作品はポスターにて掲載させていただきます！
                        </p>
                      </div>

                      <div className="rounded-lg bg-orange-50 p-4">
                        <h4 className="mb-2 font-semibold text-orange-800">
                          📖 冊子作成
                        </h4>
                        <p className="text-orange-700 text-sm">
                          人気作品は冊子にまとめ、当日ご購入・ご閲覧いただけるようにいたします！
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button
                        size="lg"
                        className="mr-4 mb-4 transform border-3 border-white/30 bg-gradient-to-r from-orange-600 to-red-600 px-8 py-4 font-bold text-lg text-white shadow-xl transition-all duration-200 hover:scale-105 hover:from-orange-700 hover:to-red-700"
                        onClick={() => {
                          const url = `/new/image?event=wakiaiai4-halloween&tag=${encodeURIComponent("!和気あいAI2025ハロウィン企画")}`
                          window.open(url, "_blank")
                        }}
                      >
                        🎃 ハロウィン作品を投稿する
                      </Button>
                      <a
                        href="https://www.aipictors.com/events/halloween-2025"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="lg"
                          variant="outline"
                          className="mb-4 transform border-3 border-orange-300 bg-white/90 px-8 py-4 font-bold text-lg text-orange-600 shadow-xl transition-all duration-200 hover:scale-105 hover:bg-white hover:text-orange-700"
                        >
                          <ExternalLinkIcon className="mr-2 h-5 w-5" />
                          応募作品を見る
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 作品投稿セクション */}
        <section className="mb-16">
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 font-bold text-2xl text-purple-800">
                <PaletteIcon className="h-6 w-6" />
                和気あいAI4に作品を投稿しよう！
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-gray-700 text-lg">
                和気あいAI4に関連する作品をAipictorsに投稿して、イベントを盛り上げましょう！
                <br />
                <span className="font-semibold text-purple-700">
                  「#和気あいAI4」「#wakiaiai4」
                </span>
                タグを付けて投稿してください。
              </p>
              <div className="flex justify-center">
                <Link to="/new/image">
                  <Button
                    size="lg"
                    className="border-2 border-purple-400 bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 font-bold text-lg text-white shadow-lg hover:from-purple-700 hover:to-purple-800"
                  >
                    🎨 作品を投稿する
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 参加方法 */}
        <section id={participationMethodsId} className="mb-16">
          <h2 className="mb-8 text-center font-bold text-3xl">
            クリエイターとして参加する方法
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {participationMethods.map((method, index) => (
              <Card key={index.toString()} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">{method.icon}</div>
                    <CardTitle className="text-lg">{method.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground text-sm">
                    {method.description}
                  </p>
                  <a
                    href={method.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full">
                      申込みはこちら
                      <ExternalLinkIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 開催情報 */}
        <section className="mb-16">
          <h2 className="mb-8 text-center font-bold text-3xl">開催情報</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">開催日時</div>
                      <div className="text-muted-foreground">
                        {eventInfo.date} {eventInfo.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="mt-1 h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">開催場所</div>
                      <div className="text-muted-foreground">
                        {eventInfo.location}
                        <br />
                        {eventInfo.address}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">アクセス</div>
                      <div className="text-muted-foreground">
                        {eventInfo.access}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UsersIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">入場料</div>
                      <div className="font-semibold text-muted-foreground">
                        {eventInfo.admission}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* よくある質問 */}
        <section className="mb-16">
          <h2 className="mb-8 text-center font-bold text-3xl">よくある質問</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index.toString()}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HelpCircleIcon className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{item.question}</CardTitle>
                    </div>
                    {expandedFaq === index ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </div>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* お問い合わせ・SNS */}
        <section className="mb-16 text-center">
          <Card>
            <CardContent className="p-8">
              <h3 className="mb-4 font-bold text-xl">お問い合わせ・最新情報</h3>
              <p className="mb-6 text-muted-foreground">
                イベントの最新情報やお問い合わせは公式SNSをご確認ください。
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="https://x.com/waki_ai_ai_kot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <ExternalLinkIcon className="mr-2 h-4 w-4" />X (Twitter)
                  </Button>
                </a>
                <a
                  href="https://discord.gg/7jA2MmtvtR"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                    Discord
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 関連イベント */}
        <section className="text-center">
          <h3 className="mb-6 font-bold text-2xl">関連イベント</h3>
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-purple-50 dark:border-orange-700 dark:from-orange-900/20 dark:to-purple-900/20">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="flex-1">
                  <h4 className="mb-2 font-bold text-orange-600 text-xl dark:text-orange-400">
                    🎃 ハロウィン2025企画
                  </h4>
                  <p className="mb-4 text-gray-700 dark:text-gray-300">
                    和気あいAI4のハロウィン特別企画！作品投稿でポスター掲載のチャンス
                  </p>
                  <Badge className="mb-4 bg-orange-500 text-white">
                    応募期間：2025年7月21日〜8月31日
                  </Badge>
                </div>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://www.aipictors.com/events/halloween-2025"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                    >
                      <ExternalLinkIcon className="mr-2 h-4 w-4" />
                      ハロウィン企画詳細
                    </Button>
                  </a>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                    onClick={() => {
                      const url = `/new/image?event=wakiaiai4-halloween&tag=${encodeURIComponent("!和気あいAI2025ハロウィン企画")}`
                      window.open(url, "_blank")
                    }}
                  >
                    🎃 ハロウィン作品投稿
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
