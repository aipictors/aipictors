import {
  Box,
  Card,
  Heading,
  Image,
  Link,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
} from "@chakra-ui/react"
import React, { type FC, type ReactNode } from "react"
import ReactMarkdown from "react-markdown"

type Props = {
  children: ReactNode
}

export const BoxMarkdown: FC<Props> = (props) => {
  if (typeof props.children !== "string") {
    return <>{props.children}</>
  }

  const fontSize = 16

  return (
    <Box>
      <ReactMarkdown
        linkTarget={"_blank"}
        components={{
          li(props) {
            return (
              <ListItem
                fontSize={fontSize}
                lineHeight={1.75}
                ml={{ base: 4, md: 6 }}
                mt={0.5}
              >
                {props.children}
              </ListItem>
            )
          },
          ul(props) {
            return (
              <UnorderedList
                ml={0}
                mt={2}
                marginInlineStart={"auto"}
                fontSize={fontSize}
              >
                {props.children}
              </UnorderedList>
            )
          },
          ol(props) {
            return (
              <OrderedList
                ml={0}
                mt={2}
                marginInlineStart={"auto"}
                fontSize={fontSize}
              >
                {props.children}
              </OrderedList>
            )
          },
          h1(props) {
            return (
              <Heading
                as={"h1"}
                fontWeight={"bold"}
                fontSize={{ base: "2xl", md: "3xl" }}
                mt={props.node.position?.start.line === 1 ? 0 : 8}
                mb={4}
              >
                {props.children}
              </Heading>
            )
          },
          h2(props) {
            return (
              <Heading
                as={"h2"}
                fontWeight={"bold"}
                fontSize={{ base: "xl", md: "2xl" }}
                mt={props.node.position?.start.line === 1 ? 0 : 6}
                mb={2}
              >
                {props.children}
              </Heading>
            )
          },
          h3(props) {
            return (
              <Text
                as={"p"}
                whiteSpace={"pre-wrap"}
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight={"bold"}
                mt={props.node.position?.start.line === 1 ? 0 : 6}
                mb={1}
              >
                {props.children}
              </Text>
            )
          },
          p(props) {
            if (props.children.some((a) => typeof a === "string")) {
              const children = props.children.map((item) => {
                if (typeof item === "string") {
                  return item.replace(/\n/g, "")
                }
                return item
              })
              return (
                <Text
                  mt={props.node.position?.start.line === 1 ? 0 : 2}
                  lineHeight={2}
                  whiteSpace={"pre-wrap"}
                  fontSize={fontSize}
                >
                  {children}
                </Text>
              )
            }
            return <>{props.children}</>
          },
          a(props) {
            return (
              <Link
                color={"blue.500"}
                href={props.href ?? ""}
                rel={"noreferrer"}
                target={"_blank"}
                fontWeight={"bold"}
                wordBreak={"break-all"}
                fontSize={fontSize}
              >
                {props.children}
              </Link>
            )
          },
          img(props) {
            return (
              <Image
                alt={props.alt}
                mx={"auto"}
                w={"100%"}
                rounded={"lg"}
                ml={0}
                my={4}
                {...props}
              />
            )
          },
          strong(props) {
            return <Box as={"strong"} color={"pink.500"} {...props} />
          },
          blockquote(props) {
            return (
              <Box as={"blockquote"} mt={4}>
                <Box borderLeftWidth={8} pl={4} pb={4}>
                  {props.children}
                </Box>
              </Box>
            )
          },
          pre(props) {
            return (
              <Card
                as={"pre"}
                my={4}
                variant={"filled"}
                p={4}
                overflow={"auto"}
              >
                {props.children}
              </Card>
            )
          },
        }}
      >
        {props.children}
      </ReactMarkdown>
    </Box>
  )
}
