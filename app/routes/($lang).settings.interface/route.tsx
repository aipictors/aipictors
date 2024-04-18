import { AppPageCenter } from "@/_components/app/app-page-center"
import { SettingInterfaceForm } from "@/routes/($lang).settings.interface/_components/setting-interface-form"

export default function SettingInterface() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"UIカスタム"}</p>
        <SettingInterfaceForm />
      </div>
    </AppPageCenter>
  )
}
