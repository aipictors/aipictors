import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/cn"
import { toMoneyNumberText } from "@/utils/to-money-number-text"

type Props = {
  title: string
  price: number
  features: string[]
  isPrimary?: boolean
  isDisabled?: boolean
  isCurrent?: boolean
  isHide?: boolean
  isLoading: boolean
  onClick(): Promise<void>
}

export const PassPlanDescription = (props: Props) => {
  return (
    <Card className={cn("h-full", props.isPrimary && "border-blue-500")}>
      <CardHeader className="space-y-2">
        <CardDescription>{props.title}</CardDescription>
        <CardTitle>{`${toMoneyNumberText(props.price)}円（税込）`}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        {(props.isHide === false || props.isHide === undefined) &&
          props.isCurrent && (
            <Button className="w-full" disabled={true} onClick={props.onClick}>
              {"加入中"}
            </Button>
          )}
        {(props.isHide === false || props.isHide === undefined) &&
          !props.isCurrent && (
            <Button
              className="w-full"
              disabled={props.isDisabled ?? props.isLoading}
              onClick={props.onClick}
            >
              {props.isDisabled ? "準備中" : "決済する"}
            </Button>
          )}
        <div className="space-y-1">
          <p>{"広告の非表示"}</p>
          <p>{"認証マークの表示"}</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-sm opacity-60">{"画像生成"}</p>
          {props.features.map((feature) => (
            <p key={feature}>{feature}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
