"use client"

import { Box, Stack } from "@chakra-ui/react"
import { Splide, SplideSlide } from "@splidejs/react-splide"
import { SelectableWorkCard } from "app/[lang]/(main)/new/album/_components/SelectableWorkCard"

export const NewAlbumWorkList: React.FC = () => {
  return (
    <Stack>
      <Splide
        aria-label="投稿済み作品一覧"
        options={{
          rewind: true,
          gap: "1rem",
          autoWidth: true,
          pagination: false,
          arrows: false,
        }}
      >
        <Box as={SplideSlide} w={40}>
          <SelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SelectableWorkCard />
        </Box>
      </Splide>
    </Stack>
  )
}
