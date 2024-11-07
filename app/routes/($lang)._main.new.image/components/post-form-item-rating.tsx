import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Link } from "@remix-run/react"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  rating: IntrospectionEnum<"Rating">
  setRating: (value: IntrospectionEnum<"Rating">) => void
}

/**
 * 年齢制限入力
 */
export function PostFormItemRating(props: Props) {
  const t = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{t("年齢制限", "Age Restriction")}</p>
        <p className="font-bold text-xs opacity-70">
          {t(
            "入力画像からAIで判定されます",
            "Automatically judged by AI from the uploaded image",
          )}
        </p>
        <p className="font-bold text-xs opacity-70">
          {t(
            "誤っている場合は手動で補正してください",
            "Please correct manually if it's incorrect",
          )}
        </p>
        <RadioGroup
          value={props.rating}
          onValueChange={(value) => {
            props.setRating(value as IntrospectionEnum<"Rating">)
          }}
          className="flex flex-wrap space-x-0 text-sm"
        >
          <div className="md:w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="G" id="person-check" />
              <label htmlFor="person-check">
                {t("全年齢", "All Ages (Safe for public display)")}
              </label>
            </div>
          </div>
          <div className="w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="R15" id="animal-check" />
              <label htmlFor="animal-check">
                {t(
                  "軽度な性的、血流表現あり(",
                  "Mild sexual and blood flow expressions",
                )}
                <Link
                  target="_blank"
                  to="/terms"
                  className="text-clear-bright-blue"
                >
                  {t("詳細", "Details")}
                </Link>
                {t("）", ")")}
              </label>
            </div>
          </div>
          <div className="w-1/3 md:w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="R18" id="machine-check" />
              <label htmlFor="machine-check">{"R18"}</label>
            </div>
          </div>
          <div className="w-1/3 md:w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="R18G" id="background-check" />
              <label htmlFor="background-check">{"R18G"}</label>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
