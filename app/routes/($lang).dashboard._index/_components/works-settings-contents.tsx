import { RoundedLightButton } from "@/_components/button/rounded-light-button"
import type { WorkTabType } from "@/routes/($lang).dashboard._index/_types/work-tab-type"

type Props = {
  workTabType: WorkTabType | null
  sumWorksCount: number
  sumAlbumsCount: number
  setWorkTabType: (workTabType: WorkTabType | null) => void
}

/**
 * 作品一覧カテゴリ切替
 */
export const WorksSettingContents = (props: Props) => {
  return (
    <>
      <div className="flex space-x-2">
        <RoundedLightButton
          onClick={() => {
            props.setWorkTabType("WORK")
          }}
          isActive={props.workTabType === "WORK"}
        >
          {"作品"}
          <div className="m-2 min-w-8 rounded-full bg-zinc-400 pr-1 pl-1 text-white dark:bg-zinc-600">
            {props.sumWorksCount}
          </div>
        </RoundedLightButton>
        <RoundedLightButton
          onClick={() => {
            props.setWorkTabType("ALBUM")
          }}
          isActive={props.workTabType === "ALBUM"}
        >
          {"シリーズ"}
          <div className="m-2 min-w-8 rounded-full bg-zinc-400 pr-1 pl-1 text-white dark:bg-zinc-600">
            {props.sumAlbumsCount}
          </div>
        </RoundedLightButton>
      </div>
    </>
  )
}
