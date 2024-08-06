import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { AuthContext } from "~/contexts/auth-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { Button } from "~/components/ui/button"

type Props = {
  activeTab: string
  setActiveTab: (value: string) => void
  userId: string
}

export const UserTabs = (props: Props) => {
  const handleTabClick = (value: string) => {
    props.setActiveTab(value)
  }

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
      ...(albumsCount > 0 || authContext.userId === props.userId
        ? [`シリーズ(${albumsCount})`]
        : []),
      ...(foldersCount > 0 ? [`コレクション(${foldersCount})`] : []),
      ...(stickersCount > 0 ? [`スタンプ(${stickersCount})`] : []),
    ]
  }

  const removeParentheses = (str: string) => {
    return str.replace(/\(([^)]+)\)/, "")
  }

  return (
    <div>
      <Tabs defaultValue="ポートフォリオ">
        <TabsList className="hidden border-b md:block">
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
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {tabList().map((tabValue: string) => (
          <Button
            key={removeParentheses(tabValue)}
            onClick={() => handleTabClick(removeParentheses(tabValue))}
            variant="secondary"
          >
            {tabValue}
          </Button>
        ))}
      </div>
    </div>
  )
}

const albumsCountQuery = graphql(
  `query AlbumsCount($where: AlbumsWhereInput) {
    albumsCount(where: $where)
  }`,
)

const foldersCountQuery = graphql(
  `query FoldersCount($where: FoldersWhereInput) {
    foldersCount(where: $where)
  }`,
)

const stickersCountQuery = graphql(
  `query StickersCount($where: StickersWhereInput) {
    stickersCount(where: $where)
  }`,
)

const worksCountQuery = graphql(
  `query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)
