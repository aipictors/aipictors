import {
  Card,
  HStack,
  Stack,
  Heading,
  Image,
  IconButton,
  Icon,
  Button,
  Box,
} from "@chakra-ui/react"
import { FC } from "react"
import { TbBrandTwitterFilled, TbClick, TbExternalLink } from "react-icons/tb"
import { TagEventUser } from "app/components/TagEventUser"
import { EventUser } from "app/events/types/eventUser"

type Props = {
  user: EventUser
}

export const CardEventCreator: FC<Props> = (props) => {
  return (
    <Card overflow={"hidden"}>
      <HStack>
        <Box minW={40} w={40} h={40}>
          <a
            aria-label={"Twitter"}
            target={"_blank"}
            rel={"noopener"}
            href={
              props.user.twitterId === null
                ? undefined
                : props.user.aipictorsId === null
                ? `https://twitter.com/${props.user.twitterId}`
                : `https://www.aipictors.com/user/?id=${props.user.aipictorsId}`
            }
          >
            <Image
              alt={props.user.name}
              src={props.user.iconImageURL}
              h={"100%"}
              borderRadius={"md"}
              boxShadow={"xl"}
              w={"100%"}
            />
          </a>
        </Box>
        <Stack
          px={{ base: 2, sm: 4 }}
          spacing={{ base: 2, sm: 4 }}
          h={"100%"}
          py={4}
        >
          <Stack flex={1} spacing={{ base: 2, sm: 4 }}>
            <HStack>
              {props.user.types.map((type) => (
                <TagEventUser key={type} type={type} />
              ))}
            </HStack>
            <Heading as={"h2"} fontSize={{ base: 20, md: 24 }}>
              {props.user.name}
            </Heading>
          </Stack>
          <HStack>
            <IconButton
              aria-label={"Twitter"}
              as={"a"}
              borderRadius={"full"}
              icon={<Icon as={TbBrandTwitterFilled} />}
              target={"_blank"}
              rel={"noopener"}
              href={`https://twitter.com/${props.user.twitterId}`}
            />
            {props.user.siteURL !== null && props.user.siteTitle !== null && (
              <Button
                as={"a"}
                borderRadius={"full"}
                leftIcon={<Icon as={TbClick} />}
                target={"_blank"}
                rel={"noopener"}
                href={props.user.siteURL}
              >
                {props.user.siteTitle}
              </Button>
            )}
            {props.user.siteURL !== null && props.user.siteTitle === null && (
              <IconButton
                aria-label={"Webサイト"}
                as={"a"}
                borderRadius={"full"}
                icon={<Icon as={TbExternalLink} />}
                target={"_blank"}
                rel={"noopener"}
                href={props.user.siteURL}
              />
            )}
          </HStack>
        </Stack>
      </HStack>
    </Card>
  )
}
