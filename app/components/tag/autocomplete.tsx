// https://github.com/JaleelB/emblor/blob/main/website/components/tag/autocomplete.tsx

import type React from "react"
import {
  Command,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "~/components/ui/command"
import type { Tag as TagType } from "./tag-input"

type AutocompleteProps = {
  tags: TagType[]
  setTags: React.Dispatch<React.SetStateAction<TagType[]>>
  autocompleteOptions: TagType[]
  maxTags?: number
  onTagAdd?: (tag: string) => void
  allowDuplicates: boolean
  children: React.ReactNode
}

export function Autocomplete ({
  tags,
  setTags,
  autocompleteOptions,
  maxTags,
  onTagAdd,
  allowDuplicates,
  children,
}: AutocompleteProps): React.ReactNode {
  return (
    <Command className="border">
      {children}
      <CommandList>
        <CommandEmpty>{"検索結果なし"}</CommandEmpty>
        <CommandGroup heading="">
          {autocompleteOptions.map((option) => (
            <CommandItem key={option.id}>
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
              <div
                className="w-full"
                onClick={() => {
                  if (maxTags && tags.length >= maxTags) return
                  if (
                    !allowDuplicates &&
                    tags.some((tag) => tag.text === option.text)
                  )
                    return
                  setTags([...tags, option])
                  onTagAdd?.(option.text)
                }}
              >
                {option.text}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
