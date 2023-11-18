import { Button } from "@/components/ui/button"

import Link from "next/link"

type Props = {
  year: number
  month: number
  day: number | null
  title: string | null
}

export const ThemeListItem = (props: Props) => {
  if (props.title === null) {
    return (
      <div className="hidden lg:block h-24 bg-[backgroundColor] rounded-md p-4" />
    )
  }

  return (
    <Link href={`/themes/${props.year}/${props.month}/${props.day}`}>
      <Button>
        <span className="block w-auto text-sm">{props.day}</span>
        <span className="block w-auto text-sm">{props.title}</span>
      </Button>
    </Link>
  )
}
