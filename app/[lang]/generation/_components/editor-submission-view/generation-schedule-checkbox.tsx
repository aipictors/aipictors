"use client"

import { Checkbox } from "@/components/ui/checkbox"

type Props = {
  value: boolean
  onChange(isScheduleMode: boolean): void
}

export function GenerationScheduleCheckbox(props: Props) {
  return (
    <div className="flex items-center w-14 space-x-2">
      <Checkbox
        id="generation-mode-checkbox"
        checked={props.value}
        onCheckedChange={props.onChange}
      />
      <label
        htmlFor="generation-mode-checkbox"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-16"
      >
        予約
      </label>
    </div>
  )
}
