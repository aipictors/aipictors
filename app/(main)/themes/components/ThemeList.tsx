"use client"
import { SimpleGrid, Box, Text } from "@chakra-ui/react"
import { FC } from "react"
import { DailyThemesQuery } from "__generated__/apollo"

type Props = {
  dailyThemesQuery: DailyThemesQuery
}

export const ThemeList: FC<Props> = (props) => {
  return (
    <SimpleGrid
      as={"ul"}
      w={"100%"}
      minChildWidth={{ base: "180px", md: "240px" }}
      spacing={2}
      pr={4}
    >
      {props.dailyThemesQuery.dailyThemes?.map((dailyThemes) => (
        <Box as={"li"} key={dailyThemes.id}>
          <Text>{dailyThemes.title}</Text>
        </Box>
      ))}
    </SimpleGrid>
  )
}
