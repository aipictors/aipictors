import { ExternalLink, List, Navigation, PlaySquare } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type SegmentProps = {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}

function Segment(props: SegmentProps): React.ReactNode {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={props.isActive}
      onClick={props.onClick}
      className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
        props.isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {props.children}
    </Button>
  )
}

type Props = {
  /** フィード / ページの切り替えを出すときだけ渡す */
  isPagination?: boolean
  onChangePagination?: (isPagination: boolean) => void
  isDialogMode: boolean
  onChangeDialogMode: (isDialogMode: boolean) => void
}

/**
 * 一覧の見せ方の切り替え
 */
export function SensitiveViewModeToggle(props: Props): React.ReactNode {
  const t = useTranslation()
  const onChangePagination = props.onChangePagination

  return (
    <div className="flex justify-end space-x-2 md:space-x-4">
      {onChangePagination && (
        <div className="flex rounded-lg bg-muted p-1">
          <Segment
            isActive={props.isPagination === false}
            onClick={() => onChangePagination(false)}
          >
            <List className="h-3 w-3" />
            <span>{t("フィード", "Feed")}</span>
          </Segment>
          <Segment
            isActive={props.isPagination === true}
            onClick={() => onChangePagination(true)}
          >
            <Navigation className="h-3 w-3" />
            <span>{t("ページ", "Pages")}</span>
          </Segment>
        </div>
      )}
      <div className="flex rounded-lg bg-muted p-1">
        <Segment
          isActive={!props.isDialogMode}
          onClick={() => props.onChangeDialogMode(false)}
        >
          <ExternalLink className="h-3 w-3" />
          <span>{t("ページで開く", "Open page")}</span>
        </Segment>
        <Segment
          isActive={props.isDialogMode}
          onClick={() => props.onChangeDialogMode(true)}
        >
          <PlaySquare className="h-3 w-3" />
          <span>{t("その場で開く", "Dialog")}</span>
        </Segment>
      </div>
    </div>
  )
}
