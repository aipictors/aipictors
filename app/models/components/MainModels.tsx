"use client"
import { Box, Grid, HStack, Stack, Text, Image } from "@chakra-ui/react"
import { FC } from "react"
import { ImageModelsQuery } from "__generated__/apollo"

type Props = {
  imageModelsQuery: ImageModelsQuery
}

export const MainModels: FC<Props> = (props) => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"モデル"}
        </Text>
        <Grid templateColumns="repeat(4, 1fr)" gap={6}>
          {props.imageModelsQuery.imageModels.map((imageModel) => (
            <Box key={imageModel.id} overflow={"hidden"}>
              <Image
                src={imageModel.thumbnailImageURL!}
                alt={imageModel.name}
                width={"100%"}
                borderRadius={"lg"}
              />
              <Text fontSize={"sm"}>{imageModel.name}</Text>
            </Box>
          ))}
        </Grid>
      </Stack>
    </HStack>
  )
}
