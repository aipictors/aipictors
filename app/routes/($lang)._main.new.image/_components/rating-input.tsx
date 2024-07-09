import { RadioGroup, RadioGroupItem } from "@/_components/ui/radio-group"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { Link } from "@remix-run/react"

type Props = {
  rating: IntrospectionEnum<"Rating">
  setRating: (value: IntrospectionEnum<"Rating">) => void
}

/**
 * 年齢制限入力
 */
export const RatingInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-secondary pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">年齢制限</p>
          <RadioGroup
            value={props.rating}
            onValueChange={(value) => {
              props.setRating(value as IntrospectionEnum<"Rating">)
            }}
            className="flex flex-wrap space-x-0 text-sm"
          >
            <div className="mb-2 md:w-auto">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="G" id="person-check" />
                <label htmlFor="person-check">
                  {"全年齢（公共の場でも掲出できるもの）"}
                </label>
              </div>
            </div>
            <div className="mb-2 w-auto">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="R15" id="animal-check" />
                <label htmlFor="animal-check">
                  {"R15（軽度な性的表現、水着など"}
                  <Link
                    target="_blank"
                    to="/terms"
                    className="text-clear-bright-blue"
                  >
                    詳細
                  </Link>
                  {"）"}
                </label>
              </div>
            </div>
            <div className="mb-2 w-1/3 md:w-auto">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="R18" id="machine-check" />
                <label htmlFor="machine-check">{"R18"}</label>
              </div>
            </div>
            <div className="mb-2 w-1/3 md:w-auto">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="R18G" id="background-check" />
                <label htmlFor="background-check">{"R18G"}</label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </>
  )
}
