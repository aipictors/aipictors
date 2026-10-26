import { useNavigate } from "@remix-run/react"
import {
  ClockIcon,
  FolderIcon,
  LayoutGridIcon,
  ListIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  StarIcon,
  UploadCloudIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { LoginDialogButton } from "~/components/login-dialog-button"
import {
  canUseLibraryItem,
  libraryItemHref,
  ModelLibraryGridItem,
  type ModelLibraryItemActions,
  ModelLibraryListHeader,
  ModelLibraryListItem,
  ModelLibrarySkeleton,
} from "~/components/model-library/model-library-items"
import {
  defaultModelLibraryFilters,
  type ModelLibraryFilters,
  type ModelLibraryItem,
  type ModelLibrarySection,
  type ModelLibrarySort,
  type OfficialCheckpoint,
  type OfficialLora,
} from "~/components/model-library/model-library-types"
import { ModelLibraryUploadDialog } from "~/components/model-library/model-library-upload-dialog"
import { ModelLibraryUploadPanel } from "~/components/model-library/model-library-upload-panel"
import { ModelLibraryUsageMeter } from "~/components/model-library/model-library-usage-meter"
import {
  filterLibraryItems,
  fromOfficialCheckpoint,
  fromOfficialLora,
  fromUserModel,
  pushRecentEntry,
  readRecentEntries,
  useModelLibraryViewMode,
} from "~/components/model-library/model-library-utils"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  useMyUserModels,
  useUserModelsInfinite,
} from "~/components/user-models/use-user-models"
import { UserModelDeleteDialog } from "~/components/user-models/user-model-delete-dialog"
import { UserModelEditDialog } from "~/components/user-models/user-model-edit-dialog"
import { AuthContext } from "~/contexts/auth-context"
import { USER_MODEL_BASE_MODELS } from "~/lib/user-models/constants"
import type { UserModel, UserModelKind } from "~/lib/user-models/types"
import { cn } from "~/lib/utils"

export type ModelLibraryProps = {
  variant: "dialog" | "page"
  initialSection?: ModelLibrarySection
  initialKind?: UserModelKind | null
  officialCheckpoints: OfficialCheckpoint[]
  officialLoras: OfficialLora[]
  favoriteOfficialIds?: number[]
  /**
   * 生成画面で最近使った公式モデル
   */
  recentOfficialCheckpointIds?: string[]
  onToggleFavorite?(modelId: string, isFavorite: boolean): void
  /**
   * 生成画面で選択中のモデル（ModelLibraryItem.key）
   */
  selectedKeys?: string[]
  /**
   * 生成に使う。指定しないとクリックで公開ページを開く
   */
  onUse?(item: ModelLibraryItem): void
  /**
   * 開いたらすぐにファイル選択を出す
   */
  startWithUpload?: boolean
  onSectionChange?(section: ModelLibrarySection): void
  /**
   * 上部に出す補足（推奨プロンプトの設定など）
   */
  toolbarExtra?(state: {
    section: ModelLibrarySection
    kind: UserModelKind | null
  }): React.ReactNode
  /**
   * 下部に出す内容（LoRA の選択数と完了ボタンなど）
   */
  footer?: React.ReactNode
}

const sections: {
  value: ModelLibrarySection
  label: string
  description: string
  icon: typeof FolderIcon
}[] = [
  {
    value: "official",
    label: "公式モデル",
    description: "Aipictors で用意しているモデルです",
    icon: ShieldCheckIcon,
  },
  {
    value: "community",
    label: "みんなのモデル",
    description: "ユーザーが公開している LoRA・チェックポイントです",
    icon: UsersIcon,
  },
  {
    value: "mine",
    label: "マイモデル",
    description: "自分がアップロードしたモデルです",
    icon: FolderIcon,
  },
  {
    value: "favorites",
    label: "お気に入り",
    description: "お気に入りに追加した公式モデルです",
    icon: StarIcon,
  },
  {
    value: "recent",
    label: "最近使った",
    description: "生成に使ったモデルが新しい順に並びます",
    icon: ClockIcon,
  },
]

