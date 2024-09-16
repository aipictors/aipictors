import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  date: string | null
  time: string | null
  setDate: (value: string) => void
  setTime: (value: string) => void
}

/**
 * 日付入力
 */
export function PostFormItemDate(props: Props) {
  const hasValue = props.date || props.time

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">予約投稿</p>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            type="date"
            value={props.date ?? ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.setDate(event.target.value)
            }
            className="w-40"
          />
          <Input
            type="time"
            value={props.time ?? ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.setTime(event.target.value)
            }
            className="w-24"
          />
        </div>
        {hasValue && (
          <div className="flex justify-end">
            <Button
              onClick={() => {
                props.setDate("")
                props.setTime("")
              }}
              variant={"secondary"}
            >
              {"クリア"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
