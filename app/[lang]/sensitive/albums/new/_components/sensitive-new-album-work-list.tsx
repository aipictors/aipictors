"use client"

import { Box, Stack } from "@chakra-ui/react"
import { Splide, SplideSlide } from "@splidejs/react-splide"

import { SensitiveSelectableWorkCard } from "@/app/[lang]/sensitive/albums/new/_components/sensitive-selectable-work-card"

export const SensitiveNewAlbumWorkList = () => {
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
          <SensitiveSelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SensitiveSelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SensitiveSelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SensitiveSelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SensitiveSelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SensitiveSelectableWorkCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <SensitiveSelectableWorkCard />
        </Box>
      </Splide>
    </Stack>
  )
}
