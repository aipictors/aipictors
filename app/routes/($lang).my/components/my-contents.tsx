import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { AuthContext } from "~/contexts/auth-context"
import { useContext, useEffect } from "react"
import { Link, useLocation } from "@remix-run/react"
import React from "react"

type Props = Readonly<{
  outlet: React.ReactNode
}>

/**
 * ダッシュボードコンテンツ
 */
export const MyContents = (props: Props) => {
  const authContext = useContext(AuthContext)
  const location = useLocation()

  const type = (path: string) => {
    if (path.includes("posts")) {
      return "POSTS"
    }
    if (path.includes("albums")) {
      return "ALBUMS"
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

  return (
    <>
      <div
        className="m-auto w-full"
        style={{
          margin: "0 auto",
        }}
      >
        <div>
          <Tabs
            className="mt-2 mb-8"
            value={myContentType}
            defaultValue={"HOME"}
          >
            <TabsList>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("HOME")
                }}
                className="w-full"
                value="HOME"
              >
                <Link to="/my" className="w-full">
                  ホーム
                </Link>
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("POSTS")
                }}
                className="w-full"
                value="POSTS"
              >
                <Link to="/my/posts" className="w-full">
                  作品
                </Link>
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("ALBUMS")
                }}
                className="w-full"
                value="ALBUMS"
              >
                <Link to="/my/albums" className="w-full">
                  シリーズ
                </Link>
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("RECOMMENDED")
                }}
                className="w-full"
                value="RECOMMENDED"
              >
                <Link to="/my/recommended" className="w-full">
                  推薦
                </Link>
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("BOOKMARKS")
                }}
                className="w-full"
                value="BOOKMARKS"
              >
                <Link to="/my/bookmarks" className="w-full">
                  ブックマーク
                </Link>
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("LIKES")
                }}
                className="w-full"
                value="LIKES"
              >
                <Link to="/my/likes" className="w-full">
                  いいね
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {props.outlet}
      </div>
    </>
  )
}
