import { useState } from "react"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { X, Info } from "lucide-react"

const emergencyAnnouncementsQuery = graphql(`
  query emergencyAnnouncements {
    emergencyAnnouncements {
      url
      content
    }
  }
`)

/**
 * 生成画面用緊急お知らせバナー
 */
export function GenerationAnnouncementBanner() {
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true)

  const { data: announcementData, loading, error } = useQuery(emergencyAnnouncementsQuery, {})

  // デバッグ用ログ
  console.log("GenerationAnnouncementBanner Debug:", {
    loading,
    error,
    announcementData,
    isAnnouncementVisible
  })

  const navigateToExternal = (url: string) => {
    window.open(url, "_blank", "noreferrer")
  }

  const handleNavigate = (url: string) => {
    window.location.href = url
  }

  // 表示条件をチェック
  if (!isAnnouncementVisible) {
    return null
  }

  // 実際のお知らせデータがない場合は表示しない（空文字列もチェック）
  if (!announcementData?.emergencyAnnouncements || 
      !announcementData.emergencyAnnouncements.content ||
      announcementData.emergencyAnnouncements.content.trim() === "") {
    return null
  }

  return (
    <div className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="relative w-full px-4 py-3">
        <div className="flex items-center gap-3 pr-10">
          {/* Close button */}
          <button
            onClick={() => setIsAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="お知らせを閉じる"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Icon */}
          <div className="flex-shrink-0 rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          
          {/* Content */}
          {announcementData.emergencyAnnouncements.url && announcementData.emergencyAnnouncements.url.length > 0 ? (
            <button
              onClick={() =>
                announcementData.emergencyAnnouncements.url.startsWith("http")
                  ? navigateToExternal(announcementData.emergencyAnnouncements.url)
                  : handleNavigate(announcementData.emergencyAnnouncements.url)
              }
              className="flex-1 text-left transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {announcementData.emergencyAnnouncements.content}
                </span>
                <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ) : (
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {announcementData.emergencyAnnouncements.content}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}