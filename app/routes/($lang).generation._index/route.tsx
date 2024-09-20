import text from "~/assets/terms.md?raw"
import { json } from "@remix-run/react"
import { graphql } from "gql.tada"
import { GenerationAdvertisementView } from "~/routes/($lang).generation._index/components/advertisement-view/generation-advertisement-view"
import { GenerationConfigView } from "~/routes/($lang).generation._index/components/config-view/generation-config-view"
import { GenerationSideTabsView } from "~/routes/($lang).generation._index/components/generation-side-tabs-view/generation-side-tabs-view"
import { GenerationAsideView } from "~/routes/($lang).generation._index/components/generation-view/generation-aside-view"
import { GenerationHeaderView } from "~/routes/($lang).generation._index/components/generation-view/generation-header-view"
import { GenerationMainView } from "~/routes/($lang).generation._index/components/generation-view/generation-main-view"
import { GenerationView } from "~/routes/($lang).generation._index/components/generation-view/generation-view"
import { GenerationNegativePromptView } from "~/routes/($lang).generation._index/components/negative-prompt-view/generation-negative-prompt-view"
import { GenerationPromptView } from "~/routes/($lang).generation._index/components/prompt-view/generation-prompt-view"
import { GenerationSubmissionView } from "~/routes/($lang).generation._index/components/submission-view/generation-submit-view"
import { GenerationCommunicationView } from "~/routes/($lang).generation._index/components/task-view/generation-communication-view"
import { GenerationTaskContentPreview } from "~/routes/($lang).generation._index/components/task-view/generation-task-content-preview"
import { GenerationTaskDetailsView } from "~/routes/($lang).generation._index/components/task-view/generation-task-details-view"
import { GenerationTaskListView } from "~/routes/($lang).generation._index/components/task-view/generation-task-list-view"
import { GenerationWorkContentPreview } from "~/routes/($lang).generation._index/components/task-view/generation-work-content-preview"
import { GenerationWorkListModelView } from "~/routes/($lang).generation._index/components/task-view/generation-works-from-model-view"
import { useQuery } from "@apollo/client/index"
import { useEffect, useState } from "react"
import { getUserToken } from "~/utils/get-user-token"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { setUserToken } from "~/utils/set-user-token"
import { jwtDecode } from "jwt-decode"
import { GenerationLinksView } from "~/routes/($lang).generation._index/components/task-view/generation-links-view"
import { GenerationFormFooter } from "~/routes/($lang).generation._index/components/generation-form-footer"
import type { LoaderFunctionArgs } from "react-router-dom"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

/**
 * 画像生成
 */
export default function GenerationPage() {
  const [rating, setRating] = useState(-1)

  const [protect, setProtect] = useState(-1)

  const [isEditMode, toggleEditMode] = useState(false)

  const [isPreviewMode, togglePreviewMode] = useState(false)

  const { data: token } = useQuery(ViewerTokenQuery)

  const localStorageUserToken = getUserToken()

  const viewerUserToken = token?.viewer?.token

  const context = useGenerationContext()

  useEffect(() => {
    if (localStorageUserToken !== null) {
      const decoded = jwtDecode(localStorageUserToken)
      // 期限が切れてたら、新しいトークンをセット
      if (
        decoded.exp &&
        decoded.exp < new Date().getTime() / 1000 &&
        viewerUserToken
      ) {
        context.changeCurrentUserToken(viewerUserToken)
        setUserToken(viewerUserToken)
      } else {
        context.changeCurrentUserToken(localStorageUserToken)
      }
    } else if (viewerUserToken) {
      context.changeCurrentUserToken(viewerUserToken)
      setUserToken(viewerUserToken)
    }
  }, [localStorageUserToken, viewerUserToken, context.config.page])

  useEffect(() => {
    context.resetImageInputSetting()
  }, [])

  return (
    <GenerationView
      header={
        <GenerationHeaderView
          submission={<GenerationSubmissionView termsText={text} />}
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
          submissionView={
            <GenerationHeaderView
              submission={<GenerationSubmissionView termsText={text} />}
            />
          }
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
              currentUserToken={context.config.currentUserToken ?? ""}
            />
          }
          taskDetails={<GenerationTaskDetailsView />}
          workListFromModel={<GenerationWorkListModelView />}
          communication={<GenerationCommunicationView />}
          links={<GenerationLinksView />}
        />
      }
      menu={<GenerationConfigView />}
      footer={<GenerationFormFooter />}
    />
  )
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return json(
    { status: 200 },
    {
      headers: {
        // "Cache-Control": config.cacheControl.short,
      },
    },
  )
}

const ViewerTokenQuery = graphql(
  `query ViewerTokenQuery {
    viewer {
      id
      token
    }
  }`,
)
