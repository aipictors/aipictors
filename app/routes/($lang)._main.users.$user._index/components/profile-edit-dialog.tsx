import { lazy, Suspense, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"

// 自分のプロフィールを編集するときに読み込む
const SettingProfileForm = lazy(() =>
  import(
    "~/routes/($lang).settings.profile/components/setting-profile-form"
  ).then((module) => ({ default: module.SettingProfileForm })),
)

type Props = {
  triggerChildren: React.ReactNode
}

/**
 * プロフィール編集ダイアログ
 * スマホは全画面にして、本文だけをスクロールする（保存ボタンは下に固定）。
 * Radix の ScrollArea は中身を display: table で包むため、横スクロールの項目ナビなどの幅で
 * 本文が画面より広がってはみ出していた。ふつうの overflow-y-auto で幅を画面に合わせる。
 */
export function ProfileEditDialog(props: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.triggerChildren}</DialogTrigger>
      <DialogContent className="top-0 flex h-dvh max-h-dvh w-full max-w-none flex-col gap-0 overflow-hidden p-0 sm:top-[50%] sm:h-[88dvh] sm:max-h-[88dvh] sm:w-full sm:max-w-lg sm:rounded-lg [&>button:last-child]:top-1.5 [&>button:last-child]:right-1.5 [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center">
        <DialogHeader className="shrink-0 border-b px-4 pt-[max(1rem,env(safe-area-inset-top))] pr-14 pb-3 text-left sm:px-6 sm:pt-5">
          <DialogTitle>プロフィール編集</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 pt-4 sm:px-6">
          {open && (
            <Suspense fallback={null}>
              <SettingProfileForm onCancel={() => setOpen(false)} />
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
