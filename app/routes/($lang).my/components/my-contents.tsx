import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { AuthContext } from "~/contexts/auth-context"
import { useContext, useEffect } from "react"
import { useLocation, useNavigate } from "@remix-run/react"
import React from "react"
import { Button } from "~/components/ui/button"

type Props = Readonly<{
  outlet: React.ReactNode
}>

/**
 * ダッシュボードコンテンツ
 */
export function MyContents(props: Props) {
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
                {"ホーム"}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("POSTS")
                  navigate("/my/posts")
                }}
                className="w-full"
                value="POSTS"
              >
                {"作品"}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("ALBUMS")
                  navigate("/my/albums")
                }}
                className="w-full"
                value="ALBUMS"
              >
                {"シリーズ"}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("RECOMMENDED")
                  navigate("/my/recommended")
                }}
                className="w-full"
                value="RECOMMENDED"
              >
                {"推薦"}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("BOOKMARKS")
                  navigate("/my/bookmarks")
                }}
                className="w-full"
                value="BOOKMARKS"
              >
                {"ブックマーク"}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setMyContentType("LIKES")
                  navigate("/my/likes")
                }}
                className="w-full"
                value="LIKES"
              >
                {"いいね"}
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
            >
              {"ホーム"}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("POSTS")
                navigate("/my/posts")
              }}
              value="POSTS"
              variant={"secondary"}
            >
              {"作品"}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("ALBUMS")
                navigate("/my/albums")
              }}
              value="ALBUMS"
              variant={"secondary"}
            >
              {"シリーズ"}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("RECOMMENDED")
                navigate("/my/recommended")
              }}
              value="RECOMMENDED"
              variant={"secondary"}
            >
              {"推薦"}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("BOOKMARKS")
                navigate("/my/bookmarks")
              }}
              value="BOOKMARKS"
              variant={"secondary"}
            >
              {"ブックマーク"}
            </Button>
            <Button
              onClick={() => {
                setMyContentType("LIKES")
                navigate("/my/likes")
              }}
              value="LIKES"
              variant={"secondary"}
            >
              {"いいね"}
            </Button>
          </div>
        </div>

        {props.outlet}
      </div>
    </>
  )
}
