import type { SortType } from "@/_types/sort-type"

export type SortListSelectorType = {
  sort: SortType
  sortType: string
  label: string
  callback: () => void
}
