import { AppPage } from "@/components/app/app-page"
import { AppRippleIcon } from "@/components/app/app-ripple-icon"

type Props = {
  text?: string
}

export const AppPageLoading = (props: Props) => {
  return (
    <AppPage>
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4 md:space-y-12">
          <AppRippleIcon />
          {props.text && <p className="font-bold text-sm">{props.text}</p>}
        </div>
      </div>
    </AppPage>
  )
}
