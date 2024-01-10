"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Flag } from "lucide-react"
import { toast } from "sonner"

/**
 * 作品の報告ダイアログ
 */
export default function ReportDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" variant="outline">
          <Flag />
          問題を報告する
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>問題を報告する</DialogTitle>
        </DialogHeader>
        <h4 className="text-md">{"報告内容"}</h4>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{"選択してください"}</SelectLabel>
              <SelectItem value="1">
                {"対象年齢が異なる（過度な性的表現など）"}
              </SelectItem>
              <SelectItem value="2">{"テイストが異なる"}</SelectItem>
              <SelectItem value="3">
                {"必要なモザイク加工がされていない"}
              </SelectItem>
              <SelectItem value="4">
                {"プライバシーまたは肖像権を侵害している"}
              </SelectItem>
              <SelectItem value="5">{"無断転載している"}</SelectItem>
              <SelectItem value="6">
                {"商業用の広告や宣伝、勧誘を目的とする情報が含まれている"}
              </SelectItem>
              <SelectItem value="7">
                {"過度なグロテスク表現が含まれている"}
              </SelectItem>
              <SelectItem value="8">
                {
                  "実写に見える作品で、児童ポルノと認定される恐れのある内容が含まれている"
                }
              </SelectItem>
              <SelectItem value="9">
                {"サイトで禁止されているコンテンツへの誘導が含まれている"}
              </SelectItem>
              <SelectItem value="10">{"その他"}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <h4 className="text-md">{"詳細（任意）"}</h4>
        <DialogDescription>
          {
            "無断転載、プライバシー、肖像権についての報告の場合は、転載元や侵害されている人物の情報を記載してください"
          }
        </DialogDescription>
        <Textarea
          placeholder="問題の詳細を入力してください"
          className="resize-none"
        />
        <DialogFooter>
          <DialogClose>
            <Button
              onClick={() => {
                toast("開発中につき、送信されません")
              }}
            >
              {"送信"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
