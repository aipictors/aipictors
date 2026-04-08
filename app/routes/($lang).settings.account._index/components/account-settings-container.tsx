import { useTranslation } from "~/hooks/use-translation"
import { SNSConnectSection } from "~/routes/($lang).settings.account._index/components/sns-connect-section"

export function AccountSettingsContainer() {
  const t = useTranslation()

  return (
    <div className="space-y-8">
      <SNSConnectSection />
    </div>
  )
}
