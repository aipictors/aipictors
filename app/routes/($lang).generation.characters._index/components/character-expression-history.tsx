import { useState } from "react"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { History, Download, RefreshCw } from "lucide-react"
import { useCharacterExpressionContext } from "../contexts/character-expression-context"
import { useToast } from "~/components/ui/use-toast"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"

export function CharacterExpressionHistory() {
  const { user } = useCharacterExpressionContext()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data, loading, refetch } = useQuery(characterGenerationHistoryQuery, {
    variables: {
      limit: 20,
      offset: 0,
    },
    skip: !user,
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      toast({
        title: "更新完了",
        description: "履歴を更新しました。",
      })
    } catch (_error) {
      toast({
        title: "更新エラー",
        description: "履歴の更新に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = normalizeGenerativeFileUrl(imageUrl)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">ログインが必要です</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            生成履歴
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {["a", "b", "c"].map((key) => (
            <div key={key} className="flex space-x-4">
              <Skeleton className="h-20 w-20 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const results = data?.viewer?.imageGenerationResults ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            生成履歴
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            生成履歴がありません
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-start space-x-4 rounded-lg border p-4"
              >
                {result.imageUrl && (
                  <img
                    src={normalizeGenerativeFileUrl(
                      result.thumbnailUrl || result.imageUrl,
                    )}
                    data-generative-raw={result.thumbnailUrl || result.imageUrl}
                    onError={(event) => {
                      const img = event.currentTarget
                      const raw = img.dataset.generativeRaw
                      if (!raw) return
                      if (img.dataset.generativeFallback === "true") {
                        return
                      }
                      img.dataset.generativeFallback = "true"
                      img.src = raw
                    }}
                    alt="Generated expression"
                    className="h-20 w-20 rounded object-cover"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {result.prompt?.split(",")[0] || "表情生成"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {result.completedAt &&
                          toDateTimeText(result.completedAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        result.status === "DONE"
                          ? "default"
                          : result.status === "IN_PROGRESS"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {result.status === "DONE"
                        ? "完了"
                        : result.status === "IN_PROGRESS"
                          ? "生成中"
                          : "エラー"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {result.imageUrl && result.status === "DONE" && (
                      <Button
                        onClick={() => {
                          if (!result.imageUrl) return
                          handleDownload(
                            result.imageUrl,
                            `character_expression_${result.id}.png`,
                          )
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        ダウンロード
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const characterGenerationHistoryQuery = graphql(`
  query CharacterGenerationHistory($limit: Int!, $offset: Int!) {
    viewer {
      imageGenerationResults(limit: $limit, offset: $offset) {
        id
        prompt
        status
        imageUrl
        thumbnailUrl
        completedAt
      }
    }
  }
`)
