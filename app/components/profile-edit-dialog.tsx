import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SettingProfileForm } from "@/routes/($lang).settings.profile/components/setting-profile-form"

type Props = {
  triggerChildren: React.ReactNode
}

/**
 * プロフィール編集ダイアログ
 */
export function ProfileEditDialog(props: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.triggerChildren}</DialogTrigger>
      <DialogContent>
        <ScrollArea className="h-[80vh] overflow-hidden pr-4">
          <SettingProfileForm />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
