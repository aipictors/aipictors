import { loginWithWordPressTokenMutation } from "@/_graphql/mutations/login-with-wordpress-token"
import { GenerationAdvertisementView } from "@/routes/($lang).generation._index/_components/advertisement-view/generation-advertisement-view"
import { GenerationConfigView } from "@/routes/($lang).generation._index/_components/config-view/generation-config-view"
import { GenerationSideTabsView } from "@/routes/($lang).generation._index/_components/generation-side-tabs-view/generation-side-tabs-view"
import { GenerationAsideView } from "@/routes/($lang).generation._index/_components/generation-view/generation-aside-view"
import { GenerationHeaderView } from "@/routes/($lang).generation._index/_components/generation-view/generation-header-view"
import { GenerationMainView } from "@/routes/($lang).generation._index/_components/generation-view/generation-main-view"
import { GenerationView } from "@/routes/($lang).generation._index/_components/generation-view/generation-view"
import { GenerationNegativePromptView } from "@/routes/($lang).generation._index/_components/negative-prompt-view/generation-negative-prompt-view"
import { GenerationPromptView } from "@/routes/($lang).generation._index/_components/prompt-view/generation-prompt-view"
import { GenerationSubmissionView } from "@/routes/($lang).generation._index/_components/submission-view/generation-submit-view"
import { GenerationCommunicationView } from "@/routes/($lang).generation._index/_components/task-view/generation-communication-view"
import { GenerationTaskContentPreview } from "@/routes/($lang).generation._index/_components/task-view/generation-task-content-preview"
import { GenerationTaskDetailsView } from "@/routes/($lang).generation._index/_components/task-view/generation-task-details-view"
import { GenerationTaskListView } from "@/routes/($lang).generation._index/_components/task-view/generation-task-list-view"
import { GenerationWorkContentPreview } from "@/routes/($lang).generation._index/_components/task-view/generation-work-content-preview"
import { GenerationWorkListModelView } from "@/routes/($lang).generation._index/_components/task-view/generation-works-from-model-view"
import { useMutation, useQuery } from "@apollo/client/index.js"
import { useEffect, useState } from "react"
import { viewerTokenQuery } from "@/_graphql/queries/viewer/viewer-token"
import { getUserToken } from "@/_utils/get-user-token"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"

type Props = {
  termsMarkdownText: string
}

/**
 * 画像生成
 * @returns
 */
export const GenerationForm = (props: Props) => {
  const [rating, setRating] = useState(-1)

  const [protect, setProtect] = useState(-1)

  const [isEditMode, toggleEditMode] = useState(false)

  const [isPreviewMode, togglePreviewMode] = useState(false)

  const [mutation, { loading: isLoading }] = useMutation(
    loginWithWordPressTokenMutation,
  )

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery)

  const cookieUserToken = getUserToken()

  const currentUserToken = token?.viewer?.token

  const context = useGenerationContext()

  const newCurrentUserToken = getUserToken() ?? token?.viewer?.token ?? ""

  // 23時間単位でユーザのtokenをRefetchする
  useEffect(() => {
    const intervalId = setInterval(
      () => {
        tokenRefetch()
      },
      23 * 60 * 60 * 1000,
    )

    return () => clearInterval(intervalId)
  }, [])
  useEffect(() => {
    if (/* cookieUserToken === null && */ currentUserToken) {
      // setUserToken(currentUserToken)
      context.changeCurrentUserToken(currentUserToken)
    }
  }, [currentUserToken])

  return (
    <GenerationView
      header={
        <GenerationHeaderView
          submission={
            <GenerationSubmissionView termsText={props.termsMarkdownText} />
          }
        />
      }
      main={
        <GenerationMainView
          config={<GenerationConfigView />}
          promptEditor={<GenerationPromptView />}
          negativePromptEditor={<GenerationNegativePromptView />}
          taskContentPreview={<GenerationTaskContentPreview />}
          taskDetails={<GenerationTaskDetailsView />}
          workContentPreview={<GenerationWorkContentPreview />}
        />
      }
      asideHeader={<GenerationSideTabsView />}
      aside={
        <GenerationAsideView
          advertisement={<GenerationAdvertisementView />}
          taskList={
            <GenerationTaskListView
              rating={rating}
              protect={protect}
              isEditMode={isEditMode}
              isPreviewMode={isPreviewMode}
              setRating={setRating}
              setProtect={setProtect}
              toggleEditMode={toggleEditMode}
              togglePreviewMode={togglePreviewMode}
              currentUserToken={newCurrentUserToken}
            />
          }
          taskDetails={<GenerationTaskDetailsView />}
          workListFromModel={<GenerationWorkListModelView />}
          communication={<GenerationCommunicationView />}
        />
      }
    />
  )
}
