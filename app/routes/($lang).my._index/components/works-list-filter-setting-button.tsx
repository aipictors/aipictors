import { Button } from "~/components/ui/button"

type Props = {
  onToggleFilterButton: () => void
}

/**
 * 作品一覧フィルター
 */
export function WorksListFilterSettingButton (props: Props) {
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
