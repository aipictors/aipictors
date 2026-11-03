import { lazy, Suspense, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"

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
 */
export function ProfileEditDialog(props: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.triggerChildren}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プロフィール編集</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[80vh] overflow-hidden pr-4">
          {open && (
            <Suspense fallback={null}>
              <SettingProfileForm />
            </Suspense>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
