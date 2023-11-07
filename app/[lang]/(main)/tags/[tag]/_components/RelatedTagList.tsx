"use client"

import { Box, Stack } from "@chakra-ui/react"
import { Splide, SplideSlide } from "@splidejs/react-splide"
import { TagCard } from "app/[lang]/(main)/tags/[tag]/_components/TagCard"

export const RelatedTagList: React.FC = () => {
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
