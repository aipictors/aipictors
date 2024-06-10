import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { AuthContext } from "@/_contexts/auth-context"
import { albumsCountQuery } from "@/_graphql/queries/album/albums-count"
import { foldersCountQuery } from "@/_graphql/queries/folder/folders-count"
import { worksCountQuery } from "@/_graphql/queries/work/works-count"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"

type Props = {
  activeTab: string
  setActiveTab: (value: string) => void
}

export const UserTabs = (props: Props) => {
  // TabTriggerがクリックされたときにactiveTabを更新
  const handleTabClick = (value: string) => {
    props.setActiveTab(value)
  }

  const authContext = useContext(AuthContext)

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        userId: authContext.userId,
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
        userId: authContext.userId,
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
        userId: authContext.userId,
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
        userId: authContext.userId,
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
        ownerUserId: authContext.userId,
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
        userId: authContext.userId,
      },
    },
  })

  const foldersCount = folderCountResp.data?.foldersCount ?? 0

  const tabList = () => {
    return [
      "ポートフォリオ",
      ...(worksCount > 0 ? [`画像(${worksCount})`] : []),
      ...(novelsCount > 0 ? [`小説(${novelsCount})`] : []),
      ...(columnsCount > 0 ? [`コラム(${columnsCount})`] : []),
      ...(videosCount > 0 ? [`動画(${videosCount})`] : []),
      ...(albumsCount > 0 ? [`シリーズ(${albumsCount})`] : []),
      ...(foldersCount > 0 ? [`コレクション(${foldersCount})`] : []),
      `スタンプ(${novelsCount})`,
    ]
  }

  // 括弧書きを消す
  const removeParentheses = (str: string) => {
    return str.replace(/\(([^)]+)\)/, "")
  }

  return (
    <Tabs defaultValue="画像">
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
  )
}
