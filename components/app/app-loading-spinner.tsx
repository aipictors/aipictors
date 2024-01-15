import { AppSpinnerIcon } from "@/components/app/app-spinner-icon"

type Props = {
  text?: string
}

export const AppLoadingSpinner = (props: Props) => {
  return (
    <div className="w-full py-80 flex flex-col justify-center items-center">
      <AppSpinnerIcon />
      {props.text && <p>{props.text}</p>}
    </div>
  )
}
