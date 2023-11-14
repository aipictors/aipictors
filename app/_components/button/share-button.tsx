"use client"

import { IconButton } from "@chakra-ui/react"
import { Share } from "lucide-react"

export const ShareButton = () => {
  return <IconButton aria-label="share" icon={<Share />} size={"sm"} />
}
