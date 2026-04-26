import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { toMoneyNumberText } from "~/utils/to-money-number-text"
import { useTranslation } from "~/hooks/use-translation"

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

export function PassPlanDescription (props: Props) {
  const t = useTranslation()

  return (
    <Card className={cn("h-full", props.isPrimary && "border-blue-500")}>
      <CardHeader className="space-y-2">
        <CardDescription>{props.title}</CardDescription>
        <CardTitle>{`${toMoneyNumberText(props.price)}${t("円（税込）", " JPY (tax included)")}`}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        {(props.isHide === false || props.isHide === undefined) &&
          props.isCurrent && (
            <Button className="w-full" disabled={true} onClick={props.onClick}>
              {t("加入中", "Subscribed")}
            </Button>
          )}
        {(props.isHide === false || props.isHide === undefined) &&
          !props.isCurrent && (
            <Button
              className="w-full bg-[#00A3FF] font-extrabold text-white tracking-wide shadow-[0_8px_20px_rgba(0,163,255,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0089d9] hover:shadow-[0_12px_28px_rgba(0,137,217,0.45)] dark:bg-[#00A3FF] dark:text-white dark:hover:bg-[#0089d9]"
              disabled={props.isDisabled ?? props.isLoading}
              onClick={props.onClick}
            >
              {props.isDisabled
                ? t("準備中", "Coming Soon")
                : t("登録する", "Register")}
            </Button>
          )}
        <div className="space-y-1">
          <p>{t("広告の非表示", "Ad-free")}</p>
          <p>{t("認証マークの表示", "Display of verification badge")}</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-sm opacity-60">
            {t("画像生成", "Image Generation")}
          </p>
          {props.features.map((feature) => (
            <p key={feature}>{feature}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
