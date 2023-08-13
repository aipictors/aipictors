"use client"
import { Box } from "@chakra-ui/react"
import { FC, useContext } from "react"
import { AppContext } from "contexts/appContext"

type Props = {}

export const MainLogin: FC<Props> = (props) => {
  const context = useContext(AppContext)

  console.log(context)

  return <Box />
}
