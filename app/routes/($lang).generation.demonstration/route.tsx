import text from "~/assets/terms.md?raw"
import { graphql } from "gql.tada"
import { GenerationAsideView } from "~/routes/($lang).generation._index/components/generation-view/generation-aside-view"
import { GenerationHeaderView } from "~/routes/($lang).generation._index/components/generation-view/generation-header-view"
import { GenerationMainView } from "~/routes/($lang).generation._index/components/generation-view/generation-main-view"
import { GenerationCommunicationView } from "~/routes/($lang).generation._index/components/task-view/generation-communication-view"
import { GenerationTaskContentPreview } from "~/routes/($lang).generation._index/components/task-view/generation-task-content-preview"
import { GenerationTaskDetailsView } from "~/routes/($lang).generation._index/components/task-view/generation-task-details-view"
import { GenerationWorkContentPreview } from "~/routes/($lang).generation._index/components/task-view/generation-work-content-preview"
import { GenerationWorkListModelView } from "~/routes/($lang).generation._index/components/task-view/generation-works-from-model-view"
import { useQuery } from "@apollo/client/index"
import { useEffect, useState } from "react"
import { getUserToken } from "~/utils/get-user-token"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { setUserToken } from "~/utils/set-user-token"
import { jwtDecode } from "jwt-decode"
import { GenerationLinksView } from "~/routes/($lang).generation._index/components/task-view/generation-links-view"
import { META } from "~/config"
import type { MetaFunction } from "@remix-run/cloudflare"
import { GenerationDemoConfigView } from "~/routes/($lang).generation.demonstration/components/config-view/generation-demo-config-view"
import { GenerationDemoPromptView } from "~/routes/($lang).generation.demonstration/components/prompt-view/generation-demo-prompt-view"
import { GenerationDemoNegativePromptView } from "~/routes/($lang).generation.demonstration/components/negative-prompt-view/generation-demo-negative-prompt-view"
import { GenerationDemoSideTabsView } from "~/routes/($lang).generation.demonstration/components/generation-side-tabs-view/generation-demo-side-tabs-view"
import { GenerationDemoTaskListView } from "~/routes/($lang).generation.demonstration/components/task-view/generation-demo-task-list-view"
import { createMeta } from "~/utils/create-meta"
import { GenerationDemoSubmissionView } from "~/routes/($lang).generation.demonstration/components/submission-view/generation-demo-submit-view"
import { GenerationDemoView } from "~/routes/($lang).generation.demonstration/components/generation-view/generation-demo-view"

/**
 * 画像生成
 */
export default function GenerationDemonstrationPage() {
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
      if (decoded.exp && decoded.exp < Date.now() / 1000 && viewerUserToken) {
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
    <>
      <div className="fixed top-0 left-0 z-50 h-16 w-full bg-white" />
      <GenerationDemoView
        header={
          <GenerationHeaderView
            submission={<GenerationDemoSubmissionView termsText={text} />}
          />
        }
        main={
          <GenerationMainView
            config={<GenerationDemoConfigView />}
            settingLanguageUsedForPromptView={null}
            promptEditor={<GenerationDemoPromptView />}
            negativePromptEditor={<GenerationDemoNegativePromptView />}
            taskContentPreview={<GenerationTaskContentPreview />}
            taskDetails={<GenerationTaskDetailsView />}
            workContentPreview={<GenerationWorkContentPreview />}
            submissionView={
              <GenerationHeaderView
                submission={<GenerationDemoSubmissionView termsText={text} />}
              />
            }
          />
        }
        asideHeader={<GenerationDemoSideTabsView />}
        aside={
          <GenerationAsideView
            advertisement={null}
            taskList={
              <GenerationDemoTaskListView
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
        menu={<GenerationDemoConfigView />}
        footer={<div className="h-4" />}
      />
    </>
  )
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.GENERATION_DEMO, undefined, props.params.lang)
}

const ViewerTokenQuery = graphql(
  `query ViewerTokenQuery {
    viewer {
      id
      token
    }
  }`,
)
