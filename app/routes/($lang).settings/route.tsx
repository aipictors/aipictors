import { Outlet, useLocation } from "@remix-run/react"
import { useContext, useEffect, useState } from "react"
import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { hasViewerRequestSession } from "~/lib/viewer-request-headers"
import { SettingsLoginPrompt } from "~/routes/($lang).settings/components/settings-login-prompt"
import {
  SettingsSearchInput,
  SettingsSearchResults,
  useOpenFirstSettingsResult,
} from "~/routes/($lang).settings/components/settings-search"
import { SettingsNavigation } from "~/routes/($lang).settings._index/components/settings-navigation"
import {
  findSettingsPage,
  isSettingsIndexPath,
} from "~/routes/($lang).settings._index/utils/settings-pages"

export function HydrateFallback() {
  return <AppLoadingPage />
}

export default function SettingsLayout() {
  const authContext = useContext(AuthContext)
  const hasViewerSession = hasViewerRequestSession()
  const t = useTranslation()
  const location = useLocation()
  const page = findSettingsPage(location.pathname)
  const isIndex = isSettingsIndexPath(location.pathname)

  const [query, setQuery] = useState("")
  const openFirstResult = useOpenFirstSettingsResult()

  // ページを移ったら検索をやめる
  useEffect(() => {
    setQuery("")
  }, [location.pathname])

  const isSearching = query.trim() !== ""

  if (authContext.isLoading && !hasViewerSession) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn && !hasViewerSession) {
    return <AppCommonLayout outlet={<SettingsLoginPrompt />} />
  }

  const search = (
    <SettingsSearchInput
      query={query}
      onChange={setQuery}
      onSubmit={() => openFirstResult(query)}
    />
  )

  return (
    <AppCommonLayout
      isStickyEnabled
      outlet={
        <div className="md:flex md:gap-8 md:pt-2">
          {/* PC は左に検索とメニュー（以前は検索が本文の上にあり、サイトの検索と 2 本並んでいた） */}
          <aside className="hidden w-60 shrink-0 md:block">
            <div className="sticky top-20 flex max-h-[calc(100dvh-6rem)] flex-col gap-3">
              {search}
              <div className="min-h-0 overflow-y-auto pr-1 pb-4">
                <SettingsNavigation />
              </div>
            </div>
          </aside>
          <div className="mx-auto w-full min-w-0 max-w-3xl flex-1 pb-10">
            {/* スマホは各ページに戻るボタンの見出しがあるので、検索はトップだけに出す */}
            {isIndex && (
              <div className="mb-5 space-y-3 md:hidden">
                <h1 className="font-bold text-2xl tracking-tight">
                  {t("設定", "Settings")}
                </h1>
                {search}
              </div>
            )}
            {isSearching ? (
              <SettingsSearchResults
                query={query}
                onSelect={() => setQuery("")}
              />
            ) : (
              <>
                {page && (
                  <header className="mb-6 hidden border-b pb-5 md:block">
                    <h1 className="font-bold text-2xl tracking-tight">
                      {t(page.ja, page.en)}
                    </h1>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {t(page.descriptionJa, page.descriptionEn)}
                    </p>
                  </header>
                )}
                <Outlet />
              </>
            )}
          </div>
        </div>
      }
    />
  )
}
