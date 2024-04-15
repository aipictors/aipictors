import { ChatMessageView } from "@/[lang]/(main)/messages/[recipient]/_components/chat-message-view"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.recipient === undefined) {
    throw new Response(null, { status: 404 })
  }

  const recipientId = props.params.recipient
  return {
    recipientId,
  }
}

/**
 * 受信者とのメッセージ
 * @param props
 * @returns
 */
export default function RecipientMessages() {
  const params = useParams()

  if (params.recipient === undefined) {
    throw new Error()
  }

  const data = useLoaderData<typeof loader>()

  return <ChatMessageView recipientId={data.recipientId} />
}
