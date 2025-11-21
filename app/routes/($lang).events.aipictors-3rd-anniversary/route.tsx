import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link, useLoaderData } from "@remix-run/react"
import {
  CalendarIcon,
  TrophyIcon,
  UsersIcon,
  SparklesIcon,
  HeartIcon,
  ImageIcon,
  TrendingUpIcon,
  StarIcon,
  AwardIcon,
  GiftIcon,
} from "lucide-react"
import { loaderClient } from "~/lib/loader-client"
import { graphql } from "gql.tada"
import {
  EventWorkListItemFragment,
  EventWorkList,
} from "~/routes/($lang).events.$event._index/components/event-work-list"
import {
  EventAwardWorkListItemFragment,
  EventAwardWorkList,
} from "~/routes/($lang).events.$event._index/components/event-award-work-list"
import { config } from "~/config"
import { useState } from "react"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

export async function loader(props: LoaderFunctionArgs) {
  const urlParams = new URL(props.request.url).searchParams
  const pageParam = urlParams.get("page")
  const page = pageParam ? Number(pageParam) : 0

  // 3周年記念イベント作品取得
  const anniversaryEventResp = await loaderClient.query({
    query: appEventQuery,
    variables: {
      limit: 64,
      offset: page * 64,
      slug: "aipictors-3rd-anniversary",
      where: {
        ratings: ["G", "R15"],
        isNowCreatedAt: true,
      },
    },
  })

  // 事前開催イベント作品取得
  const before3rdEventResp = await loaderClient.query({
    query: appEventQuery,
    variables: {
      limit: 64,
      offset: 0,
      slug: "before3rd",
      where: {
        ratings: ["G", "R15"],
        isNowCreatedAt: true,
      },
    },
  })

  // 2025年の人気作品取得（いいね順TOP20）
  const rankingWorksResp = await loaderClient.query({
    query: rankingWorksQuery,
    variables: {
      offset: 0,
      limit: 20,
      where: {
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        sort: "DESC",
        createdAtAfter: "2025-01-01T00:00:00Z",
        beforeCreatedAt: "2025-12-31T23:59:59Z",
      },
    },
  })

  // 統計情報取得（全作品数のみ取得可能）
  const statsResp = await loaderClient.query({
    query: siteStatsQuery,
    variables: {
      where: {
        ratings: ["G", "R15", "R18", "R18G"],
      },
    },
  })

  return {
    anniversaryEvent: anniversaryEventResp.data.appEvent,
    before3rdEvent: before3rdEventResp.data.appEvent,
    rankingWorks: rankingWorksResp.data.works ?? [],
    stats: {
      totalWorks: statsResp.data.worksCount ?? 0,
    },
    page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction = () => {
  return createMeta(META.EVENTS_INDEX, {
    title: "Aipictors 3周年記念",
    description:
      "Aipictorsが3周年を迎えました！これまでの軌跡と感謝を込めて、記念イベントを開催。皆様の素晴らしい作品とともに3年間の歩みを振り返ります。",
  })
}

export default function Aipictors3rdAnniversary() {
  const data = useLoaderData<typeof loader>()
  const [selectedTab, setSelectedTab] = useState<
    "anniversary" | "before3rd" | "ranking"
  >("anniversary")

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div
          className="absolute inset-0 bg-center bg-cover opacity-20"
          style={{
            backgroundImage:
              "url('https://assets.aipictors.com/keito055_httpss.mj.runREr0OjkftZc_A_cheerful_anime-style_girl_9c340b92-0236-4e69-b4d7-a7ee4a0541e2_0.webp')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center text-white">
            <div className="mb-6 flex items-center justify-center gap-2">
              <SparklesIcon className="h-8 w-8 animate-pulse" />
              <Badge className="bg-white/20 px-4 py-2 font-bold text-lg backdrop-blur-sm">
                Special Anniversary
              </Badge>
              <SparklesIcon className="h-8 w-8 animate-pulse" />
            </div>

            <h1 className="mb-6 font-bold text-5xl leading-tight drop-shadow-lg md:text-7xl">
              Aipictors
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                3周年記念
              </span>
            </h1>

            <p className="mb-8 text-xl leading-relaxed drop-shadow-md md:text-2xl">
              2022年の誕生から3年。
              <br />
              AI画像生成の世界を共に歩んできた全てのクリエイターの皆様へ
              <br />
              心からの感謝を込めて
            </p>

            <div className="mb-4 text-center text-sm opacity-80">
              ※2025年11月21日時点のデータ
            </div>

            <div className="mb-12 flex flex-wrap justify-center gap-4">
              <div className="rounded-lg border-2 border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm">
                <div className="font-bold text-3xl">452,347</div>
                <div className="text-sm">投稿作品数</div>
              </div>
              <div className="rounded-lg border-2 border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm">
                <div className="font-bold text-3xl">160,174</div>
                <div className="text-sm">ユーザー数</div>
              </div>
              <div className="rounded-lg border-2 border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm">
                <div className="font-bold text-3xl">5,166,842</div>
                <div className="text-sm">いいね総数</div>
              </div>
              <div className="rounded-lg border-2 border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm">
                <div className="font-bold text-3xl">12,543,758</div>
                <div className="text-sm">生成画像数</div>
              </div>
              <div className="rounded-lg border-2 border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm">
                <div className="font-bold text-3xl">2,104,489</div>
                <div className="text-sm">コメント数</div>
              </div>
              <div className="rounded-lg border-2 border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm">
                <div className="font-bold text-3xl">22,635</div>
                <div className="text-sm">スタンプ数</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="w-full border-2 border-white bg-white px-8 py-6 font-bold text-lg text-purple-600 shadow-xl hover:bg-white/90 sm:w-auto"
              >
                <GiftIcon className="mr-2 h-5 w-5" />
                記念イベントに参加
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-white bg-transparent px-8 py-6 font-bold text-lg text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
              >
                <HeartIcon className="mr-2 h-5 w-5" />
                お祝いメッセージを見る
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-16 px-4 py-12">
        {/* 3年間の軌跡 */}
        <section>
          <h2 className="mb-8 text-center font-bold text-3xl">
            <SparklesIcon className="mb-2 inline-block h-8 w-8" />
            3年間の軌跡
          </h2>
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="mb-4 font-bold text-2xl text-purple-700">
                    Aipictorsとは
                  </h3>
                  <p className="mx-auto max-w-3xl text-lg leading-relaxed">
                    Aipictorsは、AI画像生成技術の発展とともに成長してきたクリエイティブコミュニティです。
                    誰もが自由に創作活動を楽しみ、作品を共有し、互いに刺激し合える場所として、
                    2022年にスタートしました。
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="border-purple-200 bg-white/80">
                    <CardHeader>
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                        <CalendarIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-center text-lg">
                        2022年 - 創設
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground">
                        AI画像生成の黎明期、クリエイターたちが集まる場所として誕生。
                        新しい表現の可能性を求めて、多くの作品が投稿されました。
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-pink-200 bg-white/80">
                    <CardHeader>
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
                        <TrendingUpIcon className="h-6 w-6 text-pink-600" />
                      </div>
                      <CardTitle className="text-center text-lg">
                        2023年 - 成長
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground">
                        コミュニティが急成長。様々なコンテストやイベントを開催し、
                        クリエイター同士の交流が活発化。新機能も続々追加されました。
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-white/80">
                    <CardHeader>
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                        <StarIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <CardTitle className="text-center text-lg">
                        2024年 - 進化
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground">
                        AI技術の進化とともにAipictorsも進化。
                        画像生成機能の強化、イベントの多様化など、
                        さらなる可能性を追求し続けています。
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-lg border-2 border-purple-200 bg-white/60 p-6">
                  <h4 className="mb-4 text-center font-bold text-purple-800 text-xl">
                    これまでの主な実績
                  </h4>
                  <p className="mb-4 text-center text-muted-foreground text-sm">
                    ※2025年11月21日時点
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <ImageIcon className="mt-1 h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold">作品投稿</div>
                        <div className="text-muted-foreground text-sm">
                          累計452,347作品が投稿され、多様な創作活動が展開されています
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <UsersIcon className="mt-1 h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold">クリエイター</div>
                        <div className="text-muted-foreground text-sm">
                          160,174名のユーザーが登録し、日々新しい作品を生み出しています
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <HeartIcon className="mt-1 h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold">いいね</div>
                        <div className="text-muted-foreground text-sm">
                          累計5,166,842のいいねで、クリエイター同士が互いを称え合っています
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <SparklesIcon className="mt-1 h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold">画像生成</div>
                        <div className="text-muted-foreground text-sm">
                          12,543,758枚の画像が生成され、AI創作活動を支援しています
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrophyIcon className="mt-1 h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold">コメント</div>
                        <div className="text-muted-foreground text-sm">
                          2,104,489件のコメントで、活発な交流が行われています
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <GiftIcon className="mt-1 h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold">スタンプ</div>
                        <div className="text-muted-foreground text-sm">
                          22,635個のスタンプが作成され、表現の幅を広げています
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 感謝のメッセージ */}
        <section>
          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
            <CardContent className="p-8 text-center">
              <HeartIcon className="mx-auto mb-4 h-12 w-12 text-pink-600" />
              <h3 className="mb-6 font-bold text-2xl text-pink-700">
                クリエイターの皆様へ
              </h3>
              <div className="mx-auto max-w-3xl space-y-4 text-left text-lg leading-relaxed">
                <p>
                  Aipictorsが3周年を迎えることができたのは、日々素晴らしい作品を投稿し、
                  コミュニティを盛り上げてくださる全てのクリエイターの皆様のおかげです。
                </p>
                <p>
                  AI画像生成技術は日々進化を続けていますが、それを使いこなし、
                  感動的な作品を生み出すのは、紛れもなくクリエイターの皆様の創造力と情熱です。
                </p>
                <p>
                  これからもAipictorsは、皆様の創作活動を支え、新しい表現の可能性を追求し続けます。
                  4年目、5年目、そしてその先も、一緒に素晴らしい作品を生み出していきましょう。
                </p>
                <p className="pt-4 text-center font-bold text-pink-700 text-xl">
                  本当にありがとうございます！
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* タブ切り替え */}
        <section>
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant={selectedTab === "anniversary" ? "default" : "outline"}
              onClick={() => setSelectedTab("anniversary")}
              className="font-bold"
            >
              <AwardIcon className="mr-2 h-5 w-5" />
              3周年記念作品
            </Button>
            <Button
              size="lg"
              variant={selectedTab === "before3rd" ? "default" : "outline"}
              onClick={() => setSelectedTab("before3rd")}
              className="font-bold"
            >
              <GiftIcon className="mr-2 h-5 w-5" />
              事前開催お祝い作品
            </Button>
            <Button
              size="lg"
              variant={selectedTab === "ranking" ? "default" : "outline"}
              onClick={() => setSelectedTab("ranking")}
              className="font-bold"
            >
              <TrophyIcon className="mr-2 h-5 w-5" />
              人気作品ランキング
            </Button>
          </div>

          {/* 3周年記念作品 */}
          {selectedTab === "anniversary" && data.anniversaryEvent && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="text-center text-2xl">
                    3周年記念イベント作品
                  </CardTitle>
                  <p className="text-center text-muted-foreground">
                    Aipictors3周年を記念して投稿された作品の数々
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  {data.anniversaryEvent.awardWorks && (
                    <div className="mb-8">
                      <h3 className="mb-4 font-bold text-xl">
                        <StarIcon className="mr-2 inline-block h-6 w-6 text-yellow-500" />
                        受賞作品
                      </h3>
                      <EventAwardWorkList
                        works={data.anniversaryEvent.awardWorks}
                        slug={data.anniversaryEvent.slug ?? ""}
                      />
                    </div>
                  )}
                  {data.anniversaryEvent.works && (
                    <EventWorkList
                      works={data.anniversaryEvent.works}
                      maxCount={data.anniversaryEvent.worksCount as number}
                      page={data.page}
                      slug={data.anniversaryEvent.slug ?? ""}
                      sort="DESC"
                      orderBy="DATE_CREATED"
                      sumWorksCount={0}
                      workType={null}
                      rating={null}
                      onClickTitleSortButton={() => {}}
                      onClickLikeSortButton={() => {}}
                      onClickBookmarkSortButton={() => {}}
                      onClickCommentSortButton={() => {}}
                      onClickViewSortButton={() => {}}
                      onClickAccessTypeSortButton={() => {}}
                      onClickDateSortButton={() => {}}
                      onClickWorkTypeSortButton={() => {}}
                      onClickIsPromotionSortButton={() => {}}
                      setWorkType={() => {}}
                      setRating={() => {}}
                      setSort={() => {}}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* 事前開催作品 */}
          {selectedTab === "before3rd" && data.before3rdEvent && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                  <CardTitle className="text-center text-2xl">
                    事前開催お祝い作品
                  </CardTitle>
                  <p className="text-center text-muted-foreground">
                    3周年を前に投稿されたお祝いの作品たち
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  {data.before3rdEvent.awardWorks && (
                    <div className="mb-8">
                      <h3 className="mb-4 font-bold text-xl">
                        <StarIcon className="mr-2 inline-block h-6 w-6 text-yellow-500" />
                        受賞作品
                      </h3>
                      <EventAwardWorkList
                        works={data.before3rdEvent.awardWorks}
                        slug={data.before3rdEvent.slug ?? ""}
                      />
                    </div>
                  )}
                  {data.before3rdEvent.works && (
                    <EventWorkList
                      works={data.before3rdEvent.works}
                      maxCount={data.before3rdEvent.worksCount as number}
                      page={0}
                      slug={data.before3rdEvent.slug ?? ""}
                      sort="DESC"
                      orderBy="DATE_CREATED"
                      sumWorksCount={0}
                      workType={null}
                      rating={null}
                      onClickTitleSortButton={() => {}}
                      onClickLikeSortButton={() => {}}
                      onClickBookmarkSortButton={() => {}}
                      onClickCommentSortButton={() => {}}
                      onClickViewSortButton={() => {}}
                      onClickAccessTypeSortButton={() => {}}
                      onClickDateSortButton={() => {}}
                      onClickWorkTypeSortButton={() => {}}
                      onClickIsPromotionSortButton={() => {}}
                      setWorkType={() => {}}
                      setRating={() => {}}
                      setSort={() => {}}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ランキング */}
          {selectedTab === "ranking" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardTitle className="text-center text-2xl">
                    <TrophyIcon className="mr-2 inline-block h-6 w-6 text-yellow-600" />
                    人気作品ランキング TOP20
                  </CardTitle>
                  <p className="text-center text-muted-foreground">
                    2025年に最も人気を集めた作品たち
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  {data.rankingWorks.length > 0 ? (
                    <EventWorkList
                      works={data.rankingWorks}
                      maxCount={data.rankingWorks.length}
                      page={0}
                      slug="ranking"
                      sort="DESC"
                      orderBy="LIKES_COUNT"
                      sumWorksCount={0}
                      workType={null}
                      rating={null}
                      onClickTitleSortButton={() => {}}
                      onClickLikeSortButton={() => {}}
                      onClickBookmarkSortButton={() => {}}
                      onClickCommentSortButton={() => {}}
                      onClickViewSortButton={() => {}}
                      onClickAccessTypeSortButton={() => {}}
                      onClickDateSortButton={() => {}}
                      onClickWorkTypeSortButton={() => {}}
                      onClickIsPromotionSortButton={() => {}}
                      setWorkType={() => {}}
                      setRating={() => {}}
                      setSort={() => {}}
                    />
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      ランキングデータを読み込み中...
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* これからの展望 */}
        <section>
          <h2 className="mb-8 text-center font-bold text-3xl">
            <SparklesIcon className="mb-2 inline-block h-8 w-8" />
            これからのAipictors
          </h2>
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <div className="space-y-6">
                <p className="text-center text-lg">
                  4年目を迎えるAipictorsは、さらなる進化を目指します
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-blue-600" />
                        新機能の開発
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        最新のAI技術を活用した新しい画像生成機能や、
                        クリエイターの創作活動をより快適にする機能を開発中です。
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-purple-600" />
                        コミュニティの拡大
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        より多くのクリエイターが交流し、刺激し合える場を提供。
                        国内外のクリエイターとの繋がりを強化していきます。
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-pink-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrophyIcon className="h-5 w-5 text-pink-600" />
                        イベントの充実
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        季節のイベントやコンテストをさらに充実させ、
                        クリエイターの皆様に楽しんでいただける企画を展開します。
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HeartIcon className="h-5 w-5 text-orange-600" />
                        創作支援
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        クリエイターの創作活動を支援する仕組みを強化し、
                        より多くの方が創作を続けられる環境を整えます。
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 参加を呼びかけ */}
        <section>
          <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100">
            <CardContent className="p-8 text-center">
              <GiftIcon className="mx-auto mb-4 h-12 w-12 text-purple-600" />
              <h3 className="mb-6 font-bold text-2xl">
                3周年記念イベントに参加しませんか？
              </h3>
              <p className="mx-auto mb-8 max-w-2xl text-lg">
                あなたの作品でAipictorsの3周年をお祝いしてください。
                記念イベントでは、素晴らしい作品を投稿してくださった方に
                特別な称号やバッジを贈呈予定です！
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/new/image">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 font-bold text-lg shadow-xl hover:from-purple-700 hover:to-pink-700 sm:w-auto"
                  >
                    <ImageIcon className="mr-2 h-5 w-5" />
                    作品を投稿する
                  </Button>
                </Link>
                <Link to="/">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-purple-600 px-8 py-6 font-bold text-lg text-purple-600 hover:bg-purple-50 sm:w-auto"
                  >
                    トップページへ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

const appEventQuery = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    appEvent(slug: $slug) {
      id
      description
      title
      slug
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      tag
      worksCount
      works(offset: $offset, limit: $limit, where: $where) {
        ...EventWorkListItem
      }
      awardWorks(offset: 0, limit: 20, isSensitive: false) {
        ...EventAwardWorkListItem
      }
    }
  }`,
  [EventAwardWorkListItemFragment, EventWorkListItemFragment],
)

const rankingWorksQuery = graphql(
  `query RankingWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...EventWorkListItem
    }
  }`,
  [EventWorkListItemFragment],
)

const siteStatsQuery = graphql(
  `query SiteStats($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)
