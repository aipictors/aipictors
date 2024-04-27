import { RadioGroup, RadioGroupItem } from "@/_components/ui/radio-group"

type Props = {
  viewMode: string
  setViewMode: (value: string) => void
}

/**
 * 公開モード入力
 * @param props
 * @returns
 */
export const ViewInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">公開モード</p>
          <RadioGroup
            value={props.viewMode}
            onValueChange={(value) => {
              props.setViewMode(value)
            }}
            className="flex flex-wrap"
          >
            <div className="mb-2 w-1/3 md:w-auto">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="view-public" />
                <label htmlFor="view-public">{"全公開"}</label>
              </div>
            </div>
            <div className="mb-2 w-1/3 md:w-auto">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="view-private" />
                <label htmlFor="view-private">{"限定公開"}</label>
              </div>
            </div>
            <div className="mb-2 w-1/3 md:w-auto">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="archive" id="view-archive" />
                <label htmlFor="view-archive">{"アーカイブ"}</label>
              </div>
            </div>
            <div className="mb-2 w-1/3 md:w-auto">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="view-draft" />
                <label htmlFor="view-draft">{"下書き"}</label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </>
  )
}
