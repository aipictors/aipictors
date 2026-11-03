import { Alert, AlertDescription } from "~/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { useTranslation } from "~/hooks/use-translation"
import { AddExpressionDialog } from "./add-expression-dialog"
import { useQuery, useMutation } from "@apollo/client/index"
import { useState, useMemo } from "react"
import {
  Users,
  Grid,
  List,
  Image,
  Trash2,
  MoreVertical,
  RefreshCw,
  X,
  Sparkles,
} from "lucide-react"
import type { ResultOf } from "gql.tada"
import { cn } from "~/lib/utils"
import {
  VIEWER_CHARACTERS,
  DELETE_CHARACTER,
  VIEWER_CURRENT_PASS,
} from "~/routes/($lang)._main.characters._index/queries/index"
import { CharacterExpressions } from "./character-expressions"

type Props = {
  userId?: string | null
  userToken?: string | null
}

type ViewMode = "grid" | "list"
type ViewState = "list" | "expressions"

type CharacterExpression = {
  id: string
  expressionName: string
  imageUrl?: string | null
  createdAt: string
}

type Character = {
  id: string
  nanoid: string
  name: string
  description?: string | null
  baseImageUrl?: string | null
  thumbnailUrl?: string | null
  isPublic: boolean
  createdAt: string
  expressions: CharacterExpression[]
}

/** API は全項目 nullable。この画面で扱う形にそろえる */
const toCharacter = (
  character: ResultOf<typeof VIEWER_CHARACTERS>["characters"][number],
): Character => ({
  ...character,
  nanoid: character.nanoid ?? "",
  name: character.name ?? "",
  isPublic: character.isPublic ?? false,
  createdAt: character.createdAt ?? "",
  expressions: character.expressions.map((expression) => ({
    ...expression,
    expressionName: expression.expressionName ?? "",
    createdAt: expression.createdAt ?? "",
  })),
})

