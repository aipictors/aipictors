import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Link } from "@remix-run/react"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  rating: IntrospectionEnum<"Rating">
  setRating: (value: IntrospectionEnum<"Rating">) => void
}

/**
 * 年齢制限入力
 */
export const PostFormItemRating = (props: Props) => {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">年齢制限</p>
        <p className="font-bold text-xs opacity-70">
          入力画像からAIで判定されます
        </p>
        <p className="font-bold text-xs opacity-70">
          誤っている場合は手動で補正してください
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
                {"全年齢（公共の場でも掲出できるもの）"}
              </label>
            </div>
          </div>
          <div className="w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="R15" id="animal-check" />
              <label htmlFor="animal-check">
                {"R15（軽度な性的表現、水着など"}
                <Link
                  target="_blank"
                  to="/terms"
                  className="text-clear-bright-blue"
                >
                  {"詳細"}
                </Link>
                {"）"}
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
