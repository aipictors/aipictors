import { Link } from "@remix-run/react"
import { useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2Icon,
  FileBoxIcon,
  Loader2Icon,
  PauseIcon,
  PlayIcon,
  ShieldCheckIcon,
  UploadCloudIcon,
  WandSparklesIcon,
  XIcon,
} from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import {
  useMyUserModels,
  userModelsQueryKeys,
} from "~/components/user-models/use-user-models"
import { UserModelLimitCard } from "~/components/user-models/user-model-limit-card"
import { UserModelMetadataFields } from "~/components/user-models/user-model-metadata-fields"
import { AuthContext } from "~/contexts/auth-context"
import {
  abortUserModelUpload,
  completeUserModelUpload,
  getUserModelsAuthHeaders,
  startUserModelUpload,
  UserModelsApiError,
  uploadUserModelPart,
} from "~/lib/user-models/client"
import {
  kindLabel,
  USER_MODEL_KINDS,
  USER_MODEL_MAX_BYTES,
  USER_MODEL_PART_SIZE,
} from "~/lib/user-models/constants"
import { formatBytes, formatDuration } from "~/lib/user-models/generation"
import {
  readResumeCache,
  writeResumeCache,
} from "~/lib/user-models/resume-cache"
import type {
  UploadedPart,
  UserModel,
  UserModelEditableFields,
  UserModelKind,
} from "~/lib/user-models/types"
import {
  computeFileSha256,
  MultipartUploader,
  type MultipartUploadProgress,
  readSafetensorsInfo,
} from "~/lib/user-models/upload-engine"
import { cn } from "~/lib/utils"

type Phase =
  | { type: "idle" }
  | { type: "uploading"; progress: MultipartUploadProgress | null }
  | {
      type: "paused"
      progress: MultipartUploadProgress | null
      message?: string
    }
  | { type: "completing" }
  | {
      type: "done"
      model: UserModel | null
      modelId: string
      deduplicated: boolean
    }

type HashState =
  | { type: "none" }
  | { type: "hashing"; hashedBytes: number }
  | { type: "done"; sha256: string }
  | { type: "error"; message: string }

const emptyFields: UserModelEditableFields = {
  name: "",
  description: "",
  triggerWords: "",
  recommendedWeight: 0.8,
  baseModel: "SDXL",
  rating: "G",
  tags: [],
  thumbnailUrl: null,
  sampleImageUrls: [],
}

function StepTitle(props: {
  step: number
  title: string
  description?: string
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground font-bold text-background text-sm">
        {props.step}
      </span>
      <div>
        <h2 className="font-semibold leading-7">{props.title}</h2>
        {props.description && (
          <p className="text-muted-foreground text-sm">{props.description}</p>
        )}
      </div>
    </div>
  )
}

/**
 * モデルのアップロード
 */
