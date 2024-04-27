import {
  Command,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/_components/ui/command"
import type { Tag as TagType } from "@/_components/tag/tag-input"

type AutocompleteProps = {
  tags: TagType[]
  setTags: React.Dispatch<React.SetStateAction<TagType[]>>
  autocompleteOptions: TagType[]
  maxTags?: number
  onTagAdd?: (tag: string) => void
  allowDuplicates: boolean
  children: React.ReactNode
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  tags,
  setTags,
  autocompleteOptions,
  maxTags,
  onTagAdd,
  allowDuplicates,
  children,
}) => {
  return (
    <Command className="w-full border">
      {children}
      <CommandList>
        {/* <CommandEmpty>No results found.</CommandEmpty> */}
        {autocompleteOptions.length !== 0 && (
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
        )}
      </CommandList>
    </Command>
  )
}
