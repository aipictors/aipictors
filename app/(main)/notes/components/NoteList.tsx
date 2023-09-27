"use client"
import { Stack } from "@chakra-ui/react"
import { NoteListItem } from "app/(main)/notes/components/NoteListItem"

export const NoteList: React.FC = () => {
  return (
    <Stack>
      <NoteListItem />
    </Stack>
  )
}
