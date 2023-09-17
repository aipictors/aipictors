"use client"
import {
  Avatar,
  Box,
  Divider,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react"
import type { FC } from "react"
import { TbTrash } from "react-icons/tb"

export const MainSettingMuteUsers: FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"ミュートしているユーザ"}
        </Text>
        <Stack>
          <Box>
            <Text>{"ミュートしているユーザはいません"}</Text>
          </Box>
        </Stack>
        <Stack divider={<Divider />}>
          <HStack justifyContent={"space-between"}>
            <HStack>
              <Avatar bg="teal.500" size={"sm"} />
              <Box>
                <Text>{"プロンプトン"}</Text>
              </Box>
            </HStack>
            <IconButton
              aria-label="DeleteMuteUsers"
              icon={<Icon as={TbTrash} />}
              variant={"ghost"}
              borderRadius={"full"}
            />
          </HStack>
          <HStack justifyContent={"space-between"}>
            <HStack>
              <Avatar bg="teal.500" size={"sm"} />
              <Box>
                <Text>{"プロンプトン"}</Text>
              </Box>
            </HStack>
            <IconButton
              aria-label="Search database"
              icon={<Icon as={TbTrash} />}
              variant={"ghost"}
              borderRadius={"full"}
            />
          </HStack>
          <HStack justifyContent={"space-between"}>
            <HStack>
              <Avatar bg="teal.500" size={"sm"} />
              <Box>
                <Text>{"プロンプトン"}</Text>
              </Box>
            </HStack>
            <IconButton
              aria-label="Search database"
              icon={<Icon as={TbTrash} />}
              variant={"ghost"}
              borderRadius={"full"}
            />
          </HStack>
        </Stack>
      </Stack>
    </HStack>
  )
}