const sortOptions: { value: ModelLibrarySort; label: string }[] = [
  { value: "popular", label: "人気順" },
  { value: "new", label: "新着順" },
  { value: "name", label: "名前順" },
]

const baseOptions = USER_MODEL_BASE_MODELS.filter(
  (base) => base.value !== "OTHER",
).sort((a, b) => {
  const order = ["SD1.5", "SDXL", "PONY", "ILLUSTRIOUS", "NOOBAI"]
  return order.indexOf(a.value) - order.indexOf(b.value)
})

function Chip(props: {
  isActive: boolean
  onClick(): void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-pressed={props.isActive}
      className={cn(
        "h-7 shrink-0 rounded-full border px-3 text-xs transition-colors",
        props.isActive
          ? "border-transparent bg-foreground font-medium text-background"
          : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {props.children}
    </button>
  )
}

function EmptyState(props: {
  icon: typeof FolderIcon
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  const Icon = props.icon
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        props.className,
      )}
    >
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <p className="font-semibold">{props.title}</p>
      {props.description && (
        <p className="mt-1.5 max-w-sm text-muted-foreground text-sm leading-relaxed">
          {props.description}
        </p>
      )}
      {props.children && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {props.children}
        </div>
      )}
    </div>
  )
}

const isSafetensors = (file: File) =>
  file.name.toLowerCase().endsWith(".safetensors")

/**
 * モデルライブラリ（公式・みんなのモデル・自分のモデルをまとめて探す・管理する）
 * 生成画面のダイアログと /models/library の両方で使う
 */
