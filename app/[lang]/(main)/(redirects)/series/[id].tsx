import { RedirectType, redirect } from "next/navigation"
import React from "react"

type Props = {
  params: {
    id: string
  }
}

const Page: React.FC<Props> = async (props) => {
  redirect(`/albums/${props.params.id}`, RedirectType.replace)
}

export default Page
