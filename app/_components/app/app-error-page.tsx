import { Button } from "@/_components/ui/button"

type Props = {
  status: number
  message: string
}

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/YFhY3hdw0jD
 */
export function AppErrorPage(props: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-bold text-9xl">{props.status}</h1>
      <p className="mt-4 text-xl">{"ERROR"}</p>
      <p className="mt-2">{props.message}</p>
      <Button
        className="mt-8 rounded-md px-8 py-2"
        onClick={() => {
          window.location.reload()
        }}
      >
        {"再読み込み"}
      </Button>
    </div>
  )
}
