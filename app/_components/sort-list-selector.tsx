import { CheckIcon, ChevronDown, ChevronUp } from "lucide-react"
import type { SortType } from "@/_types/sort-type"
import type { SortListSelectorType } from "@/_types/sort-list-selector-type"

type Props = {
  sortList: SortListSelectorType[]
  nowSort: SortType
  nowSortType: string
}

export const SortListSelector = (props: Props) => {
  // sortList.map((sort) => {

  return (
    <>
      <div className="p-4">
        {props.sortList.map((item, index) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            onClick={item.callback}
            className="flex w-full cursor-pointer items-center p-4 transition-all dark:hover:bg-gray-800 hover:bg-gray-100"
          >
            {props.nowSortType === item.sortType ? (
              <CheckIcon className="mr-2 w-4" />
            ) : (
              <div className="w-6" />
            )}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div>
              <div className="m-2 flex items-center">{item.label}</div>
            </div>
            {props.nowSortType === item.sortType && (
              <div className="flex items-center">
                {props.nowSort === "ASC" ? (
                  <>
                    <div>
                      <ChevronUp className="h-4 w-4" />
                      <ChevronDown className="h-4 w-4 opacity-40" />
                    </div>
                  </>
                ) : (
                  <div>
                    <ChevronUp className="h-4 w-4 opacity-40" />
                    <ChevronDown className="h-4 w-4" />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
