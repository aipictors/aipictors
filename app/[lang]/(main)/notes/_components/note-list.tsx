"use client"

import { Stack } from "@chakra-ui/react"
import { NoteCard } from "app/[lang]/(main)/notes/_components/note-card"

export const NoteList: React.FC = () => {
  return (
    <Stack>
      <NoteCard />
    </Stack>
  )
}
