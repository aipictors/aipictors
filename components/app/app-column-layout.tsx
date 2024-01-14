import { cn } from "@/lib/utils"

type Props = {
  className?: string
  children: React.ReactNode
}

export const AppColumnLayout = (props: Props) => {
  return (
    <div className="flex items-start space-x-0 max-w-screen-xl w-full mx-auto">
      {props.children}
    </div>
  )
}
