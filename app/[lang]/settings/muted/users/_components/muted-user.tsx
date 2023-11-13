"use client"

type Props = {
  name: string
  iconImageURL: string | null
  onClick(): void
}

export const MutedUser = (props: Props) => {
  return (
    <HStack justifyContent={"space-between"}>
      <HStack>
        <Avatar
          bg="teal.500"
          size={"sm"}
          src={props.iconImageURL ?? undefined}
        />
        <Box>
          <Text>{props.name}</Text>
        </Box>
      </HStack>
      <Button borderRadius={"full"} onClick={props.onClick}>
        {"解除"}
      </Button>
    </HStack>
  )
}
