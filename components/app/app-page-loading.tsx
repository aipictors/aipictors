import { AppPage } from "@/components/app/app-page"
import { AppSpinnerIcon } from "@/components/app/app-spinner-icon"

type Props = {
  text?: string
}

export const AppPageLoading = (props: Props) => {
  return (
    <AppPage>
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4 md:space-y-12">
          <AppSpinnerIcon />
          {props.text && <p className="font-bold text-sm">{props.text}</p>}
        </div>
      </div>
    </AppPage>
  )
}
