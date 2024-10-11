import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { AuthContext } from "~/contexts/auth-context"
import { useContext, useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import React from "react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { useTranslation } from "~/hooks/use-translation"

type Props = Readonly<{
  outlet: React.ReactNode
}>

/**
 * ダッシュボードコンテンツ
 */
export function MyContents(props: Props) {
  const authContext = useContext(AuthContext)

  const location = useLocation()

  const t = useTranslation()

  const type = (path: string) => {
    if (path.includes("posts")) {
      return "POSTS"
    }
    if (path.includes("albums")) {
      return "ALBUMS"
    }
    if (path.includes("folders")) {
      return "FOLDERS"
    }
    if (path.includes("bookmarks")) {
      return "BOOKMARKS"
    }
    if (path.includes("recommended")) {
      return "RECOMMENDED"
    }
    if (path.includes("likes")) {
      return "LIKES"
    }
    if (path.includes("views")) {
      return "VIEWS"
    }
    if (path.includes("reports")) {
      return "REPORTS"
    }
    return "HOME"
  }

  const [myContentType, setMyContentType] = React.useState(
    type(location.pathname),
  )

  useEffect(() => {
    setMyContentType(type(location.pathname))
  }, [location.pathname])

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }

  const navigate = useNavigate()

  return (
    <>
      <div
        className="m-auto flex w-full flex-col space-y-2"
        style={{
          margin: "0 auto",
        }}
      >
        <div className="hidden md:block">
          <Tabs
            className="mt-2 mb-8"
            value={myContentType}
            defaultValue={"HOME"}
          >
            <TabsList>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("HOME")
                  navigate("/my")
                }}
                className="w-full"
                value="HOME"
              >
                {t("ホーム", "Home")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("POSTS")
                  navigate("/my/posts")
                }}
                className="w-full"
                value="POSTS"
              >
                {t("作品", "Posts")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("ALBUMS")
                  navigate("/my/albums")
                }}
                className="w-full"
                value="ALBUMS"
              >
                {t("シリーズ", "Albums")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("FOLDERS")
                  navigate("/my/folders")
                }}
                className="w-full"
                value="FOLDERS"
              >
                {t("コレクション", "Folders")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("RECOMMENDED")
                  navigate("/my/recommended")
                }}
                className="w-full"
                value="RECOMMENDED"
              >
                {t("推薦", "Recommended")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("BOOKMARKS")
                  navigate("/my/bookmarks")
                }}
                className="w-full"
                value="BOOKMARKS"
              >
                {t("ブックマーク", "Bookmarks")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("LIKES")
                  navigate("/my/likes")
                }}
                className="w-full"
                value="LIKES"
              >
                {t("いいね", "Likes")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("VIEWS")
                  navigate("/my/views")
                }}
                className="w-full"
                value="VIEWS"
              >
                {t("閲覧履歴", "Views")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("REPORTS")
                  navigate("/my/reports")
                }}
                className="w-full"
                value="REPORTS"
              >
                {t("運営からのお知らせ", "Reports")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="block md:hidden">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => {
                setMyContentType("HOME")
                navigate("/my")
              }}
              value="HOME"
              variant={"secondary"}
              className={cn(
                myContentType === "HOME" && "bg-gray-200 dark:bg-zinc-900",
              )}
            >
              {t("ホーム", "Home")}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("POSTS")
                navigate("/my/posts")
              }}
              value="POSTS"
              variant={"secondary"}
              className={cn(
                myContentType === "POSTS" && "bg-gray-200 dark:bg-zinc-900",
              )}
            >
              {t("作品", "Posts")}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("ALBUMS")
                navigate("/my/albums")
              }}
              value="ALBUMS"
              variant={"secondary"}
              className={cn(
                myContentType === "ALBUMS" && "bg-gray-200 dark:bg-zinc-900",
              )}
            >
              {t("シリーズ", "Albums")}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("FOLDERS")
                navigate("/my/folders")
              }}
              value="FOLDERS"
              variant={"secondary"}
              className={cn(
                myContentType === "FOLDERS" && "bg-gray-200 dark:bg-zinc-900",
              )}
            >
              {t("コレクション", "Folders")}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("RECOMMENDED")
                navigate("/my/recommended")
              }}
              value="RECOMMENDED"
              variant={"secondary"}
              className={cn(
                myContentType === "RECOMMENDED" &&
                  "bg-gray-200 dark:bg-zinc-900",
              )}
            >
              {t("推薦", "Recommended")}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("BOOKMARKS")
                navigate("/my/bookmarks")
              }}
              value="BOOKMARKS"
              variant={"secondary"}
              className={cn(
                myContentType === "BOOKMARKS" && "bg-gray-200 dark:bg-zinc-900",
              )}
            >
              {t("ブックマーク", "Bookmarks")}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("LIKES")
                navigate("/my/likes")
              }}
              value="LIKES"
              variant={"secondary"}
              className={cn(
                myContentType === "LIKES" && "bg-gray-200 dark:bg-zinc-900",
              )}
            >
              {t("いいね", "Likes")}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("VIEWS")
                navigate("/my/views")
              }}
              value="VIEWS"
              variant={"secondary"}
              className={cn(
                myContentType === "VIEWS" && "bg-gray-200 dark:bg-zinc-900",
              )}
            >
              {t("閲覧履歴", "Views")}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("REPORTS")
                navigate("/my/reports")
              }}
              value="REPORTS"
              variant={"secondary"}
              className={cn(
                myContentType === "REPORTS" && "bg-gray-200 dark:bg-zinc-900",
              )}
            >
              {t("運営お知らせ", "Reports")}
            </Button>
          </div>
        </div>

        {props.outlet}
      </div>
    </>
  )
}