export function CharacterList (props: Props) {
  const t = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const [isAddExpressionOpen, setIsAddExpressionOpen] = useState(false)
  const [viewState, setViewState] = useState<ViewState>("list")
  const [selectedCharacterData, setSelectedCharacterData] =
    useState<Character | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(
    null,
  )
  const [showCampaignBanner, setShowCampaignBanner] = useState(true)

  const { data, loading, refetch } = useQuery(VIEWER_CHARACTERS, {
    variables: {
      offset: 0,
      limit: 100,
    },
    skip: !props.userId,
  })

  const { data: viewerData } = useQuery(VIEWER_CURRENT_PASS, {
    skip: !props.userId,
  })

  const [deleteCharacter] = useMutation(DELETE_CHARACTER, {
    onCompleted: () => {
      if (refetch) refetch()
    },
    onError: (error) => {
      console.error("Delete failed:", error)
      alert("削除に失敗しました")
    },
  })

  console.log("CharacterList - data:", data)

  const characters = data?.characters || []

  const filteredCharacters = useMemo(() => {
    if (!Array.isArray(characters)) return []
    return characters.map(toCharacter)
  }, [characters])

  const handleAddExpression = (character: Character) => {
    setSelectedCharacterData(character)
    setIsAddExpressionOpen(true)
  }

  const handleAddExpressionComplete = () => {
    setIsAddExpressionOpen(false)
    setSelectedCharacterData(null)
    if (refetch) refetch()
  }

  const handleViewExpressions = (character: Character) => {
    setSelectedCharacterData(character)
    setViewState("expressions")
  }

  const handleBackToList = () => {
    setViewState("list")
    setSelectedCharacterData(null)
  }

  const handleDeleteCharacter = (character: Character) => {
    setCharacterToDelete(character)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCharacter = async () => {
    if (!characterToDelete) return

    try {
      await deleteCharacter({
        variables: {
          characterId: characterToDelete.id,
        },
      })

      setDeleteDialogOpen(false)
      setCharacterToDelete(null)

      alert(`${characterToDelete.name} を削除しました`)
    } catch (error) {
      console.error("Delete failed:", error)
      alert("削除に失敗しました")
    }
  }

  if (!props.userId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("キャラクター一覧", "Character List")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t(
              "ログインしてキャラクターを管理してください",
              "Please log in to manage characters",
            )}
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleCharacterUpdate = (updatedCharacter: Character) => {
    // キャラクター一覧を再取得
    if (refetch) {
      refetch()
    }
    // 選択中のキャラクターデータも更新
    setSelectedCharacterData(updatedCharacter)
  }

  // 表情詳細表示の場合
  if (viewState === "expressions" && selectedCharacterData) {
    return (
      <CharacterExpressions
        characterId={selectedCharacterData.id}
        characterName={selectedCharacterData.name}
        character={selectedCharacterData}
        onBack={handleBackToList}
        onCharacterUpdate={handleCharacterUpdate}
      />
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("キャラクター一覧", "Character List")}
              <Badge variant="secondary">{filteredCharacters.length}</Badge>
              {viewerData?.viewer?.currentPass && (
                <Badge variant="outline" className="text-blue-600">
                  残り
                  {Number(
                    viewerData.viewer.currentPass.remainingImageGenerations,
                  )}
                  /{Number(viewerData.viewer.currentPass.maxImageGenerations)}枚
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={loading}
                title={t("一覧を更新", "Refresh List")}
              >
                <RefreshCw
                  className={cn("h-4 w-4", loading && "animate-spin")}
                />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {t("あなたのキャラクター（非公開）", "Your Characters (Private)")}
          </p>
        </CardContent>
      </Card>

      {/* キャンペーンバナー */}
      {showCampaignBanner && (
        <Alert className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <Sparkles className="h-4 w-4 text-yellow-600" />
          <div className="flex w-full items-center justify-between">
            <AlertDescription className="flex-1 text-yellow-800">
              <strong>🎉 キャンペーン中！</strong>{" "}
              キャラクター表情生成が1回3クレジット消費で利用できます！
              <br />
              <span className="mt-1 block text-xs">
                通常5クレジット →
                キャンペーン価格3クレジット（サブスク・無料ユーザー共通）
              </span>
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCampaignBanner(false)}
              className="ml-2 h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      {/* キャラクター一覧 */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {t("読み込み中...", "Loading...")}
            </p>
          </CardContent>
        </Card>
      ) : filteredCharacters.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {t("キャラクターが見つかりません", "No characters found")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4",
          )}
        >
          {filteredCharacters.map((character: Character) => (
            <Card key={character.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{character.name}</span>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteCharacter(character)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(character.thumbnailUrl || character.baseImageUrl) && (
                  <div className="mb-4 aspect-square w-full overflow-hidden rounded-lg">
                    <img
                      src={
                        character.thumbnailUrl || character.baseImageUrl || ""
                      }
                      alt={character.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                {character.description && (
                  <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
                    {character.description}
                  </p>
                )}

                {/* 表情プレビュー */}
                {character.expressions && character.expressions.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {t("表情", "Expressions")} (
                        {character.expressions.length})
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewExpressions(character)}
                        className="h-auto p-1"
                      >
                        {t("すべて見る", "View All")}
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {character.expressions.slice(0, 3).map((expression) => (
                        <div
                          key={expression.id}
                          className="aspect-square overflow-hidden rounded-md"
                        >
                          {expression.imageUrl ? (
                            <img
                              src={expression.imageUrl}
                              alt={expression.expressionName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                      {character.expressions.length > 3 && (
                        <div className="flex aspect-square items-center justify-center rounded-md bg-muted/50">
                          <span className="font-medium text-muted-foreground text-xs">
                            +{character.expressions.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="ml-auto flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewExpressions(character)}
                    >
                      <Image className="mr-2 h-4 w-4" />
                      {t("表情一覧", "Expressions")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddExpression(character)}
                    >
                      {t("表情を追加", "Add Expression")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 表情追加ダイアログ */}
      {selectedCharacterData && isAddExpressionOpen && (
        <AddExpressionDialog
          isOpen={isAddExpressionOpen}
          onClose={() => setIsAddExpressionOpen(false)}
          character={selectedCharacterData}
          onComplete={handleAddExpressionComplete}
          userToken={props.userToken}
        />
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>キャラクターを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{characterToDelete?.name}
              」を削除します。この操作は取り消せません。
              キャラクターとすべての表情データが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCharacter}
              className="bg-red-600 hover:bg-red-700"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
