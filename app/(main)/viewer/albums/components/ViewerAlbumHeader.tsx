"use client"
import { Button, Skeleton, Stack, Text } from "@chakra-ui/react"

export const ViewerAlbumHeader: React.FC = () => {
  return (
    <Stack>
      <Text>{"投稿作品をシリーズにまとめてシェアしてみよう！"}</Text>
      <Button>
        <Skeleton />
      </Button>
    </Stack>
  )
}
