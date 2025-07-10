import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { WakiAiAiEventPage } from "~/routes/($lang).events.wakiaiai4/components/wakiaiai-event-page"
import { config } from "~/config"

export const meta: MetaFunction = () => {
  return [
    {
      title:
        "和気あいAI4 - 生成AI仲間と出会える！全国一アットホームな生成AIイラスト展示・即売会 - Aipictors",
    },
    {
      name: "description",
      content:
        "2025年10月25日開催！生成AIを使ったイラストの展示・即売・交流イベント「和気あいAI4」。愛知県東海市で無料開催。AI作品の展示・販売、クリエイター同士の交流の場を提供します。",
    },
    {
      property: "og:title",
      content: "和気あいAI4 - 生成AI仲間と出会える！ - Aipictors",
    },
    {
      property: "og:description",
      content:
        "2025年10月25日開催！生成AIを使ったイラストの展示・即売・交流イベント「和気あいAI4」。愛知県東海市で無料開催。",
    },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: "和気あいAI4 - 生成AI仲間と出会える！ - Aipictors",
    },
    {
      name: "twitter:description",
      content:
        "2025年10月25日開催！生成AIを使ったイラストの展示・即売・交流イベント「和気あいAI4」。愛知県東海市で無料開催。",
    },
    { name: "robots", content: "index, follow" },
  ]
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function WakiAiAi4Event() {
  return <WakiAiAiEventPage />
}
