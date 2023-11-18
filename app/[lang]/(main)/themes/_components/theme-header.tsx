import { ThemeCard } from "@/app/[lang]/(main)/themes/_components/theme-card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export const ThemeHeader = () => {
  const description =
    "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう。午前0時に更新されます。"

  return (
    <div className="space-y-4">
      <p className="text-lg">{"創作アイディアページ"}</p>
      <p className="text-sm">{description}</p>
      <hr />
      <div className="space-y-4">
        <div className="flex space-x-2">
          <p className="text-sm">{"今日のお題「」"}</p>
          <Button size="sm">{"お題を見る"}</Button>
        </div>
        <p className="text-sm">{"新着順"}</p>
        <div className="flex space-x-2">
          <ThemeCard />
          <ThemeCard />
          <ThemeCard />
          <ThemeCard />
        </div>
      </div>
      <Separator />
    </div>
  )
}
