import { useParams } from "@remix-run/react"

/**
 * アルバム詳細
 */
export default function RecipientMessages() {
  const params = useParams()

  console.log(params)

  return <div>test</div>
}
