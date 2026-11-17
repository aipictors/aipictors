import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon, LockKeyholeIcon, LockKeyholeOpenIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "~/lib/utils"

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
