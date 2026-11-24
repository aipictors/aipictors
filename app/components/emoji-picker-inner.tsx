import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"

type Props = {
  onSelect(emoji: string): void
}

export function EmojiPickerInner(props: Props) {
  return (
    <Picker
      data={data}
      onEmojiSelect={(emoji: { native: string }) => {
        props.onSelect(emoji.native)
      }}
      theme="auto"
      locale="ja"
      previewPosition="none"
      skinTonePosition="search"
      set="native"
    />
  )
}
