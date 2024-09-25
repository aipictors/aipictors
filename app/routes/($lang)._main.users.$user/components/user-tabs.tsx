import { useContext } from "react"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  activeTab: string
  setActiveTab: (value: string) => void
  userId: string
  isSensitive?: boolean
}

export function UserTabs(props: Props) {
  const t = useTranslation() // useTranslationを使用
  const authContext = useContext(AuthContext)

  const handleTabClick = (value: string) => {
    props.setActiveTab(value)
  }

  const worksCountResp = useQuery(worksCountQuery, {
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
        workType: "WORK",
      },
    },
  })
  const worksCount = worksCountResp.data?.worksCount ?? 0

  const novelsCountResp = useQuery(worksCountQuery, {
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
        workType: "NOVEL",
      },
    },
  })
  const novelsCount = novelsCountResp.data?.worksCount ?? 0

  const columnsCountResp = useQuery(worksCountQuery, {
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
        workType: "COLUMN",
      },
    },
  })
  const columnsCount = columnsCountResp.data?.worksCount ?? 0

  const videosCountResp = useQuery(worksCountQuery, {
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
        workType: "VIDEO",
      },
    },
  })
  const videosCount = videosCountResp.data?.worksCount ?? 0

  const albumsCountResp = useQuery(albumsCountQuery, {
    variables: {
      where: {
        ownerUserId: props.userId,
        isSensitive: props.isSensitive,
        needInspected: false,
        needsThumbnailImage: false,
      },
    },
  })
  const albumsCount = albumsCountResp.data?.albumsCount ?? 0

  const folderCountResp = useQuery(foldersCountQuery, {
    variables: {
      where: {
        userId: props.userId,
        isPrivate: false,
        isSensitive: props.isSensitive,
      },
    },
  })
  const foldersCount = folderCountResp.data?.foldersCount ?? 0

  const stickersCountResp = useQuery(stickersCountQuery, {
    variables: {
      where: {
        creatorUserId: props.userId,
      },
    },
  })
  const stickersCount = stickersCountResp.data?.stickersCount ?? 0

  const tabList = () => {
    return [
      t("ポートフォリオ", "Portfolio"),
      ...(worksCount > 0 ? [`${t("画像", "Images")}(${worksCount})`] : []),
      ...(novelsCount > 0 ? [`${t("小説", "Novels")}(${novelsCount})`] : []),
      ...(columnsCount > 0
        ? [`${t("コラム", "Columns")}(${columnsCount})`]
        : []),
      ...(videosCount > 0 ? [`${t("動画", "Videos")}(${videosCount})`] : []),
      ...(albumsCount > 0
        ? [`${t("シリーズ", "Series")}(${albumsCount})`]
        : []),
      ...(foldersCount > 0
        ? [`${t("コレクション", "Collections")}(${foldersCount})`]
        : []),
      ...(stickersCount > 0
        ? [`${t("スタンプ", "Stamps")}(${stickersCount})`]
        : []),
    ]
  }

  const removeParentheses = (str: string) => {
    return str.replace(/\(([^)]+)\)/, "")
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {tabList().map((tabValue: string) => (
        <Button
          key={removeParentheses(tabValue)}
          onClick={() => handleTabClick(removeParentheses(tabValue))}
          variant="secondary"
          className={
            removeParentheses(tabValue) === props.activeTab ? "opacity-50" : ""
          }
        >
          {tabValue}
        </Button>
      ))}
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
