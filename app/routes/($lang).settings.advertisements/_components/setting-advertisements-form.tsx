import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ApolloError, useMutation, useQuery } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"
import { type SetStateAction, useContext, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "~/components/ui/card"
import { toDateText } from "~/utils/to-date-text"
import { addHours, endOfMonth, format, startOfMonth } from "date-fns"
import { Badge } from "~/components/ui/badge"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { Checkbox } from "~/components/ui/checkbox"
import { Loader2Icon } from "lucide-react"
import { AuthContext } from "~/contexts/auth-context"
import { Separator } from "~/components/ui/separator"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { SettingsAdvertisementsDeleteConfirmDialog } from "~/routes/($lang).settings.advertisements/_components/settings-advertisements-delete-confirm-dialog"

// 日本時間 (JST) に変換するためのヘルパー関数
const toJST = (date: Date) => {
  return addHours(date, 9) // UTCに対して+9時間でJSTに変換
}

export function SettingAdvertisementsForm () {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

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
        toast(
          t(
            "画像URLとリンクURLは必須です",
            "Image URL and Link URL are required",
          ),
        )
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
      toast(t("広告を作成しました", "Advertisement created"))
      setViewMode("list")
      setIsEditing(false)

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
      toast(t("広告を更新しました", "Advertisement updated"))
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
      toast(t("広告を削除しました", "Advertisement deleted"))
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

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <Button
          disabled={viewMode === "list"}
          onClick={() => handleModeSwitch("list")}
        >
          {t("広告一覧", "Advertisement List")}
        </Button>
        <Button onClick={() => handleModeSwitch("create")}>
          {t("新しい広告を作成", "Create New Advertisement")}
        </Button>
      </div>
      {viewMode === "list" && (
        <>
          <h2>{t("広告設定一覧", "Advertisement Settings List")}</h2>
          {loading && <AppLoadingPage />}
          {error && (
            <p>
              {t("エラーが発生しました", "An error occurred")}: {error.message}
            </p>
          )}
          <div className="flex items-center space-x-2">
            <p className="w-24">{t("配信月", "Delivery Month")}：</p>
            <Input
              type="month"
              value={date ? format(date, "yyyy-MM") : ""}
              onChange={(event) => {
                setDate(new Date(`${event.target.value}-01`))
              }}
            />
            <Button onClick={handleSearch}>{t("検索", "Search")}</Button>
          </div>
          <div className="flex flex-col space-x-2 space-y-2 md:flex-row">
            <div className="flex space-x-2">
              <div className="flex w-24 items-center space-x-2">
                <label htmlFor="activeFilter">
                  {t("有効", "Active")}
                  <Checkbox
                    id="activeFilter"
                    checked={isActive === true}
                    onCheckedChange={(checked) => {
                      setIsActive(checked === true)
                    }}
                  />
                </label>
              </div>
              <div className="flex w-40 items-center space-x-2">
                <label htmlFor="sensitiveFilter">
                  {t("センシティブ", "Sensitive")}
                  <Checkbox
                    id="sensitiveFilter"
                    checked={isSensitiveFilter === true}
                    onCheckedChange={(checked) =>
                      setIsSensitiveFilter(checked === true ? true : undefined)
                    }
                  />
                </label>
              </div>
              <div className="flex w-40 items-center space-x-2">
                <label htmlFor="ageFilter">
                  {t("全年齢", "All Ages")}
                  <Checkbox
                    id="ageFilter"
                    checked={isSensitiveFilter === false}
                    onCheckedChange={(checked) =>
                      setIsSensitiveFilter(checked === true ? false : undefined)
                    }
                  />
                </label>
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
              {t("すべて", "All")}
            </Button>
          </div>
          {/* 広告リスト */}
          <Card className="space-y-4">
            <CardContent className="flex flex-col gap-x-2 space-y-2 p-2">
              {filteredAdvertisements?.map(
                (advertisement: FragmentOf<typeof AdvertisementsFragment>) => (
                  <Card
                    key={advertisement.id}
                    className="flex items-center justify-between border p-4"
                  >
                    <CardContent className="flex flex-col gap-x-2 space-y-2 p-2">
                      <div className="m-auto max-w-64 space-x-4 text-wrap md:flex md:max-w-full">
                        <img
                          src={advertisement.imageUrl}
                          alt={t("サムネイル", "Thumbnail")}
                          className="m-auto h-auto w-32"
                        />
                        <div className="ml-2 flex flex-col space-y-2">
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
                          <p>
                            {t("表示優先度", "Display Priority")}:{" "}
                            {advertisement.displayProbability}
                          </p>
                          <p>
                            {t("表示回数", "View")}:{" "}
                            {advertisement.impressionCount}
                          </p>
                          <p>
                            {t("クリック回数", "Clicked")}:{" "}
                            {advertisement.clickCount}
                          </p>
                          <p>
                            {t("作成日", "Created At")}:{" "}
                            {toDateText(advertisement.createdAt)}
                          </p>
                          <p>
                            {t("配信日", "Start At")}:{" "}
                            {toDateText(advertisement.startAt)}
                          </p>
                          <div className="mt-2 flex space-x-2">
                            <Badge
                              variant={
                                advertisement.isActive ? "default" : "secondary"
                              }
                              className="w-16 text-center"
                            >
                              <div className="m-auto">
                                {advertisement.isActive
                                  ? t("公開中", "Active")
                                  : t("非公開", "Inactive")}
                              </div>
                            </Badge>
                            <Badge
                              variant={"secondary"}
                              className="w-24 text-center"
                            >
                              <div className="m-auto">
                                {advertisement.isSensitive
                                  ? t("センシティブ", "Sensitive")
                                  : t("全年齢", "All Ages")}
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <Button
                          variant={"secondary"}
                          onClick={() => handleEdit(advertisement)}
                        >
                          {t("編集", "Edit")}
                        </Button>
                        <SettingsAdvertisementsDeleteConfirmDialog
                          onDelete={async () => handleDelete(advertisement.id)}
                        />
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
          <h2>
            {isEditing
              ? t("広告を編集", "Edit Advertisement")
              : t("新しい広告を作成", "Create New Advertisement")}
          </h2>
          <div className="space-y-4">
            <p className="font-semibold text-sm">
              {t("広告画像", "Advertisement Image")}
            </p>
            {newAdvertisement.imageUrl && (
              <div className="bg-zinc-100 dark:bg-zinc-800">
                <img
                  className="m-auto max-h-32"
                  src={newAdvertisement.imageUrl}
                  alt={t("広告画像", "Advertisement Image")}
                />
              </div>
            )}
            {imageBase64 && (
              <>
                <p className="font-semibold text-xs">
                  {t("プレビュー", "Preview")}
                </p>
                <div className="bg-zinc-100 dark:bg-zinc-800">
                  <img
                    className="m-auto max-h-32"
                    src={imageBase64}
                    alt={t("広告画像", "Advertisement Image")}
                  />
                </div>
              </>
            )}
            <Input
              placeholder={t("画像URL", "Image URL")}
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
              {t(
                "※ 外部の画像URLを直接指定することも可能",
                "※ You can also specify an external image URL directly",
              )}
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
                {t("選択した画像を削除", "Remove Selected Image")}
              </Button>
            </div>
            <Button
              className="w-full items-center"
              onClick={onUpload}
              disabled={!imageBase64 || isUploading}
            >
              {isUploading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <p>{t("画像をアップロード", "Upload Image")}</p>
              )}
            </Button>
            <Separator />
            <p className="font-semibold text-sm">
              {t(
                "広告の配信期間（配信月）",
                "Advertisement Delivery Period (Delivery Month)",
              )}
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
              {t("広告をクリックした際の遷移先", "Link URL When Ad is Clicked")}
            </p>
            <Input
              placeholder={t("リンクURL", "Link URL")}
              value={newAdvertisement.url}
              onChange={(e) =>
                setNewAdvertisement({
                  ...newAdvertisement,
                  url: e.target.value,
                })
              }
            />
            <Separator />
            <p className="font-semibold text-sm">
              {t("センシティブかどうか", "Is this sensitive content?")}
            </p>
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
                {t("センシティブ", "Sensitive")}
              </label>
            </div>
            <Separator />
            <p className="font-semibold text-sm">
              {t(
                "表示する優先度（全体の数字で均等割りして確率を算出、高いほど確率が高くなる）",
                "Display priority (higher numbers increase probability)",
              )}
            </p>
            <Input
              placeholder={t("表示優先度", "Display Priority")}
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
              {t(
                "有効化されると表示されるようになります",
                "Enabling this will display the ad",
              )}
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
                {t("有効化", "Active")}
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
                <Loader2Icon className="m-auto size-4 animate-spin" />
              ) : isEditing ? (
                t("更新", "Update")
              ) : (
                t("広告を作成", "Create Advertisement")
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
      id
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
