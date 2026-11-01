import { useEffect, useState } from "react"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import {
  GENERATION_SAMPLER_OPTIONS,
  GENERATION_SCHEDULER_OPTIONS,
} from "~/lib/generation-sampler"
import type { UserModelRecommendedSettings } from "~/lib/user-models/types"

type Props = {
  value: UserModelRecommendedSettings | null | undefined
  onChange(value: UserModelRecommendedSettings | null): void
}

const EMPTY: UserModelRecommendedSettings = {
  sampler: null,
  scheduler: null,
  cfgScale: null,
  steps: null,
  clipSkip: null,
  qualityPrompt: null,
  negativePrompt: null,
}

// Select は空文字を値にできないので「指定しない」はこの値で表す
const NONE = "none"

const toIntOrNull = (text: string, min: number, max: number) => {
  if (text.trim() === "") return null
  const value = Number(text)
  if (Number.isNaN(value)) return null
  return Math.min(max, Math.max(min, Math.round(value)))
}

/**
 * 数の入力。入力中は範囲外も許し、フォーカスが外れたら範囲に収める（空欄は「指定しない」）
 */
function NumberField(props: {
  id: string
  label: string
  min: number
  max: number
  placeholder: string
  value: number | null
  onChange(value: number | null): void
}) {
  const [text, setText] = useState(
    props.value === null ? "" : String(props.value),
  )

  useEffect(() => {
    setText(props.value === null ? "" : String(props.value))
  }, [props.value])

  return (
    <div className="space-y-1.5">
      <Label className="text-xs" htmlFor={props.id}>
        {props.label}
      </Label>
      <Input
        id={props.id}
        type="number"
        inputMode="numeric"
        min={props.min}
        max={props.max}
        placeholder={props.placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => {
          const next = toIntOrNull(text, props.min, props.max)
          setText(next === null ? "" : String(next))
          if (next !== props.value) props.onChange(next)
        }}
      />
    </div>
  )
}

/**
 * チェックポイントのおすすめ生成設定。入れた項目だけ、生成画面の「おすすめ設定を使う」で反映される
 */
export function UserModelRecommendedSettingsFields(props: Props) {
  const value = props.value ?? EMPTY

  const update = (patch: Partial<UserModelRecommendedSettings>) => {
    const next = { ...value, ...patch }
    const isEmpty = [
      next.sampler,
      next.scheduler,
      next.cfgScale,
      next.steps,
      next.clipSkip,
      next.qualityPrompt,
      next.negativePrompt,
    ].every((v) => v === null || v === undefined || v === "")
    props.onChange(isEmpty ? null : next)
  }

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="space-y-1">
        <p className="font-semibold text-sm">おすすめの生成設定（任意）</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          このモデルに合う設定を入れておくと、生成画面で「おすすめ設定を使う」を押すだけで使えます。分からない項目は空欄のままで大丈夫です。
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Sampler</Label>
          <Select
            value={value.sampler ?? NONE}
            onValueChange={(next) =>
              update({ sampler: next === NONE ? null : next })
            }
          >
            <SelectTrigger aria-label="おすすめの Sampler">
              <SelectValue>{value.sampler ?? "指定しない"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>指定しない</SelectItem>
              {GENERATION_SAMPLER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Schedule type</Label>
          <Select
            value={value.scheduler ?? NONE}
            onValueChange={(next) =>
              update({ scheduler: next === NONE ? null : next })
            }
          >
            <SelectTrigger aria-label="おすすめの Schedule type">
              <SelectValue>
                {value.scheduler ?? "指定しない（自動）"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>指定しない（自動）</SelectItem>
              {GENERATION_SCHEDULER_OPTIONS.filter(
                (option) => option.value !== null,
              ).map((option) => (
                <SelectItem key={option.value} value={option.value ?? NONE}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <NumberField
          id="recommended-cfg"
          label="CFG Scale（1〜15）"
          min={1}
          max={15}
          placeholder="例: 7"
          value={value.cfgScale}
          onChange={(next) => update({ cfgScale: next })}
        />
        <NumberField
          id="recommended-steps"
          label="Steps（4〜30）"
          min={4}
          max={30}
          placeholder="例: 20"
          value={value.steps}
          onChange={(next) => update({ steps: next })}
        />
        <NumberField
          id="recommended-clip-skip"
          label="Clip skip（1〜12）"
          min={1}
          max={12}
          placeholder="例: 2"
          value={value.clipSkip}
          onChange={(next) => update({ clipSkip: next })}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs" htmlFor="recommended-quality-prompt">
          品質プロンプト（生成時に先頭へ足します）
        </Label>
        <Textarea
          id="recommended-quality-prompt"
          rows={2}
          maxLength={2000}
          placeholder="例: masterpiece, best quality"
          value={value.qualityPrompt ?? ""}
          onChange={(event) =>
            update({ qualityPrompt: event.target.value || null })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs" htmlFor="recommended-negative-prompt">
          ネガティブプロンプト
        </Label>
        <Textarea
          id="recommended-negative-prompt"
          rows={3}
          maxLength={2000}
          placeholder="例: lowres, bad anatomy, bad hands, watermark"
          value={value.negativePrompt ?? ""}
          onChange={(event) =>
            update({ negativePrompt: event.target.value || null })
          }
        />
      </div>
      {value.source && (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {value.source === "civitai"
            ? "今の内容は Civitai の作例から自動で作りました。"
            : "今の内容はベースモデルの定番を自動で入れました。"}
          変更して保存すると、あなたのおすすめとして表示されます。
        </p>
      )}
    </div>
  )
}
