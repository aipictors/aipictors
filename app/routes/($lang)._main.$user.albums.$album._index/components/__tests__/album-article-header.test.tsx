import { afterEach, describe, expect, mock, test } from "bun:test"
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
} from "@apollo/client/index"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AuthContext } from "~/contexts/auth-context"
import { AlbumArticleHeader } from "../album-article-header"

// 編集ダイアログの中身はこのテストの対象ではない
mock.module(
  "~/routes/($lang)._main.$user.albums.$album._index/components/album-article-editor-dialog",
  () => ({
    AlbumArticleEditorDialog: (props: { children: React.ReactNode }) =>
      props.children,
  }),
)

const album = {
  id: "1",
  title: "猫の毎日",
  description: "猫のシリーズです",
  user: {
    id: "owner",
    login: "neko",
    name: "ねこ",
    iconUrl: "",
    nanoid: "nano",
    isFollowee: false,
    isFollower: false,
  },
  createdAt: 1700000000,
  isSensitive: false,
  isLiked: false,
  isWatched: false,
  likesCount: 3,
  rating: "G",
  thumbnailImageURL: "https://files.aipictors.com/cover",
  slug: "cats",
  worksCount: 12,
  workIds: [10, 20],
  firstWorks: [
    {
      id: "10",
      rating: "G",
      largeThumbnailImageURL: "",
      smallThumbnailImageURL: "",
    },
  ],
  latestWorks: [{ id: "20" }],
}

type Album = typeof album

const renderHeader = (target: Album, userId: string | null) => {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.empty(),
  })
  const auth = {
    isLoading: false,
    isLoggedIn: userId !== null,
    isNotLoggedIn: userId === null,
    userId,
  }

  return render(
    <MemoryRouter>
      <ApolloProvider client={client}>
        <AuthContext.Provider value={auth as never}>
          <AlbumArticleHeader album={target as never} />
        </AuthContext.Provider>
      </ApolloProvider>
    </MemoryRouter>,
  )
}

afterEach(cleanup)

describe("シリーズのヘッダー", () => {
  test("h1 にタイトルを出し、最初と最新の作品へのリンクを出す", async () => {
    renderHeader(album, null)
    const heading = await screen.findByRole("heading", { level: 1 })
    expect(heading.textContent).toBe("猫の毎日")
    expect(
      screen.getByRole("link", { name: "最初から見る" }).getAttribute("href"),
    ).toBe("/posts/10")
    expect(
      screen.getByRole("link", { name: "最新の作品" }).getAttribute("href"),
    ).toBe("/posts/20")
    expect(screen.getByText("全12作品")).toBeTruthy()
  })

  test("最初と最新が同じ作品なら、最新のリンクを出さない", async () => {
    renderHeader({ ...album, latestWorks: [{ id: "10" }] }, null)
    await screen.findByRole("heading", { level: 1 })
    expect(screen.queryByRole("link", { name: "最新の作品" })).toBeNull()
  })

  test("作品がなければ、見るリンクを出さない", async () => {
    renderHeader(
      { ...album, worksCount: 0, firstWorks: [], latestWorks: [] },
      null,
    )
    await screen.findByRole("heading", { level: 1 })
    expect(screen.queryByRole("link", { name: "最初から見る" })).toBeNull()
  })

  test("持ち主には編集を出し、自分のフォローボタンは出さない", async () => {
    renderHeader(album, "owner")
    expect(await screen.findByRole("button", { name: "編集" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "フォローする" })).toBeNull()
  })

  test("ほかの人には編集を出さず、フォローボタンを出す", async () => {
    renderHeader(album, "someone")
    expect(
      await screen.findByRole("button", { name: "フォローする" }),
    ).toBeTruthy()
    expect(screen.queryByRole("button", { name: "編集" })).toBeNull()
  })

  test("年齢制限のあるシリーズには印を出す", async () => {
    renderHeader({ ...album, rating: "R18", isSensitive: true }, null)
    await screen.findByRole("heading", { level: 1 })
    expect(screen.getByText("R18")).toBeTruthy()
  })
})
