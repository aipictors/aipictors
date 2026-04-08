import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Link } from "@remix-run/react"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"
import { useId } from "react"

type Props = {
  rating: IntrospectionEnum<"Rating">
  setRating: (value: IntrospectionEnum<"Rating">) => void
  allowedRatings?: IntrospectionEnum<"Rating">[]
  note?: string | null
}

const ratingOptions = [
  {
    value: "G",
    labelJa: "全年齢",
    labelEn: "All Ages",
    descriptionJa: "すべての年齢層が安全に閲覧できる内容",
    descriptionEn: "Safe for all ages to view",
  },
  {
    value: "R15",
    labelJa: "全年齢（性的描写あり）",
    labelEn: "All Ages (Sexual Content)",
    descriptionJa: "軽度な性的表現、血流表現あり",
    descriptionEn: "Mild sexual and blood flow expressions",
  },
  {
    value: "R18",
    labelJa: "R-18",
    labelEn: "R-18",
    descriptionJa: "18歳以上対象の成人向け内容",
    descriptionEn: "Adult content for ages 18 and above",
  },
  {
    value: "R18G",
    labelJa: "R-18G",
    labelEn: "R-18G",
    descriptionJa: "過激な内容（排泄、暴力的含む）",
    descriptionEn: "More extreme adult content",
  },
] as const

export function PostFormItemRating (props: Props) {
  const t = useTranslation()
  const gId = useId()
  const r15Id = useId()
  const r18Id = useId()
  const r18gId = useId()
  const optionIds = [gId, r15Id, r18Id, r18gId]
  const allowedRatings = props.allowedRatings ?? ["G", "R15", "R18", "R18G"]

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {t("年齢制限（必須）", "Age Restriction")}
        </p>
        {props.note && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 text-xs dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            {props.note}
          </div>
        )}
        <RadioGroup
          value={props.rating || "G"}
          onValueChange={(value) => {
            props.setRating(value as IntrospectionEnum<"Rating">)
          }}
          className="space-y-2"
        >
          {ratingOptions.map((option, index) => {
            const isAllowed = allowedRatings.includes(
              option.value as IntrospectionEnum<"Rating">,
            )

            return (
              <div
                key={option.value}
                className={`flex items-center space-x-3 rounded-md p-1 ${!isAllowed ? "opacity-50" : ""}`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={optionIds[index]}
                  disabled={!isAllowed}
                />
                <label
                  htmlFor={optionIds[index]}
                  className={`flex-1 ${isAllowed ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  <div className="font-medium">
                    {t(option.labelJa, option.labelEn)}
                  </div>
                  <div className="text-gray-600 text-sm dark:text-gray-300">
                    {t(option.descriptionJa, option.descriptionEn)}
                    {option.value === "R15" && (
                      <>
                        {" "}
                        <Link
                          target="_blank"
                          to="/terms"
                          className="text-blue-500 underline"
                        >
                          {t("詳細", "Details")}
                        </Link>
                      </>
                    )}
                  </div>
                </label>
              </div>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
