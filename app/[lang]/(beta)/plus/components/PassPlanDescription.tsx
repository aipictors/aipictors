"use client"
import {
  Box,
  Button,
  Card,
  Divider,
  Stack,
  Text,
  UnorderedList,
} from "@chakra-ui/react"
import { PassType } from "__generated__/apollo"
import { toMoneyNumberText } from "app/utils/toMoneyNumberText"

type Props = {
  title: string
  price: number
  features: string[]
  isPrimary?: boolean
  isDisabled?: boolean
  isLoading: boolean
  onClick(): Promise<void>
}

export const PassPlanDescription: React.FC<Props> = (props) => {
  return (
    <Card
      variant={"filled"}
      h={"100%"}
      borderRadius={"xl"}
      borderWidth={4}
      borderColor={props.isPrimary ? "blue.500" : "gray.500"}
    >
      <Stack h={"100%"} justifyContent={"space-between"} spacing={4}>
        <Stack spacing={4}>
          <Stack pt={4} px={4} spacing={0}>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {props.title}
            </Text>
            <Text fontSize={"2xl"} fontWeight={"bold"}>
              {`${toMoneyNumberText(props.price)}円（税込）`}
            </Text>
          </Stack>
          <Box px={4}>
            <Button
              w={"100%"}
              isDisabled={props.isDisabled ?? props.isLoading}
              colorScheme={"blue"}
              onClick={props.onClick}
            >
              {props.isDisabled ? "準備中" : "決済する"}
            </Button>
          </Box>
          <Stack px={4} spacing={1}>
            <Text>{"広告の非表示"}</Text>
            <Text>{"認証マークの表示"}</Text>
          </Stack>
        </Stack>
        <Box p={4} bg={"rgba(0,0,0,0.04)"} borderRadius={"lg"} h={"100%"}>
          <Stack spacing={1}>
            <Text fontSize={"sm"} fontWeight={"bold"} opacity={0.6}>
              {"画像生成"}
            </Text>
            {props.features.map((feature) => (
              <Text key={feature}>{feature}</Text>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Card>
  )
}
