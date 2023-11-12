"use client"

import { Box, Stack } from "@chakra-ui/react"
import { PassType } from "__generated__/apollo"
import { PassPlanDescription } from "app/[lang]/(beta)/plus/_components/pass-plan-description"
import { toPassFeatures } from "app/[lang]/(beta)/plus/_utils/to-pass-features"

type Props = {
  isLoading: boolean
  onSelect(passType: PassType): Promise<void>
}

export const PassPlanList: React.FC<Props> = (props) => {
  return (
    <Stack direction={{ base: "column", lg: "row" }} spacing={2}>
      <Box flex={1}>
        <PassPlanDescription
          title={"ライト"}
          price={480}
          features={toPassFeatures("LITE")}
          isLoading={props.isLoading}
          onClick={() => {
            return props.onSelect("LITE")
          }}
        />
      </Box>
      <Box flex={1}>
        <PassPlanDescription
          isPrimary
          title={"スタンダード"}
          price={1980}
          features={toPassFeatures("STANDARD")}
          isLoading={props.isLoading}
          onClick={() => {
            return props.onSelect("STANDARD")
          }}
        />
      </Box>
      <Box flex={1}>
        <PassPlanDescription
          title={"プレミアム"}
          price={3980}
          features={toPassFeatures("PREMIUM")}
          isLoading={props.isLoading}
          onClick={() => {
            return props.onSelect("PREMIUM")
          }}
        />
      </Box>
    </Stack>
  )
}
