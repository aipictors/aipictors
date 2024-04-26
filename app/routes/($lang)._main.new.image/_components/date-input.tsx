import { Input } from "@/_components/ui/input"
import {} from "@/_components/ui/radio-group"
import {} from "@/_components/ui/select"

type Props = {
  date: string
  time: string
  setDate: (value: string) => void
  setTime: (value: string) => void
}

/**
 * 日付入力
 * @param props
 * @returns
 */
const DateInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">予約投稿</p>
          <div className="block md:flex">
            <Input
              type="date"
              value={props.date}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                props.setDate(event.target.value)
              }
              className="mt-2 mr-0 md:mt-0 md:mr-2"
            />
            <Input
              type="time"
              value={props.time}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                props.setTime(event.target.value)
              }
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default DateInput
