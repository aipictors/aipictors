import type { SortType } from "~/types/sort-type"

export type SortListSelectorType = {
  sort: SortType
  sortType: string
  label: string
  callback: () => void
}
