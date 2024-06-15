import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { AuthContext } from "@/_contexts/auth-context"
import { albumsCountQuery } from "@/_graphql/queries/album/albums-count"
import { foldersCountQuery } from "@/_graphql/queries/folder/folders-count"
import { stickersCountQuery } from "@/_graphql/queries/sticker/stickers-count"
import { worksCountQuery } from "@/_graphql/queries/work/works-count"
import { config } from "@/config"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  activeTab: string
  setActiveTab: (value: string) => void
  userId: string
}

export const UserTabs = (props: Props) => {
  const handleTabClick = (value: string) => {
    props.setActiveTab(value)
  }

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const authContext = useContext(AuthContext)

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: ["G", "R15", "R18", "R18G"],
        workType: "WORK",
      },
    },
  })

  const worksCount = worksCountResp.data?.worksCount ?? 0

  const novelsCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: ["G", "R15", "R18", "R18G"],
        workType: "NOVEL",
      },
    },
  })

  const novelsCount = novelsCountResp.data?.worksCount ?? 0

  const columnsCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: ["G", "R15", "R18", "R18G"],
        workType: "COLUMN",
      },
    },
  })

  const columnsCount = columnsCountResp.data?.worksCount ?? 0

  const videosCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: ["G", "R15", "R18", "R18G"],
        workType: "VIDEO",
      },
    },
  })

  const videosCount = videosCountResp.data?.worksCount ?? 0

  const albumsCountResp = useSuspenseQuery(albumsCountQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      where: {
        ownerUserId: props.userId,
        isSensitiveAndAllRating: true,
        isSensitive: true,
        needInspected: false,
        needsThumbnailImage: false,
      },
    },
  })

  const albumsCount = albumsCountResp.data?.albumsCount ?? 0

  const folderCountResp = useSuspenseQuery(foldersCountQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      where: {
        userId: props.userId,
      },
    },
  })

  const foldersCount = folderCountResp.data?.foldersCount ?? 0

  const stickersCountResp = useSuspenseQuery(stickersCountQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      where: {
        creatorUserId: props.userId,
      },
    },
  })

  const stickersCount = stickersCountResp.data?.stickersCount ?? 0

  const tabList = () => {
    return [
      "ポートフォリオ",
      ...(worksCount > 0 ? [`画像(${worksCount})`] : []),
      ...(novelsCount > 0 ? [`小説(${novelsCount})`] : []),
      ...(columnsCount > 0 ? [`コラム(${columnsCount})`] : []),
      ...(videosCount > 0 ? [`動画(${videosCount})`] : []),
      ...(albumsCount > 0 ? [`シリーズ(${albumsCount})`] : []),
      ...(foldersCount > 0 ? [`コレクション(${foldersCount})`] : []),
      ...(stickersCount > 0 ? [`スタンプ(${stickersCount})`] : []),
    ]
  }

  const removeParentheses = (str: string) => {
    return str.replace(/\(([^)]+)\)/, "")
  }

  return (
    <div>
      {isDesktop ? (
        <Tabs defaultValue="ポートフォリオ">
          <TabsList className="border-b">
            {tabList().map((tabValue) => (
              <TabsTrigger
                key={removeParentheses(tabValue)}
                value={removeParentheses(tabValue)}
                onClick={() => handleTabClick(removeParentheses(tabValue))}
              >
                {tabValue}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {tabList().map((tabValue) => (
            // biome-ignore lint/a11y/useButtonType: <explanation>
            <button
              key={removeParentheses(tabValue)}
              onClick={() => handleTabClick(removeParentheses(tabValue))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-center font-medium text-gray-600 text-sm focus:text-gray-800 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {tabValue}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
