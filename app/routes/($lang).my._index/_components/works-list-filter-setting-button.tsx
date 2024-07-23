import { Button } from "@/_components/ui/button"

type Props = {
  onToggleFilterButton: () => void
}

/**
 * 作品一覧フィルター
 */
export const WorksListFilterSettingButton = (props: Props) => {
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
