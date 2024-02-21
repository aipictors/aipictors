"use client"

import { GenerationEditorSubmissionViewContent } from "@/app/[lang]/generation/_components/editor-submission-view/generation-editor-submit-view-content"
import { AppFixedContent } from "@/components/app/app-fixed-content"
import { config } from "@/config"
import { ImageModelsQuery } from "@/graphql/__generated__/graphql"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  termsMarkdownText: string
}

export function GenerationEditorSubmissionView(props: Props) {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  if (isDesktop) {
    return (
      <GenerationEditorSubmissionViewContent
        imageModels={props.imageModels}
        termsMarkdownText={props.termsMarkdownText}
      />
    )
  }

  return (
    <AppFixedContent
      position="bottom"
      children={
        <GenerationEditorSubmissionViewContent
          imageModels={props.imageModels}
          termsMarkdownText={props.termsMarkdownText}
        />
      }
    />
  )
}
