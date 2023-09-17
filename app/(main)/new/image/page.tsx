import { Box, Text, Stack, Textarea, Button, Input } from "@chakra-ui/react"
import { Metadata } from "next"

const NewImagePage = () => {
  return (
    <Box h="100%" w="100%">
      <Stack alignItems={"center"} bg="blackAlpha.700">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          padding={4}
          margin={4}
          background="blue.500"
          color="white"
          borderRadius="md"
          cursor="pointer"
        >
          <p>画像／動画を追加</p>
        </Box>
        <Stack margin={4} color="white">
          <Text fontSize="sm">JPEG、PNG、GIF、WEBP、BMP、MP4</Text>
          <Text fontSize="sm">
            1枚32MB以内、最大200枚、動画は32MB、12秒まで
          </Text>
        </Stack>
      </Stack>

      <Stack direction="column">
        <Text fontSize="sm">タイトル</Text>
        <Input
          id="title_input"
          minLength={1}
          maxLength={120}
          required
          type="text"
          name="title"
          placeholder="タイトル"
        />
      </Stack>

      <Stack direction="column">
        <Text fontSize="sm">キャプション</Text>
        <Textarea
          id="caption_input"
          maxLength={3000}
          name="explanation"
          placeholder="キャプション"
        />
      </Stack>

      {/* Submit button */}
      <Button margin={4} w="120px" mx={"auto"} type="submit" colorScheme="blue">
        投稿
      </Button>
    </Box>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

const dropzoneStyle = {
  backgroundColor: "white",
  color: "gray.600",
}

export default NewImagePage