export function UserModelUploadForm() {
  const authContext = useContext(AuthContext)
  const queryClient = useQueryClient()
  const mine = useMyUserModels()

  const [kind, setKind] = useState<UserModelKind>("LORA")
  const [file, setFile] = useState<File | null>(null)
  const [fields, setFields] = useState<UserModelEditableFields>(emptyFields)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [hash, setHash] = useState<HashState>({ type: "none" })
  const [phase, setPhase] = useState<Phase>({ type: "idle" })
  const [isDragging, setIsDragging] = useState(false)
  const [limitError, setLimitError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const hashAbortRef = useRef<AbortController | null>(null)
  const uploaderRef = useRef<MultipartUploader | null>(null)
  const sessionRef = useRef<{ modelId: string; sha256: string } | null>(null)

  const isBusy = phase.type === "uploading" || phase.type === "completing"

  // アップロード中にページを離れようとしたら確認する
  useEffect(() => {
    if (!isBusy) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [isBusy])

  useEffect(() => {
    return () => {
      hashAbortRef.current?.abort()
      uploaderRef.current?.pause()
    }
  }, [])

  const maxBytes = USER_MODEL_MAX_BYTES[kind]
  const isTooLarge = file !== null && file.size > maxBytes

  const onSelectFile = async (selected: File | null) => {
    if (!selected || isBusy) return
    if (!selected.name.toLowerCase().endsWith(".safetensors")) {
      toast(
        ".safetensors 形式のファイルを選択してください（.ckpt / .pt は安全のため使えません）",
      )
      return
    }

    hashAbortRef.current?.abort()
    uploaderRef.current?.pause()
    uploaderRef.current = null
    sessionRef.current = null
    setPhase({ type: "idle" })
    setFile(selected)

    const info = await readSafetensorsInfo(selected)
    if (info === null) {
      toast(
        "safetensors として読み込めませんでした。ファイルが壊れていないか確認してください",
      )
      setFile(null)
      return
    }

    const nextKind = info.kind ?? kind
    if (info.kind && info.kind !== kind) {
      toast(`ファイルの中身から「${kindLabel(info.kind)}」と判定しました`)
    }
    setKind(nextKind)
    setFields((current) => ({
      ...current,
      name:
        current.name ||
        (info.title ?? selected.name.replace(/\.safetensors$/i, "")).slice(
          0,
          80,
        ),
      baseModel: info.baseModel ?? current.baseModel,
      triggerWords:
        current.triggerWords ||
        (nextKind === "LORA" ? info.triggerWords.join(", ") : ""),
    }))

    if (selected.size > USER_MODEL_MAX_BYTES[nextKind]) {
      setHash({ type: "none" })
      return
    }

    // フォーム入力中に裏でハッシュを計算しておく
    const controller = new AbortController()
    hashAbortRef.current = controller
    setHash({ type: "hashing", hashedBytes: 0 })
    let lastUpdate = 0
    try {
      const sha256 = await computeFileSha256(selected, {
        signal: controller.signal,
        onProgress: (hashedBytes) => {
          const now = Date.now()
          if (now - lastUpdate > 100 || hashedBytes === selected.size) {
            lastUpdate = now
            setHash({ type: "hashing", hashedBytes })
          }
        },
      })
      if (!controller.signal.aborted) {
        setHash({ type: "done", sha256 })
      }
    } catch (error) {
      if (controller.signal.aborted) return
      setHash({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "ファイルを読み込めませんでした",
      })
    }
  }

  const clearFile = () => {
    if (isBusy) return
    hashAbortRef.current?.abort()
    setFile(null)
    setHash({ type: "none" })
    setPhase({ type: "idle" })
    uploaderRef.current = null
    sessionRef.current = null
  }

  const runUploader = async (
    uploader: MultipartUploader,
    modelId: string,
    sha256: string,
  ) => {
    setPhase({ type: "uploading", progress: uploader.progress })
    try {
      const parts = await uploader.start()
      writeResumeCache(sha256, { modelId, parts })
      setPhase({ type: "completing" })
      const model = await completeUserModelUpload(modelId, parts)
      writeResumeCache(sha256, null)
      uploaderRef.current = null
      sessionRef.current = null
      queryClient.invalidateQueries({ queryKey: userModelsQueryKeys.all })
      setPhase({ type: "done", model, modelId, deduplicated: false })
    } catch (error) {
      writeResumeCache(sha256, { modelId, parts: uploader.uploadedParts })
      if (error instanceof DOMException && error.name === "AbortError") {
        setPhase({ type: "paused", progress: uploader.progress })
        return
      }
      setPhase({
        type: "paused",
        progress: uploader.progress,
        message:
          error instanceof Error
            ? `${error.message}。「再開」で続きから送信できます`
            : "送信に失敗しました",
      })
    }
  }

  const onSubmit = async () => {
    if (!file || hash.type !== "done") return
    if (fields.name.trim() === "") {
      toast("名前を入力してください")
      return
    }
    if (isTooLarge) return
    setLimitError(null)

    const sha256 = hash.sha256
    setPhase({ type: "uploading", progress: null })

    try {
      const started = await startUserModelUpload({
        ...fields,
        name: fields.name.trim(),
        kind,
        filename: file.name,
        sizeBytes: file.size,
        sha256,
      })

      if (started.deduplicated) {
        queryClient.invalidateQueries({ queryKey: userModelsQueryKeys.all })
        setPhase({
          type: "done",
          model: null,
          modelId: started.modelId,
          deduplicated: true,
        })
        return
      }

      const cached = readResumeCache(sha256)
      const uploadedParts = new Map<number, UploadedPart>()
      if (cached?.modelId === started.modelId) {
        for (const part of cached.parts)
          uploadedParts.set(part.partNumber, part)
      }
      for (const part of started.uploadedParts ?? []) {
        uploadedParts.set(part.partNumber, part)
      }

      const partSize =
        started.partSize > 0 ? started.partSize : USER_MODEL_PART_SIZE
      sessionRef.current = { modelId: started.modelId, sha256 }

      let lastRender = 0
      const uploader = new MultipartUploader({
        file,
        partSize,
        concurrency: 3,
        uploadedParts: [...uploadedParts.values()],
        sendPart: async ({ partNumber, blob, signal, onProgress }) => {
          const headers = await getUserModelsAuthHeaders(true)
          return uploadUserModelPart({
            modelId: started.modelId,
            partNumber,
            blob,
            authorization: headers.authorization,
            onProgress,
            signal,
          })
        },
        onProgress: (progress) => {
          const now = Date.now()
          if (now - lastRender < 200) return
          lastRender = now
          setPhase((current) =>
            current.type === "uploading"
              ? { type: "uploading", progress }
              : current,
          )
        },
      })
      uploaderRef.current = uploader
      await runUploader(uploader, started.modelId, sha256)
    } catch (error) {
      setPhase({ type: "idle" })
      if (error instanceof UserModelsApiError && error.isLimitExceeded) {
        setLimitError(error.message)
        mine.refetch()
        return
      }
      toast(
        error instanceof Error
          ? error.message
          : "アップロードを開始できませんでした",
      )
    }
  }

  const onPause = () => {
    uploaderRef.current?.pause()
  }

  const onResume = () => {
    const uploader = uploaderRef.current
    const session = sessionRef.current
    if (!uploader || !session) return
    runUploader(uploader, session.modelId, session.sha256)
  }

  const onCancel = async () => {
    const session = sessionRef.current
    uploaderRef.current?.pause()
    uploaderRef.current = null
    sessionRef.current = null
    setPhase({ type: "idle" })
    if (session) {
      writeResumeCache(session.sha256, null)
      try {
        await abortUserModelUpload(session.modelId)
        toast("アップロードを中止しました")
      } catch {
        // 破棄に失敗しても API 側の期限切れで消える
      }
    }
  }

  if (authContext.isNotLoggedIn) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border p-8 text-center">
        <UploadCloudIcon className="size-10 text-muted-foreground" />
        <p className="font-semibold">
          モデルをアップロードするにはログインが必要です
        </p>
        <Button asChild className="rounded-full">
          <Link to="/login">ログイン</Link>
        </Button>
      </div>
    )
  }

  if (phase.type === "done") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border p-8 text-center">
        <CheckCircle2Icon className="size-14 text-emerald-500" />
        <div className="space-y-1">
          <p className="font-bold text-xl">アップロードが完了しました</p>
          <p className="text-muted-foreground text-sm">
            {phase.deduplicated
              ? "同じファイルがすでに保存されていたため、転送せずに登録しました。"
              : "みんなのモデルに公開されました。生成画面からすぐに使えます。"}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild className="rounded-full">
            <Link to={`/generation?userModel=${phase.modelId}`}>
              <WandSparklesIcon className="mr-1.5 size-4" />
              このモデルで生成
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to={`/models/u/${phase.modelId}`}>モデルページを見る</Link>
          </Button>
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => {
              setFile(null)
              setHash({ type: "none" })
              setFields(emptyFields)
              setPhase({ type: "idle" })
            }}
          >
            続けてアップロード
          </Button>
        </div>
      </div>
    )
  }

  const used = mine.data?.used ?? 0
  const limit = mine.data?.limit ?? 0
  const isLimitReached = mine.data !== undefined && limit > 0 && used >= limit

  const progress =
    phase.type === "uploading" || phase.type === "paused"
      ? phase.progress
      : null
  const progressPercent = progress
    ? Math.floor(
        (progress.uploadedBytes / Math.max(1, progress.totalBytes)) * 100,
      )
    : 0

  const hashPercent =
    hash.type === "hashing" && file
      ? Math.floor((hash.hashedBytes / Math.max(1, file.size)) * 100)
      : hash.type === "done"
        ? 100
        : 0

  const canSubmit =
    file !== null &&
    hash.type === "done" &&
    !isTooLarge &&
    fields.name.trim() !== "" &&
    !isUploadingImage &&
    !isLimitReached &&
    phase.type === "idle"

  const submitLabel = (() => {
    if (!file) return "ファイルを選択してください"
    if (isTooLarge) return "ファイルが大きすぎます"
    if (hash.type === "hashing") return `ファイルを確認中… ${hashPercent}%`
    if (fields.name.trim() === "") return "名前を入力してください"
    if (isUploadingImage) return "画像をアップロード中…"
    if (isLimitReached) return "登録数の上限に達しています"
    return "アップロードして公開"
  })()

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
      <div className="flex flex-col gap-8">
        <section>
          <StepTitle step={1} title="種類を選ぶ" />
          <div className="grid gap-3 sm:grid-cols-2">
            {USER_MODEL_KINDS.map((item) => (
              <button
                key={item.value}
                type="button"
                disabled={phase.type !== "idle"}
                onClick={() => setKind(item.value)}
                aria-pressed={kind === item.value}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-colors disabled:opacity-60",
                  kind === item.value
                    ? item.value === "LORA"
                      ? "border-violet-500 bg-violet-500/5"
                      : "border-sky-500 bg-sky-500/5"
                    : "border-border hover:border-foreground/30",
                )}
              >
                <span className="font-bold">{item.label}</span>
                <span className="text-muted-foreground text-xs leading-relaxed">
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <StepTitle
            step={2}
            title="ファイルを選ぶ"
            description=".safetensors のみ（安全のため .ckpt / .pt は使えません）"
          />
          {file === null ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                onSelectFile(event.dataTransfer.files?.[0] ?? null)
              }}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "hover:border-foreground/40 hover:bg-muted/40",
              )}
            >
              <UploadCloudIcon className="size-10 text-muted-foreground" />
              <span className="font-semibold">ここにドラッグ＆ドロップ</span>
              <span className="text-muted-foreground text-sm">
                またはクリックして選択（{kindLabel(kind)} は最大{" "}
                {formatBytes(maxBytes)}）
              </span>
            </button>
          ) : (
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4",
                isTooLarge && "border-destructive/50 bg-destructive/5",
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                <FileBoxIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-medium text-sm">{file.name}</p>
                <p className="text-muted-foreground text-xs">
                  {formatBytes(file.size)}
                  {isTooLarge && (
                    <span className="ml-2 text-destructive">
                      {kindLabel(kind)} の上限 {formatBytes(maxBytes)}{" "}
                      を超えています
                    </span>
                  )}
                </p>
                {hash.type === "hashing" && (
                  <div className="flex items-center gap-2">
                    <Progress value={hashPercent} className="h-1" />
                    <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                      確認中 {hashPercent}%
                    </span>
                  </div>
                )}
                {hash.type === "done" && (
                  <p className="flex items-center gap-1 text-emerald-600 text-xs dark:text-emerald-400">
                    <ShieldCheckIcon className="size-3.5" />
                    ファイルを確認しました
                    <code className="ml-1 text-muted-foreground">
                      sha256:{hash.sha256.slice(0, 12)}…
                    </code>
                  </p>
                )}
                {hash.type === "error" && (
                  <p className="text-destructive text-xs">{hash.message}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={phase.type !== "idle"}
                aria-label="ファイルを外す"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".safetensors"
            hidden
            onChange={(event) => {
              onSelectFile(event.target.files?.[0] ?? null)
              event.target.value = ""
            }}
          />
        </section>

        <section>
          <StepTitle
            step={3}
            title="モデルの情報"
            description="ファイルの確認中に入力できます。あとから編集もできます"
          />
          <UserModelMetadataFields
            kind={kind}
            value={fields}
            onChange={setFields}
            onUploadingChange={setIsUploadingImage}
          />
        </section>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        {mine.data && (
          <UserModelLimitCard
            used={used}
            limit={limit}
            planType={mine.data.planType}
          />
        )}

        {limitError && (
          <div className="rounded-2xl border border-amber-500/50 bg-amber-500/5 p-4 text-sm">
            <p>{limitError}</p>
            <Button asChild size="sm" className="mt-2 rounded-full">
              <Link to="/plus">プランを見る</Link>
            </Button>
          </div>
        )}

        <div className="space-y-4 rounded-2xl border p-4">
          {(phase.type === "uploading" ||
            phase.type === "paused" ||
            phase.type === "completing") && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-sm">
                  {phase.type === "completing"
                    ? "仕上げ中…"
                    : phase.type === "paused"
                      ? "一時停止中"
                      : progress === null
                        ? "準備中…"
                        : "アップロード中"}
                </p>
                <p className="font-bold text-lg tabular-nums">
                  {phase.type === "completing" ? 100 : progressPercent}%
                </p>
              </div>
              <Progress
                value={phase.type === "completing" ? 100 : progressPercent}
                className="h-2"
              />
              {progress && (
                <div className="flex justify-between text-muted-foreground text-xs tabular-nums">
                  <span>
                    {formatBytes(progress.uploadedBytes)} /{" "}
                    {formatBytes(progress.totalBytes)}
                  </span>
                  <span>
                    {phase.type === "uploading" && progress.bytesPerSecond > 0
                      ? `${formatBytes(progress.bytesPerSecond)}/s ・ 残り ${formatDuration(progress.etaSeconds ?? Number.NaN)}`
                      : `${progress.completedParts}/${progress.totalParts} パート`}
                  </span>
                </div>
              )}
              {phase.type === "paused" && phase.message && (
                <p className="text-destructive text-xs">{phase.message}</p>
              )}
              <div className="flex gap-2 pt-1">
                {phase.type === "uploading" && progress !== null && (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onPause}
                  >
                    <PauseIcon className="mr-1.5 size-4" />
                    一時停止
                  </Button>
                )}
                {phase.type === "paused" && (
                  <Button className="flex-1" onClick={onResume}>
                    <PlayIcon className="mr-1.5 size-4" />
                    再開
                  </Button>
                )}
                {phase.type !== "completing" && (
                  <Button variant="ghost" onClick={onCancel}>
                    中止
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                ページを閉じても、同じファイルを選び直すと続きから再開できます
              </p>
            </div>
          )}

          {phase.type === "idle" && (
            <>
              <Button
                size="lg"
                className="h-12 w-full rounded-xl font-bold text-base"
                disabled={!canSubmit}
                onClick={onSubmit}
              >
                {hash.type === "hashing" ? (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                ) : (
                  <UploadCloudIcon className="mr-2 size-5" />
                )}
                {submitLabel}
              </Button>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground text-xs leading-relaxed">
                <li>
                  アップロードしたモデルは全ユーザーが生成に使えるよう公開されます
                </li>
                <li>
                  権利を持っていない・再配布が禁止されているモデルはアップロードしないでください
                </li>
                <li>同じファイルがすでにある場合は転送を省略します</li>
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
