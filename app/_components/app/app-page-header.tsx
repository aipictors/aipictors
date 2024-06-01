import { AppBreadcrumb } from "@/_components/app/app-breadcrumb"
import { cn } from "@/_lib/cn"
import type { BreadcrumbList, WithContext } from "schema-dts"

type Props = Readonly<{
  className?: string
  breadcrumb?: WithContext<BreadcrumbList>
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}>

export function AppPageHeader(props: Props) {
  return (
    <div className={cn("space-y-1", props.className)}>
      {props.breadcrumb && <AppBreadcrumb breadcrumb={props.breadcrumb} />}
      {props.title && (
        <div className="flex items-center justify-between">
          <h1 className="min-h-9 font-bold text-2xl">{props.title}</h1>
          {props.action}
        </div>
      )}
      {props.description && <p className="text-sm">{props.description}</p>}
    </div>
  )
}
