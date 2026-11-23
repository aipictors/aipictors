import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { jwtDecode } from "jwt-decode"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import text from "~/assets/terms.md?raw"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { PrefetchPageLinks, useLocation } from "@remix-run/react"
import { toLocalePathname, useNavigate } from "~/lib/app/locale-router"
import { getPathLocale } from "~/utils/locale-path"
import { GenerationAdvertisementView } from "~/routes/($lang).generation._index/components/advertisement-view/generation-advertisement-view"
import { GenerationConfigView } from "~/routes/($lang).generation._index/components/config-view/generation-config-view"
import { GenerationStylesSection } from "~/routes/($lang).generation._index/components/config-view/generation-styles-section"
import { GenerationFormFooter } from "~/routes/($lang).generation._index/components/generation-form-footer"
import { GenerationCoinHistoryTab } from "~/routes/($lang).generation._index/components/generation-side-tabs-view/generation-coin-history-tab"
import { GenerationLogsTab } from "~/routes/($lang).generation._index/components/generation-side-tabs-view/generation-logs-tab"
import { GenerationSideTabsView } from "~/routes/($lang).generation._index/components/generation-side-tabs-view/generation-side-tabs-view"
import { GenerationUserModelFromUrl } from "~/routes/($lang).generation._index/components/generation-user-model-from-url"
import { GenerationAsideView } from "~/routes/($lang).generation._index/components/generation-view/generation-aside-view"
import { GenerationHeaderView } from "~/routes/($lang).generation._index/components/generation-view/generation-header-view"
import { GenerationMainView } from "~/routes/($lang).generation._index/components/generation-view/generation-main-view"
import { GenerationMobileView } from "~/routes/($lang).generation._index/components/generation-view/generation-mobile-view"
import { GenerationSettingsColumn } from "~/routes/($lang).generation._index/components/generation-view/generation-settings-column"
import { GenerationSettingsPanel } from "~/routes/($lang).generation._index/components/generation-view/generation-settings-panel"
import { GenerationThreeColumnView } from "~/routes/($lang).generation._index/components/generation-view/generation-three-column-view"
import { GenerationView } from "~/routes/($lang).generation._index/components/generation-view/generation-view"
import { GenerationNegativePromptView } from "~/routes/($lang).generation._index/components/negative-prompt-view/generation-negative-prompt-view"
import { GenerationMobilePromptCard } from "~/routes/($lang).generation._index/components/prompt-view/generation-mobile-prompt-card"
import { GenerationMobilePromptComposer } from "~/routes/($lang).generation._index/components/prompt-view/generation-mobile-prompt-composer"
import { GenerationPromptComposer } from "~/routes/($lang).generation._index/components/prompt-view/generation-prompt-composer"
import { GenerationPromptView } from "~/routes/($lang).generation._index/components/prompt-view/generation-prompt-view"
import { SettingLanguageUsedForPromptView } from "~/routes/($lang).generation._index/components/setting-language-used-for-prompt-view/setting-language-used-for-prompt-view"
import { GenerationEntrySkeleton } from "~/routes/($lang).generation._index/components/simple-entry/generation-simple-entry"
import { GenerationSubmissionView } from "~/routes/($lang).generation._index/components/submission-view/generation-submit-view"
import { GenerationCommunicationView } from "~/routes/($lang).generation._index/components/task-view/generation-communication-view"
import { GenerationLinksView } from "~/routes/($lang).generation._index/components/task-view/generation-links-view"
import { GenerationTaskDetailsView } from "~/routes/($lang).generation._index/components/task-view/generation-task-details-view"
import { GenerationTaskListView } from "~/routes/($lang).generation._index/components/task-view/generation-task-list-view"
import { GenerationWorkListModelView } from "~/routes/($lang).generation._index/components/task-view/generation-works-from-model-view"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationEntryMode } from "~/routes/($lang).generation._index/hooks/use-generation-entry-mode"
import { getUserToken } from "~/utils/get-user-token"
import { setUserToken } from "~/utils/set-user-token"

type Props = {
  /**
   * PC の画面構成
   * - classic: 左にプロンプト・設定、右に結果（/generation）
   * - threeColumn: 左メニュー / 中央 結果・入力 / 右 設定（/generation/3panel で試してもらう）
   */
  layout: "classic" | "threeColumn"
  /**
   * はじめての人（未ログイン・生成履歴 0 件）を /generation/home に案内するか
   */
  withEntry: boolean
}

/**
 * 画像生成の画面（/generation と /generation/3panel で使う）
 */
