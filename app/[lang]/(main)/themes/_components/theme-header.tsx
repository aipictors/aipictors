import { ThemeCard } from "@/app/[lang]/(main)/themes/_components/theme-card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export const ThemeHeader = () => {
  return (
    <div className="space-y-4">
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
