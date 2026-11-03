import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { RATING_OPTIONS } from "~/routes/($lang)._main.admin.works/utils/admin-works-utils"

/**
 * 作品管理の絞り込み
 */
export function AdminWorksFilterCard(props: {
  applyDateShortcut: (offsetDays: number) => void
  applyFilters: () => void
  clearFilters: () => void
  dateFilter: string
  hasActiveFilters: boolean
  ownerFilter: string
  ratingFilter: string
  setOwnerFilter: (value: string) => void
  setTitleFilter: (value: string) => void
  setWorkIdFilter: (value: string) => void
  titleFilter: string
  updateSearchParams: (mutator: (next: URLSearchParams) => void) => void
  workIdFilter: string
}) {
  const {
    applyDateShortcut,
    applyFilters,
    clearFilters,
    dateFilter,
    hasActiveFilters,
    ownerFilter,
    ratingFilter,
    setOwnerFilter,
    setTitleFilter,
    setWorkIdFilter,
    titleFilter,
    updateSearchParams,
    workIdFilter,
  } = props

  return (
    <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">絞り込み</CardTitle>
        <p className="text-sm text-slate-400">
          読み込み量を減らすため、日付や年齢種別、作品ID、作品名、作者名で絞り込めます。
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            onClick={() => applyDateShortcut(0)}
          >
            本日
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            onClick={() => applyDateShortcut(-1)}
          >
            昨日
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2 xl:col-span-1">
            <Label htmlFor="admin-works-date">日付</Label>
            <Input
              id="admin-works-date"
              type="date"
              value={dateFilter}
              onChange={(event) => {
                updateSearchParams((next) => {
                  if (event.target.value) {
                    next.set("date", event.target.value)
                  } else {
                    next.delete("date")
                  }
                })
              }}
              className="border-white/10 bg-white/5 text-slate-100"
            />
          </div>

          <div className="space-y-2 xl:col-span-1">
            <Label>年齢種別</Label>
            <Select
              value={ratingFilter}
              onValueChange={(value) => {
                updateSearchParams((next) => {
                  if (value === "ALL") {
                    next.delete("rating")
                  } else {
                    next.set("rating", value)
                  }
                })
              }}
            >
              <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
                <SelectValue placeholder="年齢種別を選択" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-950/95 text-slate-100">
                {RATING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 xl:col-span-1">
            <Label htmlFor="admin-works-id">作品ID</Label>
            <Input
              id="admin-works-id"
              value={workIdFilter}
              onChange={(event) => setWorkIdFilter(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters()
                }
              }}
              placeholder="12345 または 123,456"
              className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2 xl:col-span-1">
            <Label htmlFor="admin-works-title">作品名</Label>
            <Input
              id="admin-works-title"
              value={titleFilter}
              onChange={(event) => setTitleFilter(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters()
                }
              }}
              placeholder="作品名で検索"
              className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2 xl:col-span-1">
            <Label htmlFor="admin-works-owner">作者名</Label>
            <Input
              id="admin-works-owner"
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters()
                }
              }}
              placeholder="作者名で検索"
              className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="bg-cyan-600 text-white hover:bg-cyan-500"
            onClick={applyFilters}
          >
            絞り込む
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            条件をクリア
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
