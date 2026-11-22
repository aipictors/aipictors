import { splitTextByUrls } from "~/utils/split-text-by-urls"

/**
 * 文の中の URL を押せるリンクにして出す（別のタブで開く）。改行は親の whitespace-pre-wrap に任せる
 */
export function LinkifiedText(props: { text: string }) {
  return (
    <>
      {splitTextByUrls(props.text).map((part, index) =>
        part.type === "url" ? (
          <a
            // 同じ文の中の位置で区別する（並び替えはしない）
            // biome-ignore lint/suspicious/noArrayIndexKey: 文の中の位置
            key={index}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
            className="break-all text-blue-600 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
          >
            {part.value}
          </a>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: 文の中の位置
          <span key={index}>{part.value}</span>
        ),
      )}
    </>
  )
}
