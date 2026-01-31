import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Link } from "@remix-run/react"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"
import { useId } from "react"

type Props = {
  rating: IntrospectionEnum<"Rating">
  setRating: (value: IntrospectionEnum<"Rating">) => void
}

export function PostFormItemRating (props: Props) {
  const t = useTranslation()
  const gId = useId()
  const r15Id = useId()
  const r18Id = useId()
  const r18gId = useId()

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {t("年齢制限（必須）", "Age Restriction")}
        </p>
        <RadioGroup
          value={props.rating || "G"}
          onValueChange={(value) => {
            props.setRating(value as IntrospectionEnum<"Rating">)
          }}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3 p-1">
            <RadioGroupItem value="G" id={gId} />
            <label htmlFor={gId} className="flex-1 cursor-pointer">
              <div className="font-medium">{t("全年齢", "All Ages")}</div>
              <div className="text-gray-600 text-sm dark:text-gray-300">
                {t(
                  "すべての年齢層が安全に閲覧できる内容",
                  "Safe for all ages to view",
                )}
              </div>
            </label>
          </div>
          <div className="flex items-center space-x-3 p-1">
            <RadioGroupItem value="R15" id={r15Id} />
            <label htmlFor={r15Id} className="flex-1 cursor-pointer">
              <div className="font-medium">
                {t("全年齢（性的描写あり）", "All Ages (Sexual Content)")}
              </div>
              <div className="text-gray-600 text-sm dark:text-gray-300">
                {t(
                  "軽度な性的表現、血流表現あり",
                  "Mild sexual and blood flow expressions",
                )}{" "}
                <Link
                  target="_blank"
                  to="/terms"
                  className="text-blue-500 underline"
                >
                  {t("詳細", "Details")}
                </Link>
              </div>
            </label>
          </div>
          <div className="flex items-center space-x-3 p-1">
            <RadioGroupItem value="R18" id={r18Id} />
            <label htmlFor={r18Id} className="flex-1 cursor-pointer">
              <div className="font-medium">{"R-18"}</div>
              <div className="text-gray-600 text-sm dark:text-gray-300">
                {t(
                  "18歳以上対象の成人向け内容",
                  "Adult content for ages 18 and above",
                )}
              </div>
            </label>
          </div>
          <div className="flex items-center space-x-3 p-1">
            <RadioGroupItem value="R18G" id={r18gId} />
            <label htmlFor={r18gId} className="flex-1 cursor-pointer">
              <div className="font-medium">{"R-18G"}</div>
              <div className="text-gray-600 text-sm dark:text-gray-300">
                {t(
                  "過激な内容（排泄、暴力的含む）",
                  "More extreme adult content",
                )}
              </div>
            </label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
