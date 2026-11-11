import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useEffect, useSyncExternalStore } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

const BLUR_KEY = "r18Blur"
const BLUR_EVENT = "aipictors:r18-blur"

// 以前は localStorage に保存していて、一度押すとずっとぼかしたままになっていた。
// ぼかしはそのタブの間だけ（sessionStorage）にし、古い保存は消す
const readIsBlurred = () => {
  try {
    return sessionStorage.getItem(BLUR_KEY) === "1"
  } catch {
    return false
  }
}

const subscribeBlur = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  window.addEventListener(BLUR_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(BLUR_EVENT, onChange)
  }
}

/**
 * 作品のぼかし（タブを閉じるまで記憶する）
 */
export function useSensitiveBlur() {
  const isBlurred = useSyncExternalStore(
    subscribeBlur,
    readIsBlurred,
    () => false,
  )

  const setIsBlurred = (next: boolean) => {
    try {
      sessionStorage.setItem(BLUR_KEY, next ? "1" : "0")
    } catch {
      // 保存できなくても、このページの間は下の属性で効く
    }
    document.documentElement.toggleAttribute("data-r18-blur", next)
    window.dispatchEvent(new Event(BLUR_EVENT))
  }

  return { isBlurred, setIsBlurred }
}

/** ぼかしの設定を、最初の描画より前に反映する */
const blurScript = `try{localStorage.removeItem("${BLUR_KEY}");if(sessionStorage.getItem("${BLUR_KEY}")==="1")document.documentElement.setAttribute("data-r18-blur","")}catch(_){}`

/** このページで使うので tailwind.css に入れず、HTML と一緒に届ける */
const blurStyle = `html[data-r18-blur] #main-content img,html[data-r18-blur] #main-content video,html[data-r18-blur] [role="dialog"] img,html[data-r18-blur] [role="dialog"] video{filter:blur(24px);}`

/**
 * R18 のページのぼかし切り替え（人前で開くときのワンタッチ）
 * どのページでも同じ位置に出し、全年齢のページへ移ったら効かなくなる
 */
export function SensitiveBlurToggle(): React.ReactNode {
  const t = useTranslation()
  const { isBlurred, setIsBlurred } = useSensitiveBlur()

  useEffect(() => {
    document.documentElement.toggleAttribute("data-r18-blur", isBlurred)
    return () => {
      document.documentElement.removeAttribute("data-r18-blur")
    }
  }, [isBlurred])

  const label = isBlurred
    ? t("作品のぼかしを解除", "Remove blur")
    : t("作品をぼかす", "Blur works")

  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: 固定の短いスクリプト
        dangerouslySetInnerHTML={{ __html: blurScript }}
      />
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: 固定の CSS
        dangerouslySetInnerHTML={{ __html: blurStyle }}
      />
      <button
        type="button"
        aria-pressed={isBlurred}
        aria-label={label}
        title={label}
        onClick={() => setIsBlurred(!isBlurred)}
        className={cn(
          "fixed right-3 bottom-[4.5rem] z-20 flex size-11 items-center justify-center rounded-full border shadow-md transition-colors",
          isBlurred
            ? "bg-primary text-primary-foreground"
            : "bg-background/90 text-foreground hover:bg-muted",
        )}
      >
        {isBlurred ? (
          <EyeOffIcon className="size-5" />
        ) : (
          <EyeIcon className="size-5" />
        )}
      </button>
    </>
  )
}
