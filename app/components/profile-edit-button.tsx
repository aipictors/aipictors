import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"
import { SettingProfileForm } from "~/routes/($lang).settings.profile/components/setting-profile-form"

type Props = {
  triggerChildren: React.ReactNode
}

/**
 * プロフィール編集
 */
export function ProfileEditDialog(props: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.triggerChildren}</DialogTrigger>
      <DialogContent>
        <SettingProfileForm />
      </DialogContent>
    </Dialog>
  )
}
