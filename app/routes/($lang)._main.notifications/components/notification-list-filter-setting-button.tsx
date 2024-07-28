import { Button } from "@/components/ui/button"

type Props = {
  onToggleFilterButton: () => void
}

/**
 * 通知一覧フィルター
 */
export const NotificationListFilterSettingButton = (props: Props) => {
  return (
    <>
      <Button
        className="block"
        variant={"secondary"}
        onClick={props.onToggleFilterButton}
      >
        絞り込む
      </Button>
    </>
  )
}
