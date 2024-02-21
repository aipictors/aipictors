import { GenerationEditorSubmissionViewContent } from "@/app/[lang]/generation/_components/editor-submission-view/generation-editor-submit-view-content"
import { ImageGenerationContextView } from "@/app/[lang]/generation/_machines/models/image-generation-context-view"
import { AppFixedContent } from "@/components/app/app-fixed-content"
import { config } from "@/config"
import { ImageModelsQuery } from "@/graphql/__generated__/graphql"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  /**
   * ユーザID
   */
  userNanoid: string | null
  termsMarkdownText: string
  /**
   * 規約に同意済みである
   */
  hasSignedTerms: boolean
  /**
   * 画像生成が無効である
   */
  isDisabled: boolean
  /**
   * サブスクの種類
   */
  passType: string | null

  modelId: string

  /**
   * TODO: Providerに変更
   */
  context: ImageGenerationContextView
}

export function GenerationEditorSubmissionView(props: Props) {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      {isDesktop ? (
        <GenerationEditorSubmissionViewContent
          imageModels={props.imageModels}
          userNanoid={props.userNanoid}
          termsMarkdownText={props.termsMarkdownText}
          hasSignedTerms={props.hasSignedTerms}
          isDisabled={props.isDisabled}
          passType={props.passType}
          modelId={props.modelId}
          context={props.context}
        />
      ) : (
        <AppFixedContent
          position="bottom"
          children={
            <GenerationEditorSubmissionViewContent
              imageModels={props.imageModels}
              userNanoid={props.userNanoid}
              termsMarkdownText={props.termsMarkdownText}
              hasSignedTerms={props.hasSignedTerms}
              isDisabled={props.isDisabled}
              passType={props.passType}
              modelId={props.modelId}
              context={props.context}
            />
          }
        />
      )}
    </>
  )
}
