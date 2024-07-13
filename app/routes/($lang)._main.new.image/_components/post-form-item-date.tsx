import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { Card } from "@/_components/ui/card"

type Props = {
  date: string | null
  time: string | null
  setDate: (value: string) => void
  setTime: (value: string) => void
}

/**
 * 日付入力
 */
export const PostFormItemDate = (props: Props) => {
  return (
    <>
      <Card className="p-1">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">予約投稿</p>
          <div className="block md:flex">
            <Input
              type="date"
              value={props.date ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                props.setDate(event.target.value)
              }
              className="mt-2 mr-0 md:mt-0 md:mr-2"
            />
            <Input
              type="time"
              value={props.time ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                props.setTime(event.target.value)
              }
            />
          </div>
          {(props.date || props.time) && (
            <Button
              onClick={() => {
                props.setDate("")
                props.setTime("")
              }}
              variant={"secondary"}
              className="mt-2"
            >
              {"クリア"}
            </Button>
          )}
        </div>
      </Card>
    </>
  )
}
