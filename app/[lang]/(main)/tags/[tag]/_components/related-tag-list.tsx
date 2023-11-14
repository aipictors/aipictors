"use client"

import { TagCard } from "@/app/[lang]/(main)/tags/[tag]/_components/tag-card"
import { Box, Stack } from "@chakra-ui/react"
import { Splide, SplideSlide } from "@splidejs/react-splide"

export const RelatedTagList = () => {
  return (
    <Stack>
      <Splide
        aria-label="関連タグ"
        options={{
          rewind: true,
          gap: "1rem",
          autoWidth: true,
          pagination: false,
          arrows: false,
        }}
      >
        <Box as={SplideSlide} w={40}>
          <TagCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <TagCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <TagCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <TagCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <TagCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <TagCard />
        </Box>
        <Box as={SplideSlide} w={40}>
          <TagCard />
        </Box>
      </Splide>
    </Stack>
  )
}