export function GenerationPage(props: Props) {
  const authContext = useContext(AuthContext)
  const [rating, setRating] = useState(-1)

  const [protect, setProtect] = useState(-1)

  const generationSubmitRef = useRef<(() => Promise<unknown>) | null>(null)
  const [submitButtonTarget, setSubmitButtonTarget] =
    useState<HTMLDivElement | null>(null)
  const pendingRerollRef = useRef(false)
  const registerGenerationSubmit = useCallback(
    (submit: (() => Promise<unknown>) | null) => {
      generationSubmitRef.current = submit
      if (submit && pendingRerollRef.current) {
        pendingRerollRef.current = false
        void submit()
      }
    },
    [],
  )
  const rerollGeneration = useCallback(() => {
    const submit = generationSubmitRef.current
    if (submit) {
      void submit()
    } else {
      pendingRerollRef.current = true
    }
  }, [])

  const [isEditMode, toggleEditMode] = useState(false)

  const { data: token } = useQuery(ViewerTokenQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "cache-and-network",
  })

  const localStorageUserToken = getUserToken()

  const viewerUserToken = token?.viewer?.token

  const context = useGenerationContext()

  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

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

  // はじめての人（未ログイン・生成履歴 0 件）は、プロンプトと作例だけの /generation/home へ
  const entry = useGenerationEntryMode({ enabled: props.withEntry })

  const aside = (
    <GenerationAsideView
      advertisement={<GenerationAdvertisementView />}
      taskList={
        <GenerationTaskListView
          rating={rating}
          protect={protect}
          isEditMode={isEditMode}
          setRating={setRating}
          setProtect={setProtect}
          toggleEditMode={toggleEditMode}
          currentUserToken={context.config.currentUserToken ?? ""}
        />
      }
      taskDetails={<GenerationTaskDetailsView />}
      workListFromModel={<GenerationWorkListModelView />}
      communication={<GenerationCommunicationView />}
      links={<GenerationLinksView />}
      logs={<GenerationLogsTab />}
      coinHistory={<GenerationCoinHistoryTab />}
    />
  )

  return (
    <>
      {/* PC とスマホで構成が違い、保存した状態（localStorage）でも中身が変わるので、サーバーとの一致が取れない。
          ブラウザに来てから 1 回だけ描く（以前はスマホ用の HTML を出してから React が全部描き直していた） */}
      {!isHydrated ? (
        <AppLoadingPage />
      ) : entry.mode === "loading" ? (
        <>
          <GenerationEntrySkeleton />
          {/* はじめての人かどうか調べている間に、移る先（/generation/home）の JS と作例を先に読んでおく */}
          {props.withEntry ? <GenerationHomePrefetch /> : null}
        </>
      ) : entry.mode === "simple" ? (
        <GenerationHomeRedirect />
      ) : (
        <>
          <GenerationUserModelFromUrl />
          <GenerationView
            threeColumn={
              props.layout === "threeColumn" ? (
                <GenerationThreeColumnView
                  onReroll={rerollGeneration}
                  promptEditor={
                    <GenerationPromptComposer
                      showGenerateButton={false}
                      onSubmitButtonTargetChange={setSubmitButtonTarget}
                    />
                  }
                  negativePromptEditor={<GenerationNegativePromptView />}
                  history={aside}
                  taskDetails={
                    <GenerationTaskDetailsView onReroll={rerollGeneration} />
                  }
                  submission={
                    <GenerationSubmissionView
                      termsText={text}
                      centerSubmitButton
                      isComposerSubmit
                      submitButtonTarget={submitButtonTarget}
                      onReadyToSubmit={registerGenerationSubmit}
                    />
                  }
                  panel={
                    <GenerationSettingsPanel
                      model={<GenerationConfigView part="model" />}
                      styles={<GenerationStylesSection />}
                      settings={<GenerationConfigView part="settings" />}
                    />
                  }
                />
              ) : undefined
            }
            settings={
              <GenerationSettingsColumn
                promptEditor={<GenerationPromptComposer />}
                negativePromptEditor={<GenerationNegativePromptView />}
                config={<GenerationConfigView isStacked />}
                submission={<GenerationSubmissionView termsText={text} />}
              />
            }
            header={
              <GenerationHeaderView
                submission={
                  <GenerationSubmissionView
                    termsText={text}
                    composer={<GenerationMobilePromptComposer />}
                  />
                }
              />
            }
            main={
              <GenerationMainView
                config={<GenerationConfigView isStacked />}
                settingLanguageUsedForPromptView={
                  <SettingLanguageUsedForPromptView />
                }
                promptEditor={<GenerationPromptView />}
                negativePromptEditor={<GenerationNegativePromptView />}
                mobilePromptEditor={<GenerationMobilePromptCard />}
                taskDetails={<GenerationTaskDetailsView />}
                submissionView={
                  <GenerationHeaderView
                    submission={<GenerationSubmissionView termsText={text} />}
                  />
                }
              />
            }
            asideHeader={<GenerationSideTabsView />}
            aside={aside}
            mobile={
              <GenerationMobileView
                form={
                  <GenerationConfigView
                    isMobileCards
                    promptCard={<GenerationMobilePromptCard />}
                  />
                }
                history={aside}
                submission={
                  <GenerationSubmissionView
                    termsText={text}
                    composer={<GenerationMobilePromptComposer />}
                  />
                }
                footer={<GenerationFormFooter />}
                coinHistory={<GenerationCoinHistoryTab />}
              />
            }
            menu={<GenerationConfigView />}
            footer={<GenerationFormFooter />}
          />
        </>
      )}
    </>
  )
}

function GenerationHomePrefetch() {
  const { pathname } = useLocation()
  return (
    <PrefetchPageLinks
      page={toLocalePathname(getPathLocale(pathname), "/generation/home")}
    />
  )
}

/**
 * はじめての人を /generation/home に移す（URL のパラメータは詳細画面で使うので、ここに来るときは無い）
 */
function GenerationHomeRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate("/generation/home", { replace: true })
  }, [])

  return <GenerationEntrySkeleton />
}

const ViewerTokenQuery = graphql(
  `query ViewerTokenQuery {
    viewer {
      id
      token
    }
  }`,
)
