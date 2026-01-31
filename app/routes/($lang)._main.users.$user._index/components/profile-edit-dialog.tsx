import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { SettingProfileForm } from "~/routes/($lang).settings.profile/components/setting-profile-form"
import { useState } from "react"

type Props = {
  triggerChildren: React.ReactNode
}

/**
 * プロフィール編集ダイアログ
 */
export function ProfileEditDialog (props: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.triggerChildren}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プロフィール編集</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[80vh] overflow-hidden pr-4">
          {open && <SettingProfileForm />}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
