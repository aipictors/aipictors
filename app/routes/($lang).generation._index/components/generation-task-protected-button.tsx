import { cn } from "~/lib/utils"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { LockKeyholeIcon, LockKeyholeOpenIcon } from "lucide-react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

export const GenerationResultProtectButtonFragment = graphql(
  `fragment GenerationResultProtectButton on ImageGenerationResultNode @_unmask {
    id
    isProtected
  }`,
)

export const GenerationResultProtectButtonTaskFragment = graphql(
  `fragment GenerationResultProtectButtonTask on ImageGenerationTaskNode @_unmask {
    id
    isProtected
  }`,
)
