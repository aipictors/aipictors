import { CheckIcon, ChevronDown, ChevronUp } from "lucide-react"
import type { SortType } from "~/types/sort-type"
import type { SortListSelectorType } from "~/types/sort-list-selector-type"

type Props = {
  sortList: SortListSelectorType[]
  nowSort: SortType
  nowSortType: string
}

export function SortListSelector(props: Props) {
  return (
    <>
      <div className="p-4">
        {props.sortList.map((item, index) => (
          <div
            key={`${item.sortType}-${index}`}
            onClick={item.callback}
            onKeyUp={item.callback}
            onKeyDown={item.callback}
            onKeyPress={item.callback}
            className="flex w-full cursor-pointer items-center p-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {props.nowSortType === item.sortType ? (
              <CheckIcon className="mr-2 w-4" />
            ) : (
              <div className="w-6" />
            )}
            <div className="m-2 flex items-center">{item.label}</div>
            {props.nowSortType === item.sortType && (
              <div className="flex items-center">
                {props.nowSort === "ASC" ? (
                  <>
                    <div>
                      <ChevronUp className="size-4" />
                      <ChevronDown className="size-4 opacity-40" />
                    </div>
                  </>
                ) : (
                  <div>
                    <ChevronUp className="size-4 opacity-40" />
                    <ChevronDown className="size-4" />
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
