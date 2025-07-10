import { Link } from "@remix-run/react"
import { useState } from "react"
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
        "リアル出展、AIイラストA0展示、生成AIなんでも宣伝の3つの参加方法があります。それぞれ専用の申込フォームからお申し込みください。",
    },
    {
      question: "どんな作品が展示されますか？",
      answer:
        "生成AIを使って作られたイラスト、アート作品、グッズなど様々な作品が展示されます。大型A0サイズの迫力ある作品もご覧いただけます。",
    },
  ]

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4">
              <Badge variant="secondary" className="bg-yellow-500 text-black">
                {eventInfo.deadline}
              </Badge>
            </div>
            <h1 className="mb-4 font-bold text-4xl sm:text-5xl lg:text-6xl">
              {eventInfo.title}
            </h1>
            <p className="mb-8 text-lg opacity-90 sm:text-xl">
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
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                参加方法を見る
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                作品を投稿する
              </Button>
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

        {/* 作品投稿セクション */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-purple-100 to-blue-100">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 font-bold text-2xl">
                <PaletteIcon className="h-6 w-6" />
                和気あいAI4に作品を投稿しよう！
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center">
                和気あいAI4に関連する作品をAipictorsに投稿して、イベントを盛り上げましょう！
                <br />
                「#和気あいAI4」「#wakiaiai4」タグを付けて投稿してください。
              </p>
              <div className="flex justify-center">
                <Link to="/new/image">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    作品を投稿する
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 参加方法 */}
        <section className="mb-16">
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
        <section className="text-center">
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
                  href="https://discord.gg/Z5UPtTSwmV"
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
      </div>
    </div>
  )
}
