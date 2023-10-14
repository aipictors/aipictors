"use client"
import { Box, Grid, HStack, Image, Stack, Text } from "@chakra-ui/react"
import type { ImageModelsQuery } from "__generated__/apollo"
import Link from "next/link"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
}

export const ImageModelList: React.FC<Props> = (props) => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"モデル"}
        </Text>
        <Grid templateColumns="repeat(4, 1fr)" gap={6}>
          {props.imageModels.map((imageModel) => (
            <Box key={imageModel.id} overflow={"hidden"}>
              <Link href={`/models/${imageModel.id}`}>
                <Image
                  src={imageModel.thumbnailImageURL ?? ""}
                  alt={imageModel.displayName}
                  width={"100%"}
                  borderRadius={"lg"}
                />
              </Link>
              <Text fontSize={"sm"}>{imageModel.displayName}</Text>
            </Box>
          ))}
        </Grid>
      </Stack>
    </HStack>
  )
}
