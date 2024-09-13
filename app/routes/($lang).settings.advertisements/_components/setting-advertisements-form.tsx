import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ApolloError, useMutation, useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { type SetStateAction, useContext, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "~/components/ui/card"
import { toDateText } from "~/utils/to-date-text"
import { addHours, endOfMonth, format, startOfMonth } from "date-fns"
import { Badge } from "~/components/ui/badge"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { Checkbox } from "~/components/ui/checkbox"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { Loader2Icon } from "lucide-react"
import { AuthContext } from "~/contexts/auth-context"
import { Separator } from "~/components/ui/separator"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { Link } from "@remix-run/react"

// 日本時間 (JST) に変換するためのヘルパー関数
const toJST = (date: Date) => {
  return addHours(date, 9) // UTCに対して+9時間でJSTに変換
}

export function SettingAdvertisementsForm() {
  const authContext = useContext(AuthContext)

  const { data: isAdvertiser, loading: isAdvertiserLoading } = useQuery(
    viewerIsAdvertiserQuery,
  )

  if (isAdvertiser?.viewer?.isAdvertiser === false) {
    throw new Response(null, { status: 404 })
  }

  const [newAdvertisement, setNewAdvertisement] = useState({
    imageUrl: "",
    url: "",
    displayProbability: 0,
    isSensitive: false,
    isActive: false,
    startAt: "",
    endAt: "",
  })

  const { data: token } = useQuery(viewerTokenQuery, {
    skip: authContext.isLoading,
  })
  const [date, setDate] = useState<Date | null>(null)

  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)

  const [isSensitiveFilter, setIsSensitiveFilter] = useState<
    boolean | undefined
  >(undefined)

  const [isEditing, setIsEditing] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState("list") // 切り替え用

  const { data, loading, error, refetch } = useQuery(
    viewerAdvertisementsQuery,
    {
      skip: authContext.isLoading,
      variables: {
        limit: 64,
        offset: 0,
      },
    },
  )

  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

  const [count, setCount] = useState(0)

  const [imageBase64, setImageBase64] = useState<string | null>(null)

  const [isUploading, setIsUploading] = useState(false)

  const [createAdvertisement, { loading: isCreating }] = useMutation(
    createCustomerAdvertisement,
  )

  const [updateAdvertisement, { loading: isUpdating }] = useMutation(
    updateCustomerAdvertisement,
  )

  const [deleteAdvertisement, { loading: isDeleting }] = useMutation(
    deleteCustomerAdvertisement,
  )

  // フィルタリングした広告リストを生成するロジック
  const filteredAdvertisements = data?.viewer?.customerAdvertisements.filter(
    (advertisement) => {
      const isActiveMatch =
        isActive === undefined || advertisement.isActive === isActive
      const isSensitiveMatch =
        isSensitiveFilter === undefined ||
        advertisement.isSensitive === isSensitiveFilter
      return isActiveMatch && isSensitiveMatch
    },
  )

  const handleCreate = async () => {
    try {
      if (!newAdvertisement.imageUrl || !newAdvertisement.url) {
        toast("画像URLとリンクURLは必須です")
        return
      }

      const selectedDate = new Date(newAdvertisement.startAt)

      const startAtJST = toJST(startOfMonth(selectedDate))

      const endAtJST = toJST(endOfMonth(selectedDate))

      await createAdvertisement({
        variables: {
          input: {
            imageUrl: newAdvertisement.imageUrl,
            url: newAdvertisement.url,
            displayProbability: newAdvertisement.displayProbability,
            page: "work",
            isSensitive: newAdvertisement.isSensitive,
            isActive: newAdvertisement.isActive,
            startAt: startAtJST.toISOString(),
            endAt: endAtJST.toISOString(),
          },
        },
      })
      toast("広告を作成しました")
      setViewMode("list")
      setIsEditing(false)

      // データ取り直し
      refetch({
        limit: 64,
        offset: 0,
      })
    } catch (error) {
      if (error instanceof ApolloError) {
        toast(error.message)
      }
    }
  }

  const handleEdit = (
    advertisement: FragmentOf<typeof AdvertisementsFragment>,
  ) => {
    setNewAdvertisement({
      imageUrl: advertisement.imageUrl,
      url: advertisement.url,
      displayProbability: advertisement.displayProbability,
      isSensitive: advertisement.isSensitive,
      isActive: advertisement.isActive,
      startAt: startOfMonth(
        new Date(advertisement.startAt * 1000),
      ).toISOString(),
      endAt: endOfMonth(new Date(advertisement.endAt * 1000)).toISOString(),
    })
    setIsEditing(true)
    setEditingId(advertisement.id)
    setViewMode("create") // 編集モードに切り替え
  }

  const handleUpdate = async () => {
    if (!editingId) {
      return
    }

    try {
      const selectedDate = new Date(newAdvertisement.startAt)
      const startAtJST = toJST(startOfMonth(selectedDate))
      const endAtJST = toJST(endOfMonth(selectedDate))

      await updateAdvertisement({
        variables: {
          input: {
            id: editingId,
            imageUrl: newAdvertisement.imageUrl,
            url: newAdvertisement.url,
            displayProbability: newAdvertisement.displayProbability,
            page: "work",
            isSensitive: newAdvertisement.isSensitive,
            isActive: newAdvertisement.isActive,
            startAt: startAtJST.toISOString(),
            endAt: endAtJST.toISOString(),
          },
        },
      })
      toast("広告を更新しました")
      setIsEditing(false)
      setNewAdvertisement({
        imageUrl: "",
        url: "",
        displayProbability: 0,
        isSensitive: false,
        isActive: false,
        startAt: "",
        endAt: "",
      })
      setViewMode("list")
    } catch (error) {
      if (error instanceof ApolloError) {
        toast(error.message)
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAdvertisement({
        variables: {
          input: { ids: [id] },
        },
      })
      toast("広告を削除しました")
    } catch (error) {
      if (error instanceof ApolloError) {
        toast(error.message)
      }
    }
  }

  const handleModeSwitch = (mode: SetStateAction<string>) => {
    setViewMode(mode)
    setIsEditing(false)
    setImageBase64(null)
    setNewAdvertisement({
      imageUrl: "",
      url: "",
      displayProbability: 0,
      isSensitive: false,
      isActive: false,
      startAt: new Date().toISOString(),
      endAt: new Date().toISOString(),
    })
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) {
      toast("画像を選択してください")
      return
    }

    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      if (e.target) {
        img.src = e.target.result as string
        setImageBase64(img.src)
      }
    }

    reader.onerror = () => toast("画像読み込みに失敗しました")
    reader.readAsDataURL(file)
  }

  const onUpload = async () => {
    if (!imageBase64) {
      toast("画像を選択してください")
      return
    }

    if (count >= 30) {
      toast(
        "画像アップロード上限です、下書きで一時投稿ののち、時間を置いて画面更新してください",
      )
      return
    }

    setIsUploading(true)

    const url = await uploadPublicImage(imageBase64, token?.viewer?.token)

    setIsUploading(false)

    if (url) {
      setUploadedImageUrls([...uploadedImageUrls, url])
      setImageBase64(null)
      setCount(count + 1)
      setNewAdvertisement({ ...newAdvertisement, imageUrl: url })
    } else {
      toast("画像のアップロードに失敗しました")
    }
  }

  // 再フェッチで検索を実行
  const handleSearch = () => {
    if (date) {
      const selectedDate = date
      const startAtJST = toJST(startOfMonth(selectedDate))
      const endAtJST = toJST(endOfMonth(selectedDate))
      refetch({
        limit: 64,
        offset: 0,
        where: {
          startAtAfter: startAtJST.toISOString(),
          endAtAfter: endAtJST.toISOString(),
          isActive: isActive !== undefined ? isActive : undefined,
          isSensitive:
            isSensitiveFilter !== undefined ? isSensitiveFilter : undefined,
        },
      })
    }
  }

  if (authContext.isLoading || isAdvertiserLoading) {
    return <AppLoadingPage />
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <Button
          disabled={viewMode === "list"}
          onClick={() => handleModeSwitch("list")}
        >
          広告一覧
        </Button>
        <Button onClick={() => handleModeSwitch("create")}>
          新しい広告を作成
        </Button>
      </div>
      {viewMode === "list" && (
        <>
          <h2>広告設定一覧</h2>
          {loading && <AppLoadingPage />}
          {error && <p>エラーが発生しました: {error.message}</p>}
          <div className="flex items-center space-x-2">
            <p className="w-24">{"配信月："}</p>
            <Input
              type="month"
              value={date ? format(date, "yyyy-MM") : ""}
              onChange={(event) => {
                setDate(new Date(`${event.target.value}-01`))
              }}
            />
            <Button onClick={handleSearch}>検索</Button>
          </div>
          <div className="flex flex-col space-x-2 space-y-2 md:flex-row">
            <div className="flex space-x-2">
              <div className="flex w-24 items-center space-x-2">
                <Checkbox
                  id="activeFilter"
                  checked={isActive === true}
                  onCheckedChange={(checked) => {
                    setIsActive(checked === true)
                  }}
                />
                <label htmlFor="activeFilter">{"有効"}</label>
              </div>
              <div className="flex w-40 items-center space-x-2">
                <Checkbox
                  id="sensitiveFilter"
                  checked={isSensitiveFilter === true}
                  onCheckedChange={(checked) =>
                    setIsSensitiveFilter(checked === true ? true : undefined)
                  }
                />
                <label htmlFor="sensitiveFilter">{"センシティブ"}</label>
              </div>
              <div className="flex w-40 items-center space-x-2">
                <Checkbox
                  id="ageFilter"
                  checked={isSensitiveFilter === false}
                  onCheckedChange={(checked) =>
                    setIsSensitiveFilter(checked === true ? false : undefined)
                  }
                />
                <label htmlFor="ageFilter">{"全年齢"}</label>
              </div>
            </div>
            <Button
              variant={"secondary"}
              className="w-full"
              onClick={() => {
                setIsActive(undefined)
                setIsSensitiveFilter(undefined)
              }}
            >
              {"すべて"}
            </Button>
          </div>
          <Card className="space-y-4">
            <CardContent className="flex flex-col space-y-2 p-2">
              {filteredAdvertisements?.map(
                (advertisement: FragmentOf<typeof AdvertisementsFragment>) => (
                  <Card
                    key={advertisement.id}
                    className="flex items-center justify-between border p-4"
                  >
                    <CardContent className="flex flex-col space-y-2 p-2">
                      <div className="m-auto max-w-64 space-x-4 text-wrap md:flex md:max-w-full">
                        <img
                          src={advertisement.imageUrl}
                          alt="サムネイル"
                          className="m-auto h-auto w-32"
                        />
                        <div className="flex flex-col space-y-2">
                          <Link
                            target="_blank"
                            to={
                              advertisement.url.startsWith("http")
                                ? advertisement.url
                                : `https://${advertisement.url}`
                            }
                            className="w-64 text-wrap"
                          >
                            {advertisement.url}
                          </Link>
                          <p>表示優先度: {advertisement.displayProbability}</p>
                          <p>
                            作成日:
                            {toDateText(advertisement.createdAt)}
                          </p>
                          <p>
                            配信日:
                            {toDateText(advertisement.startAt)}
                          </p>
                          <div className="flex space-x-2">
                            <Badge
                              variant={
                                advertisement.isActive ? "default" : "secondary"
                              }
                              className="w-16 text-center"
                            >
                              <div className="m-auto">
                                {advertisement.isActive ? "公開中" : "非公開"}
                              </div>
                            </Badge>
                            <Badge
                              variant={"secondary"}
                              className="w-24 text-center"
                            >
                              <div className="m-auto">
                                {advertisement.isSensitive
                                  ? "センシティブ"
                                  : "全年齢"}
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant={"secondary"}
                          onClick={() => handleEdit(advertisement)}
                        >
                          編集
                        </Button>

                        <AppConfirmDialog
                          title={"確認"}
                          description={"本当にこの作品を削除しますか？"}
                          onNext={async () => handleDelete(advertisement.id)}
                          onCancel={() => {}}
                        >
                          <Button variant="secondary">削除</Button>
                        </AppConfirmDialog>
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === "create" && (
        <>
          <h2>{isEditing ? "広告を編集" : "新しい広告を作成"}</h2>
          <div className="space-y-4">
            <p className="font-semibold text-sm">{"広告画像"}</p>
            {newAdvertisement.imageUrl && (
              <div className="bg-zinc-100 dark:bg-zinc-800">
                <img
                  className="m-auto max-h-32"
                  src={newAdvertisement.imageUrl}
                  alt="広告画像"
                />
              </div>
            )}
            {imageBase64 && (
              <>
                <p className="font-semibold text-xs">{"プレビュー"}</p>
                <div className="bg-zinc-100 dark:bg-zinc-800">
                  <img
                    className="m-auto max-h-32"
                    src={imageBase64}
                    alt="広告画像"
                  />
                </div>
              </>
            )}
            <Input
              placeholder="画像URL"
              value={newAdvertisement.imageUrl}
              onChange={(e) => {
                setNewAdvertisement({
                  ...newAdvertisement,
                  imageUrl: e.target.value,
                })
                if (e.target.value === "") {
                  setImageBase64(null)
                }
              }}
              onBlur={async (e) => {
                const imageUrl = e.target.value
                if (imageUrl === "") {
                  setImageBase64(null)
                  return
                }

                try {
                  const base64 = await getBase64FromImageUrl(imageUrl)
                  setImageBase64(base64)
                } catch (error) {
                  console.error("画像のBase64変換に失敗しました", error)
                }
              }}
              disabled={isUploading || imageBase64 !== null}
            />
            <p className="text-sm opacity-80">
              {"※ 外部の画像URLを直接指定することも可能"}
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/webp,image/jpeg,image/jpg,image/png"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full"
              />
              <Button
                variant={"secondary"}
                onClick={() => setImageBase64(null)}
              >
                {"選択した画像を削除"}
              </Button>
            </div>
            <Button
              className="w-full items-center"
              onClick={onUpload}
              disabled={!imageBase64 || isUploading}
            >
              {isUploading ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <p>{"画像をアップロード"}</p>
              )}
            </Button>
            <Separator />
            <p className="font-semibold text-sm">
              {"広告の配信期間（配信月）"}
            </p>
            <Input
              type="month"
              value={format(newAdvertisement.startAt, "yyyy-MM")}
              onChange={(event) => {
                setNewAdvertisement({
                  ...newAdvertisement,
                  startAt: new Date(`${event.target.value}-01`).toISOString(),
                  endAt: endOfMonth(
                    new Date(`${event.target.value}-01`),
                  ).toISOString(),
                })
              }}
            />
            <Separator />
            <p className="font-semibold text-sm">
              {"広告をクリックした際の遷移先"}
            </p>
            <Input
              placeholder="リンクURL"
              value={newAdvertisement.url}
              onChange={(e) =>
                setNewAdvertisement({
                  ...newAdvertisement,
                  url: e.target.value,
                })
              }
            />
            <Separator />
            <p className="font-semibold text-sm">{"センシティブかどうか"}</p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sensitive"
                checked={newAdvertisement.isSensitive}
                onCheckedChange={(checked) => {
                  if (checked === true) {
                    setNewAdvertisement({
                      ...newAdvertisement,
                      isSensitive: true,
                    })
                  } else {
                    setNewAdvertisement({
                      ...newAdvertisement,
                      isSensitive: false,
                    })
                  }
                }}
              />
              <label
                htmlFor="sensitive"
                className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {"センシティブ"}
              </label>
            </div>
            <Separator />
            <p className="font-semibold text-sm">
              {
                "表示する優先度（全体の数字で均等割りして確率を算出、高いほど確率が高くなる）"
              }
            </p>
            <Input
              placeholder="表示優先度"
              type="number"
              max={1000}
              value={newAdvertisement.displayProbability}
              onChange={(e) =>
                setNewAdvertisement({
                  ...newAdvertisement,
                  displayProbability: Number.parseFloat(e.target.value),
                })
              }
            />
            <Separator />
            <p className="font-semibold text-sm">
              {"有効化されると表示されるようになります"}
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={newAdvertisement.isActive}
                onCheckedChange={(checked) => {
                  if (checked === true) {
                    setNewAdvertisement({
                      ...newAdvertisement,
                      isActive: true,
                    })
                  } else {
                    setNewAdvertisement({
                      ...newAdvertisement,
                      isActive: false,
                    })
                  }
                }}
              />
              <label
                htmlFor="active"
                className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {"有効化"}
              </label>
            </div>
            <Button
              className="w-full"
              disabled={
                !newAdvertisement.imageUrl ||
                !newAdvertisement.url ||
                isCreating ||
                isUpdating
              }
              onClick={isEditing ? handleUpdate : handleCreate}
            >
              {isCreating || isUpdating ? (
                <Loader2Icon className="m-auto h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "更新"
              ) : (
                "広告を作成"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export const AdvertisementsFragment = graphql(
  `fragment AdvertisementsFields on CustomerAdvertisementNode @_unmask {
      id
      imageUrl
      url
      displayProbability
      clickCount
      impressionCount
      isSensitive
      createdAt
      page
      startAt
      endAt
      isActive
  }`,
)

// 自身の広告一覧を取得するクエリ
const viewerAdvertisementsQuery = graphql(
  `query ViewerAdvertisements($limit: Int!, $offset: Int!, $where: CustomerAdvertisementsWhereInput) {
    viewer {
      customerAdvertisements(limit: $limit, offset: $offset, where: $where) {
        ...AdvertisementsFields
      }
    }
  }`,
  [AdvertisementsFragment],
)

// 広告を作成するミューテーション
const createCustomerAdvertisement = graphql(
  `mutation CreateCustomerAdvertisement($input: CreateCustomerAdvertisement!) {
    createCustomerAdvertisement(input: $input) {
      id
    }
  }`,
)

// 広告を更新するミューテーション
const updateCustomerAdvertisement = graphql(
  `mutation UpdateCustomerAdvertisement($input: UpdateCustomerAdvertisement!) {
    updateCustomerAdvertisement(input: $input) {
      id
    }
  }`,
)

// 広告を削除するミューテーション
const deleteCustomerAdvertisement = graphql(
  `mutation DeleteCustomerAdvertisement($input: DeleteCustomerAdvertisementInput!) {
    deleteCustomerAdvertisement(input: $input)
  }`,
)

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      id
      token
    }
  }`,
)

const viewerIsAdvertiserQuery = graphql(
  `query ViewerIsAdvertiser {
    viewer {
      isAdvertiser
    }
  }`,
)
