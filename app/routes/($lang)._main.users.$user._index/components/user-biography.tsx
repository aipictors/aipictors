import { Link } from "@remix-run/react"

type Props = {
  text: string
}

export function UserBiography(props: Props) {
  // URLを検出する正規表現
  const urlPattern = /https?:\/\/[^\s]+/g
  const parts: string[] = props.text.split(urlPattern)
  const urls: string[] | null = props.text.match(urlPattern)

  const elements: (string | JSX.Element)[] = []

  parts.forEach((part, index) => {
    // 改行に対応するために、各パートを改行で分割
    const splitByLineBreaks = part.split("\n")

    splitByLineBreaks.forEach((line, lineIndex) => {
      elements.push(line)
      if (lineIndex < splitByLineBreaks.length - 1) {
        // 改行を挿入
        elements.push(
          <br key={`line-break-${index}-${lineIndex.toString()}`} />,
        )
      }
    })

    if (urls?.[index]) {
      elements.push(
        <Link
          key={index.toString()}
          to={urls[index]}
          target="_blank"
          rel="noopener noreferrer"
        >
          {urls[index]}
        </Link>,
      )
    }
  })

  return elements
}
