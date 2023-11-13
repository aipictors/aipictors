"use client"

import { NoteCard } from "@/app/[lang]/(main)/notes/_components/note-card"
import { Stack } from "@chakra-ui/react"

export const NoteList: React.FC = () => {
  return (
    <Stack>
      <NoteCard />
    </Stack>
  )
}
