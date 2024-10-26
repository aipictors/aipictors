import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  modelType: string
  value: string
  onChange(value: string): void
}

export function GenerationConfigSize(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-y-2">
      <span className="font-bold text-sm">{t("サイズ", "Size")}</span>
      <Select value={props.value} onValueChange={props.onChange}>
        <SelectGroup>
          <SelectTrigger className="break-all text-start">
            <SelectValue placeholder={t("サイズ", "Size")} />
          </SelectTrigger>
          <SelectContent>
            {props.modelType === "SD1" && (
              <SelectItem value={"SD1_512_512"}>
                {t(
                  "【正方形】768x768(upscale:1.5)",
                  "【Square】768x768(upscale:1.5)",
                )}
              </SelectItem>
            )}
            {props.modelType === "SD1" && (
              <SelectItem value={"SD1_512_768"}>
                {t(
                  "【縦長】768x1152(upscale:1.5)",
                  "【Vertical】768x1152(upscale:1.5)",
                )}
              </SelectItem>
            )}
            {props.modelType === "SD1" && (
              <SelectItem value={"SD1_768_512"}>
                {t(
                  "【横長】1152x768(upscale:1.5)",
                  "【Horizontal】1152x768(upscale:1.5)",
                )}
              </SelectItem>
            )}
            {props.modelType === "SD2" && (
              <SelectItem value={"SD2_768_768"}>
                {t("【正方形】768×768", "【Square】768×768")}
              </SelectItem>
            )}
            {props.modelType === "SD2" && (
              <SelectItem value={"SD2_768_1200"}>
                {t("【縦長】768×1200", "【Vertical】768×1200")}
              </SelectItem>
            )}
            {props.modelType === "SD2" && (
              <SelectItem value={"SD2_1200_768"}>
                {t("【横長】1200×768", "【Horizontal】1200×768")}
              </SelectItem>
            )}
            {props.modelType === "SD1" && (
              <SelectItem value={"SD1_384_960"}>
                {t(
                  "【超縦長】576x1440(upscale:1.5)",
                  "【Ultra Vertical】576x1440(upscale:1.5)",
                )}
              </SelectItem>
            )}
            {props.modelType === "SD1" && (
              <SelectItem value={"SD1_960_384"}>
                {t(
                  "【超横長】1440x576(upscale:1.5)",
                  "【Ultra Horizontal】1440x576(upscale:1.5)",
                )}
              </SelectItem>
            )}
            {props.modelType === "SDXL" && (
              <SelectItem value={"SD3_1024_1024"}>
                {t("【正方形】1024x1024", "【Square】1024x1024")}
              </SelectItem>
            )}
            {props.modelType === "SDXL" && (
              <SelectItem value={"SD3_832_1216"}>
                {t("【縦長】832x1216", "【Vertical】832x1216")}
              </SelectItem>
            )}
            {props.modelType === "SDXL" && (
              <SelectItem value={"SD3_1216_832"}>
                {t("【横長】1216x832", "【Horizontal】1216x832")}
              </SelectItem>
            )}
            {props.modelType === "SDXL" && (
              <SelectItem value={"SD3_640_1536"}>
                {t("【超縦長】640x1536", "【Ultra Vertical】640x1536")}
              </SelectItem>
            )}
            {props.modelType === "SDXL" && (
              <SelectItem value={"SD3_1536_640"}>
                {t("【超横長】1536x640", "【Ultra Horizontal】1536x640")}
              </SelectItem>
            )}
            {props.modelType === "FLUX" && (
              <SelectItem value={"SD4_896_896"}>
                {t("【正方形】896x896", "【Square】896x896")}
              </SelectItem>
            )}
            {props.modelType === "FLUX" && (
              <SelectItem value={"SD4_896_1152"}>
                {t("【縦長】896x1152", "【Square】896x1152")}
              </SelectItem>
            )}
            {props.modelType === "FLUX" && (
              <SelectItem value={"SD4_1152_896"}>
                {t("【横長】1152x896", "【Square】1152x896")}
              </SelectItem>
            )}
          </SelectContent>
        </SelectGroup>
      </Select>
    </div>
  )
}
