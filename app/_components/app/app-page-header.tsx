import { AppBreadcrumb } from "@/_components/app/app-breadcrumb"
import { cn } from "@/_lib/utils"
import type { BreadcrumbList, WithContext } from "schema-dts"

type Props = {
  className?: string
  breadcrumb?: WithContext<BreadcrumbList>
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

export const AppPageHeader = (props: Props) => {
  return (
    <div className={cn("space-y-1", props.className)}>
      {props.breadcrumb && <AppBreadcrumb breadcrumb={props.breadcrumb} />}
      {props.title && (
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl min-h-9">{props.title}</h1>
          {props.action}
        </div>
      )}
      {props.description && <p className="text-sm">{props.description}</p>}
    </div>
  )
}