export function ModelLibrary(props: ModelLibraryProps) {
  const authContext = useContext(AuthContext)
  const isDialog = props.variant === "dialog"
  const navigate = useNavigate()

  const [section, setSection] = useState<ModelLibrarySection>(
    props.initialSection ?? "official",
  )
  const [filters, setFilters] = useState<ModelLibraryFilters>({
    ...defaultModelLibraryFilters,
    kind: props.initialKind ?? null,
  })
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useModelLibraryViewMode()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [editing, setEditing] = useState<UserModel | null>(null)
  const [deleting, setDeleting] = useState<UserModel | null>(null)
  const [recentVersion, setRecentVersion] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragDepthRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const changeSection = (next: ModelLibrarySection) => {
    setSection(next)
    props.onSectionChange?.(next)
    scrollRef.current?.scrollTo({ top: 0 })
  }

  const updateFilters = (patch: Partial<ModelLibraryFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
  }

  // 入力が止まってから検索する
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ q: searchText.trim() })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText])

  const mine = useMyUserModels()
  const myModels = mine.data?.models ?? []
  const isLimitFull =
    mine.data !== undefined &&
    mine.data.limit > 0 &&
    mine.data.used >= mine.data.limit

  const community = useUserModelsInfinite(
    {
      kind: filters.kind,
      q: filters.q,
      baseModel: filters.baseModel,
      sort: filters.sort === "new" ? "new" : "popular",
      ratings: filters.includeR18 ? ["G", "R15", "R18", "R18G"] : ["G", "R15"],
    },
    { enabled: section === "community" },
  )

  const favoriteIds = props.favoriteOfficialIds ?? []
  const viewerUserId = authContext.isLoggedIn ? authContext.userId : null

  const officialItems = useMemo(
    () => [
      ...props.officialCheckpoints.map((model) =>
        fromOfficialCheckpoint(model, favoriteIds),
      ),
      ...props.officialLoras.map(fromOfficialLora),
    ],
    [props.officialCheckpoints, props.officialLoras, favoriteIds],
  )

  const officialByKey = useMemo(
    () => new Map(officialItems.map((item) => [item.key, item])),
    [officialItems],
  )

  const recentItems = useMemo(() => {
    const stored = readRecentEntries()
    const keys = new Set(stored.map((entry) => entry.key))
    const fromHost = (props.recentOfficialCheckpointIds ?? [])
      .map((id) => officialByKey.get(`official-checkpoint:${id}`))
      .filter(
        (item): item is ModelLibraryItem =>
          item !== undefined && !keys.has(item.key),
      )
    const myByKey = new Map(
      myModels.map((model) => [
        `user:${model.id}`,
        fromUserModel(model, viewerUserId),
      ]),
    )
    return [
      ...stored.map(
        (entry) =>
          officialByKey.get(entry.key) ?? myByKey.get(entry.key) ?? entry,
      ),
      ...fromHost,
    ]
  }, [
    officialByKey,
    props.recentOfficialCheckpointIds,
    recentVersion,
    myModels,
    viewerUserId,
  ])

  const items: ModelLibraryItem[] = (() => {
    if (section === "official") {
      return filterLibraryItems(officialItems, filters)
    }
    if (section === "favorites") {
      return filterLibraryItems(
        officialItems.filter((item) => item.isFavorite),
        filters,
      )
    }
    if (section === "recent") {
      return filterLibraryItems(recentItems, filters, { keepOrder: true })
    }
    if (section === "mine") {
      return filterLibraryItems(
        myModels.map((model) => fromUserModel(model, viewerUserId)),
        filters,
      )
    }
    const models = (community.data?.pages ?? []).flatMap((page) => page.models)
    const communityItems = models.map((model) =>
      fromUserModel(model, viewerUserId),
    )
    if (filters.sort === "name") {
      return [...communityItems].sort((a, b) =>
        a.name.localeCompare(b.name, "ja"),
      )
    }
    return communityItems
  })()

  const isLoading =
    (section === "community" && community.isLoading) ||
    (section === "mine" && authContext.isLoggedIn && mine.isLoading)

  // 無限スクロール（みんなのモデル）
  useEffect(() => {
    if (section !== "community") return
    const target = sentinelRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          community.hasNextPage &&
          !community.isFetchingNextPage
        ) {
          community.fetchNextPage()
        }
      },
      { root: scrollRef.current, rootMargin: "400px" },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [
    section,
    community.hasNextPage,
    community.isFetchingNextPage,
    items.length,
  ])

  const selectedKeys = props.selectedKeys ?? []

  const applyItem = (item: ModelLibraryItem) => {
    if (!props.onUse) return
    if (!canUseLibraryItem(item)) {
      toast("このモデルはまだ生成に使えません")
      return
    }
    const isRemoving = item.kind === "LORA" && selectedKeys.includes(item.key)
    if (!isRemoving) {
      pushRecentEntry(item)
      setRecentVersion((value) => value + 1)
    }
    props.onUse(item)
  }

  const actions: ModelLibraryItemActions = {
    onUse: props.onUse ? applyItem : undefined,
    onEdit: (item) => {
      if (item.userModel) setEditing(item.userModel)
    },
    onDelete: (item) => {
      if (item.userModel) setDeleting(item.userModel)
    },
    onToggleFavorite: props.onToggleFavorite
      ? (item) => {
          if (item.officialCheckpoint) {
            props.onToggleFavorite?.(
              item.officialCheckpoint.id,
              !item.isFavorite,
            )
          }
        }
      : undefined,
    isSelected: (item) => selectedKeys.includes(item.key),
    openInNewTab: isDialog,
  }

  const onActivate = (item: ModelLibraryItem) => {
    // ダイアログではクリックで生成に使う。ページでは公開ページを開く
    if (isDialog && props.onUse && canUseLibraryItem(item)) {
      applyItem(item)
      return
    }
    if (item.isOwn && item.userModel && !canUseLibraryItem(item)) {
      setEditing(item.userModel)
      return
    }
    const href = libraryItemHref(item)
    if (!href) {
      if (props.onUse && canUseLibraryItem(item)) applyItem(item)
      return
    }
    if (isDialog) {
      window.open(href, "_blank")
    } else {
      navigate(href)
    }
  }

  /**
   * アップロードを始める前の確認（ログイン・上限）
   */
  const canStartUpload = (): boolean => {
    if (!authContext.isLoggedIn) {
      toast("アップロードするにはログインしてください")
      changeSection("mine")
      return false
    }
    if (isLimitFull) {
      toast("登録できるモデル数の上限に達しています")
      changeSection("mine")
      return false
    }
    return true
  }

  const addFiles = (files: File[]) => {
    if (files.length === 0) return
    const accepted = files.filter(isSafetensors)
    if (accepted.length < files.length) {
      toast(
        ".safetensors 形式のファイルだけアップロードできます（.ckpt / .pt は安全のため使えません）",
      )
    }
    if (accepted.length === 0) return
    if (!canStartUpload()) return
    setPendingFiles((current) => [...current, ...accepted])
  }

  const openFilePicker = () => {
    if (!canStartUpload()) return
    fileInputRef.current?.click()
  }

  useEffect(() => {
    if (!props.startWithUpload) return
    if (authContext.isLoading) return
    if (authContext.isLoggedIn && mine.isLoading) return
    if (canStartUpload()) {
      fileInputRef.current?.click()
    }
  }, [props.startWithUpload, authContext.isLoading, mine.isLoading])

  const onDragEnter = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes("Files")) return
    event.preventDefault()
    dragDepthRef.current += 1
    setIsDragging(true)
  }

  const onDragLeave = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes("Files")) return
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) setIsDragging(false)
  }

  const onDragOver = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes("Files")) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  const onDrop = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes("Files")) return
    event.preventDefault()
    dragDepthRef.current = 0
    setIsDragging(false)
    addFiles([...event.dataTransfer.files])
  }

  const currentSection =
    sections.find((item) => item.value === section) ?? sections[0]
  const hasFilters =
    filters.q !== "" || filters.kind !== null || filters.baseModel !== null
  const linkTarget = isDialog ? "_blank" : undefined

  const sectionCount = (value: ModelLibrarySection): string | null => {
    if (value === "official") return String(officialItems.length)
    if (value === "mine" && mine.data) return String(mine.data.used)
    if (value === "favorites")
      return favoriteIds.length > 0 ? String(favoriteIds.length) : null
    return null
  }

  const uploadButton = (
    <Button
      onClick={openFilePicker}
      className="h-9 shrink-0 gap-1.5 rounded-full px-4"
    >
      <PlusIcon className="size-4" />
      <span>アップロード</span>
    </Button>
  )

  const renderContent = () => {
    if (section === "mine" && !authContext.isLoggedIn) {
      return (
        <EmptyState
          icon={FolderIcon}
          title="ログインすると自分のモデルを管理できます"
          description="LoRA やチェックポイントをアップロードして、Aipictors の生成機で使えるようになります。"
        >
          <LoginDialogButton label="ログイン" />
        </EmptyState>
      )
    }

    if (isLoading) {
      return <ModelLibrarySkeleton viewMode={viewMode} />
    }

    if (section === "community" && community.isError) {
      return (
        <EmptyState
          icon={UsersIcon}
          title="読み込めませんでした"
          description="通信状態を確認して、もう一度お試しください。"
        >
          <Button variant="outline" onClick={() => community.refetch()}>
            再読み込み
          </Button>
        </EmptyState>
      )
    }

    if (items.length === 0) {
      if (hasFilters) {
        return (
          <EmptyState
            icon={SearchIcon}
            title="条件に合うモデルはありません"
            description="キーワードや絞り込みを変えてみてください。"
          >
            <Button
              variant="outline"
              onClick={() => {
                setSearchText("")
                updateFilters({ q: "", kind: null, baseModel: null })
              }}
            >
              条件をクリア
            </Button>
          </EmptyState>
        )
      }
      if (section === "mine") {
        return (
          <button
            type="button"
            onClick={openFilePicker}
            className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UploadCloudIcon className="size-7" />
            </span>
            <span className="font-semibold">まだモデルがありません</span>
            <span className="mt-1.5 max-w-sm text-muted-foreground text-sm leading-relaxed">
              .safetensors
              ファイルをここにドラッグするか、クリックして選んでください。種類やベースモデルはファイルから自動で入ります。
            </span>
          </button>
        )
      }
      if (section === "favorites") {
        return (
          <EmptyState
            icon={StarIcon}
            title="お気に入りはまだありません"
            description="公式モデルの「…」メニューからお気に入りに追加すると、ここからすぐ選べます。"
          >
            <Button variant="outline" onClick={() => changeSection("official")}>
              公式モデルを見る
            </Button>
          </EmptyState>
        )
      }
      if (section === "recent") {
        return (
          <EmptyState
            icon={ClockIcon}
            title="最近使ったモデルはありません"
            description="生成に使ったモデルがここに並びます。"
          >
            <Button variant="outline" onClick={() => changeSection("official")}>
              公式モデルを見る
            </Button>
          </EmptyState>
        )
      }
      return (
        <EmptyState
          icon={UsersIcon}
          title="まだモデルがありません"
          description="最初のモデルをアップロードしてみませんか。"
        >
          <Button onClick={openFilePicker}>
            <PlusIcon className="mr-1 size-4" />
            アップロード
          </Button>
        </EmptyState>
      )
    }

    return (
      <>
        {viewMode === "grid" ? (
          <div className="grid @3xl:grid-cols-4 @5xl:grid-cols-5 @7xl:grid-cols-6 @lg:grid-cols-3 grid-cols-2 gap-3">
            {items.map((item) => (
              <ModelLibraryGridItem
                key={item.key}
                item={item}
                actions={actions}
                onActivate={onActivate}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <ModelLibraryListHeader />
            {items.map((item) => (
              <ModelLibraryListItem
                key={item.key}
                item={item}
                actions={actions}
                onActivate={onActivate}
              />
            ))}
          </div>
        )}
        {section === "community" && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            {community.isFetchingNextPage && (
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            )}
          </div>
        )}
      </>
    )
  }

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col bg-background md:flex-row",
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".safetensors"
        multiple
        className="hidden"
        onChange={(event) => {
          addFiles([...(event.target.files ?? [])])
          event.target.value = ""
        }}
      />

      {/* サイドバー（スマホでは上部の切り替え） */}
      <nav
        aria-label="モデルライブラリ"
        className={cn(
          "flex shrink-0 flex-col md:w-56 md:border-r",
          "md:bg-muted/30",
        )}
      >
        <div className="hidden px-5 pt-5 pb-3 md:block">
          <p className="font-bold text-base">モデルライブラリ</p>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pt-3 pb-2 md:flex-col md:gap-0.5 md:overflow-visible md:pt-0">
          {sections.map((item) => {
            const Icon = item.icon
            const isActive = section === item.value
            const count = sectionCount(item.value)
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => changeSection(item.value)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm transition-colors md:gap-3 md:py-2",
                  isActive
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="hidden size-4 md:block" />
                <span className="flex-1 text-left">{item.label}</span>
                {count !== null && (
                  <span className="hidden text-xs tabular-nums opacity-70 md:inline">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {authContext.isLoggedIn && mine.data && (
          <div className="mt-auto hidden border-t px-5 py-4 md:block">
            <p className="mb-2 font-medium text-xs">登録数</p>
            <ModelLibraryUsageMeter
              compact
              used={mine.data.used}
              limit={mine.data.limit}
              planType={mine.data.planType}
              linkTarget={linkTarget}
            />
          </div>
        )}
      </nav>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* 上部の検索・操作 */}
        <div
          className={cn(
            "space-y-3 border-b px-3 pt-1 pb-3 md:px-5 md:pt-4",
            isDialog && "md:pr-14",
          )}
        >
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-4 text-muted-foreground" />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="モデルを検索"
                className="h-10 w-full rounded-full border border-transparent bg-muted/70 pr-9 pl-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="検索をクリア"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
            <div className="hidden sm:block">{uploadButton}</div>
            <Button
              size="icon"
              onClick={openFilePicker}
              className="size-10 shrink-0 rounded-full sm:hidden"
              aria-label="アップロード"
            >
              <PlusIcon className="size-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="-mx-3 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-3 md:mx-0 md:px-0">
              <Chip
                isActive={filters.kind === "LORA"}
                onClick={() =>
                  updateFilters({
                    kind: filters.kind === "LORA" ? null : "LORA",
                  })
                }
              >
                LoRA
              </Chip>
              <Chip
                isActive={filters.kind === "CHECKPOINT"}
                onClick={() =>
                  updateFilters({
                    kind: filters.kind === "CHECKPOINT" ? null : "CHECKPOINT",
                  })
                }
              >
                チェックポイント
              </Chip>
              <span className="mx-1 h-4 w-px shrink-0 bg-border" />
              {baseOptions.map((base) => (
                <Chip
                  key={base.value}
                  isActive={filters.baseModel === base.value}
                  onClick={() =>
                    updateFilters({
                      baseModel:
                        filters.baseModel === base.value ? null : base.value,
                    })
                  }
                >
                  {base.label}
                </Chip>
              ))}
              {section === "community" && (
                <>
                  <span className="mx-1 h-4 w-px shrink-0 bg-border" />
                  <Chip
                    isActive={filters.includeR18}
                    onClick={() =>
                      updateFilters({ includeR18: !filters.includeR18 })
                    }
                  >
                    R-18 も表示
                  </Chip>
                </>
              )}
            </div>
          </div>
          {props.toolbarExtra?.({ section, kind: filters.kind })}
        </div>

        <div
          ref={scrollRef}
          className={cn(
            "@container min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-5",
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-semibold text-base">
                {currentSection.label}
              </h2>
              <p className="truncate text-muted-foreground text-xs">
                {currentSection.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {section !== "recent" && (
                <Select
                  value={filters.sort}
                  onValueChange={(value) =>
                    updateFilters({ sort: value as ModelLibrarySort })
                  }
                >
                  <SelectTrigger
                    className="h-8 w-auto shrink-0 gap-1 rounded-full border-none bg-transparent px-2.5 text-xs hover:bg-muted"
                    aria-label="並び順"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <fieldset
                className="flex shrink-0 items-center rounded-full border p-0.5"
                aria-label="表示方法"
              >
                {(
                  [
                    { value: "grid", label: "グリッド", icon: LayoutGridIcon },
                    { value: "list", label: "リスト", icon: ListIcon },
                  ] as const
                ).map((option) => {
                  const Icon = option.icon
                  const isActive = viewMode === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isActive}
                      aria-label={`${option.label}で表示`}
                      title={`${option.label}で表示`}
                      onClick={() => setViewMode(option.value)}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full transition-colors",
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="size-3.5" />
                    </button>
                  )
                })}
              </fieldset>
            </div>
          </div>
          {section === "mine" && authContext.isLoggedIn && mine.data && (
            <ModelLibraryUsageMeter
              used={mine.data.used}
              limit={mine.data.limit}
              planType={mine.data.planType}
              linkTarget={linkTarget}
              className="mb-5 max-w-md rounded-xl border bg-muted/30 px-4 py-3"
            />
          )}
          {renderContent()}
          {section === "community" && !props.onUse && items.length > 0 && (
            <p className="pt-2 pb-6 text-center text-muted-foreground text-xs">
              気になるモデルは「…」から公開ページを開くと、サンプル画像や使い方を確認できます
            </p>
          )}
        </div>

        {props.footer}
      </div>

      {isDragging && (
        <div className="pointer-events-none absolute inset-2 z-40 flex flex-col items-center justify-center rounded-2xl border-2 border-primary border-dashed bg-primary/10 backdrop-blur-[2px]">
          <UploadCloudIcon className="mb-3 size-10 text-primary" />
          <p className="font-semibold text-primary">ドロップしてアップロード</p>
          <p className="mt-1 text-muted-foreground text-sm">
            .safetensors（LoRA・チェックポイント）
          </p>
        </div>
      )}

      <ModelLibraryUploadPanel
        isInDialog={isDialog}
        className={cn("absolute right-4 bottom-4", props.footer && "bottom-20")}
      />

      <ModelLibraryUploadDialog
        file={pendingFiles[0] ?? null}
        remainingCount={Math.max(0, pendingFiles.length - 1)}
        onDone={() => setPendingFiles((current) => current.slice(1))}
        onUploaded={() => mine.refetch()}
      />

      {editing && (
        <UserModelEditDialog
          key={editing.id}
          model={editing}
          isOpen={editing !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setEditing(null)
          }}
          onUpdated={() => mine.refetch()}
        />
      )}
      {deleting && (
        <UserModelDeleteDialog
          model={deleting}
          isOpen={deleting !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setDeleting(null)
          }}
          onDeleted={() => mine.refetch()}
        />
      )}
    </div>
  )
}
