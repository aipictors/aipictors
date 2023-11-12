"use client"

import { ListItem, UnorderedList } from "@chakra-ui/react"
import { PassType } from "__generated__/apollo"

type Props = {
  passType: PassType
}

export const PassBenefitList: React.FC<Props> = (props) => {
  return (
    <UnorderedList spacing={2} marginInlineStart={"1.5rem"}>
      <ListItem>{"広告の非表示"}</ListItem>
      <ListItem>{"認証マークの表示"}</ListItem>
    </UnorderedList>
  )
}
