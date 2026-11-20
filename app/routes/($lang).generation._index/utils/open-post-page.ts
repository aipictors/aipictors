type Opener = {
  open: (url: string, target: string) => Window | null
  navigate: (url: string) => void
}

const defaultOpener: Opener = {
  open: (url, target) => window.open(url, target),
  navigate: (url) => {
    window.location.href = url
  },
}

/**
 * 生成履歴から投稿画面を開く。
 * スマホのブラウザでは新しいタブがブロックされて何も起きないことがあるので、
 * 開けなかったときは同じタブで開く
 */
export function openPostPage(url: string, opener: Opener = defaultOpener) {
  let opened: Window | null = null

  try {
    opened = opener.open(url, "_blank")
  } catch {
    opened = null
  }

  if (opened === null) {
    opener.navigate(url)
  }
}
