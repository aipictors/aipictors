import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { ThemeCard } from "~/routes/($lang)._main.themes._index/components/theme-card"

export function ThemeHeader() {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm">{`今日のお題:${"props.title"}`}</p>
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
