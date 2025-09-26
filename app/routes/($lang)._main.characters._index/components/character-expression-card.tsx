import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { useTranslation } from "~/hooks/use-translation"
import { useMutation } from "@apollo/client/index"
import { useState } from "react"
import { DELETE_IMAGE_GENERATION_RESULT } from "../queries"
import { toast } from "sonner"
import {
  Download,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  MoreHorizontal,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

type Props = {
  result: {
    id: string
    nanoid: string | null
    prompt: string
    status:
      | "CANCELED"
      | "DONE"
      | "ERROR"
      | "IN_PROGRESS"
      | "PENDING"
      | "RESERVED"
    imageUrl?: string | null
    thumbnailUrl?: string | null
    t2tImageUrl?: string | null
    completedAt?: number | null
  }
  viewMode: "grid" | "list"
  onRefresh: () => void
}

export function CharacterExpressionCard(props: Props) {
  const t = useTranslation()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const [deleteResult] = useMutation(deleteImageGenerationResultMutation)

  const { result, viewMode } = props

  // プロンプトから表情名を抽出
  const extractExpression = (prompt: string) => {
    const match = prompt.match(/character expression: (.+)/)
    return match ? match[1] : prompt
  }

  const expressionName = extractExpression(result.prompt)

  const getStatusIcon = () => {
    switch (result.status) {
      case "DONE":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "PENDING":
      case "IN_PROGRESS":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "ERROR":
      case "CANCELED":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (result.status) {
      case "DONE":
        return t("完了", "Completed")
      case "PENDING":
        return t("待機中", "Pending")
      case "IN_PROGRESS":
        return t("生成中", "Processing")
      case "ERROR":
        return t("失敗", "Failed")
      case "CANCELED":
        return t("キャンセル", "Canceled")
      default:
        return result.status
    }
  }

  const getStatusVariant = (): "default" | "secondary" | "destructive" => {
    switch (result.status) {
      case "DONE":
        return "default"
      case "PENDING":
      case "IN_PROGRESS":
        return "secondary"
      case "ERROR":
      case "CANCELED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const handleDownload = async () => {
    if (!result.imageUrl) return

    try {
      const response = await fetch(result.imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `character-${expressionName}-${result.nanoid}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(t("ダウンロードを開始しました", "Download started"))
    } catch (error) {
      console.error("Download error:", error)
      toast.error(t("ダウンロードに失敗しました", "Download failed"))
    }
  }

  const handleDelete = async () => {
    try {
      await deleteResult({
        variables: {
          input: {
            nanoid: result.nanoid || result.id,
          },
        },
      })
      toast.success(t("削除しました", "Deleted successfully"))
      props.onRefresh()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(t("削除に失敗しました", "Delete failed"))
    }
    setIsDeleteDialogOpen(false)
  }

  const imageUrl = result.imageUrl || result.thumbnailUrl

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* 画像 */}
            <div className="flex-shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={expressionName}
                  className="h-16 w-16 cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-80"
                  onClick={() => setIsPreviewOpen(true)}
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                  <Eye className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* 情報 */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="font-semibold">{expressionName}</h3>
                <Badge
                  variant={getStatusVariant()}
                  className="flex items-center gap-1"
                >
                  {getStatusIcon()}
                  {getStatusText()}
                </Badge>
              </div>
              {result.completedAt && (
                <p className="text-muted-foreground text-sm">
                  {t("生成日時", "Created")}:{" "}
                  {new Date(result.completedAt * 1000).toLocaleString()}
                </p>
              )}
              {result.completedAt && (
                <p className="text-muted-foreground text-sm">
                  {t("完了日時", "Completed")}:{" "}
                  {new Date(result.completedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* アクション */}
            <div className="flex items-center gap-2">
              {result.status === "DONE" && imageUrl && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {result.status === "DONE" && imageUrl && (
                    <>
                      <DropdownMenuItem onClick={() => setIsPreviewOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t("プレビュー", "Preview")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        {t("ダウンロード", "Download")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("削除", "Delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={expressionName}
                className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                onClick={() => setIsPreviewOpen(true)}
              />
              {/* オーバーレイ */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/20 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {result.status === "DONE" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              {result.status === "PENDING" ||
              result.status === "IN_PROGRESS" ? (
                <div className="text-center">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    {getStatusText()}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Eye className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    {getStatusText()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ステータスバッジ */}
          <div className="absolute top-2 right-2">
            <Badge
              variant={getStatusVariant()}
              className="flex items-center gap-1"
            >
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>
        </div>

        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <h3 className="truncate font-semibold text-sm">{expressionName}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {result.status === "DONE" && imageUrl && (
                  <>
                    <DropdownMenuItem onClick={() => setIsPreviewOpen(true)}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t("プレビュー", "Preview")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      {t("ダウンロード", "Download")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("削除", "Delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {result.completedAt && (
            <p className="mt-1 text-muted-foreground text-xs">
              {new Date(result.completedAt * 1000).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* プレビューダイアログ */}
      {isPreviewOpen && imageUrl && (
        <button
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsPreviewOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsPreviewOpen(false)}
          aria-label="Close preview"
        >
          <div className="max-h-[90vh] max-w-4xl p-4">
            <img
              src={imageUrl}
              alt={expressionName}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === "Enter" && e.stopPropagation()}
            />
          </div>
        </button>
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("表情を削除しますか？", "Delete Expression?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "この操作は元に戻せません。表情「{expression}」を完全に削除します。",
                'This action cannot be undone. This will permanently delete the expression "{expression}".',
              ).replace("{expression}", expressionName)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("キャンセル", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("削除", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const deleteImageGenerationResultMutation = DELETE_IMAGE_GENERATION_RESULT
