import { RadioGroup, RadioGroupItem } from "@/_components/ui/radio-group"

type Props = {
  rating: string
  setRating: (value: string) => void
}

/**
 * 年齢制限入力
 */
export const RatingInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">年齢制限</p>
          <RadioGroup
            value={props.rating}
            onValueChange={(value) => {
              props.setRating(value)
            }}
            className="flex items-center space-x-2 text-sm"
          >
            <div className="items-center space-x-2">
              <RadioGroupItem value="G" id="person-check" />
              <label htmlFor="person-check">{"全年齢"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="R15" id="animal-check" />
              <label htmlFor="animal-check">{"R15"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="R18" id="machine-check" />
              <label htmlFor="machine-check">{"R18"}</label>
            </div>
            <div className="items-center space-x-2">
              <RadioGroupItem value="R18G" id="background-check" />
              <label htmlFor="background-check">{"R18G"}</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </>
  )
}
