"use client"
import { ListItem, UnorderedList } from "@chakra-ui/react"
import { PassType } from "__generated__/apollo"
import { toPassFeatures } from "app/[lang]/(beta)/plus/_utils/toPassFeatures"

type Props = {
  passType: PassType
}

export const PassImageGenerationBenefitList: React.FC<Props> = (props) => {
  const features = toPassFeatures(props.passType)

  return (
    <UnorderedList spacing={2} marginInlineStart={"1.5rem"}>
      {features.map((feature) => (
        <ListItem key={feature}>{feature}</ListItem>
      ))}
    </UnorderedList>
  )
}
