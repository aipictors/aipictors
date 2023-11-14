import { RedirectType, redirect } from "next/navigation"

type Props = {
  params: {
    id: string
  }
}

const Page = async (props: Props) => {
  redirect(`/albums/${props.params.id}`, RedirectType.replace)
}

export default Page
