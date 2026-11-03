/** ぴくたーちゃんのセリフ（日本語・英語） */
type PictorChanLine = readonly [string, string]

/** 迷子のページ（404）で話すこと。日替わりで、タップすると次のセリフになる */
export const NOT_FOUND_LINES: readonly PictorChanLine[] = [
  [
    "あれれ？このページ、さっきまで巡回していたのに見当たりません…！",
    "Huh? I was just on patrol here, but this page is nowhere to be found!",
  ],
  [
    "このページはお散歩に出かけたみたいです。いっしょに別の作品を見ませんか？",
    "This page seems to have gone for a walk. Shall we look at other works together?",
  ],
  [
    "わたしも迷子になりました！じゃがいもを食べて落ち着きますね。",
    "I got lost too! Let me calm down with a potato.",
  ],
  [
    "URL をすみずみまで探したのですが、見つかりませんでした…ごめんなさい！",
    "I searched every corner of this URL, but found nothing. Sorry!",
  ],
  [
    "ここには何もないようです。でも、すてきな作品なら向こうにたくさんありますよ！",
    "Nothing here, it seems. But there are plenty of lovely works over there!",
  ],
  [
    "作品の閲覧が趣味のわたしでも、このページは見たことがありません！",
    "Browsing works is my hobby, and even I have never seen this page!",
  ],
  [
    "公開をやめた作品や、移動したページかもしれません。検索で探してみましょう！",
    "It may be a removed work or a moved page. Let's try searching!",
  ],
]

/** 誕生日（11月21日）だけのセリフ */
export const BIRTHDAY_LINE: PictorChanLine = [
  "今日はわたしの誕生日なのに、ページが迷子です！でも、来てくれてうれしいです！",
  "It's my birthday and this page got lost! Still, I'm so glad you came!",
]

/** 不具合のページ（500）で話すこと */
export const ERROR_LINES: readonly PictorChanLine[] = [
  [
    "ごめんなさい！ちょっと転んでしまいました。少し待ってから、もう一度読み込んでみてください。",
    "Sorry! I took a little tumble. Please wait a moment and reload.",
  ],
  [
    "うまく表示できませんでした…！すぐに立て直すので、もう一度読み込んでみてください。",
    "That didn't display properly! I'll get back up soon, so please try reloading.",
  ],
  [
    "じゃがいもを落としてしまいました！拾っているあいだ、少しだけ待ってくださいね。",
    "I dropped my potatoes! Please wait a little while I pick them up.",
  ],
]

/** 日本時間の日付（月・日と、日ごとに 1 ずつ増える番号） */
export const getJstDay = (now: Date) => {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return {
    month: jst.getUTCMonth() + 1,
    date: jst.getUTCDate(),
    dayNumber: Math.floor(jst.getTime() / (24 * 60 * 60 * 1000)),
  }
}

/** 今日のセリフの番号（同じ日なら誰が見ても同じ） */
export const getDailyLineIndex = (lineCount: number, now: Date) => {
  return getJstDay(now).dayNumber % lineCount
}

/** 11月21日かどうか（ぴくたーちゃんの誕生日） */
export const isPictorChanBirthday = (now: Date) => {
  const { month, date } = getJstDay(now)
  return month === 11 && date === 21
}

