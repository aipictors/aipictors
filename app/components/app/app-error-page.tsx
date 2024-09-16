import { Button } from "~/components/ui/button"
import { useRevalidator } from "@remix-run/react"
import { redirect } from "@remix-run/node"

type Props = Readonly<{
  status: number
  message: string
}>

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/YFhY3hdw0jD
 */
export function AppErrorPage(props: Props) {
  const revalidator = useRevalidator()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p className="mt-4 text-center font-bold text-md md:text-xl">
        {"通信エラーが発生したため、"}
      </p>
      <p className="mt-0 text-center font-bold text-md md:text-xl">
        {"しばらくしてから画面更新をお願いいたします。"}
      </p>
      <img
        src="https://files.aipictors.com/cry-pictorchan-with-shadow.webp"
        className="mt-16 mb-16 w-40"
        alt="cry-pictor-chan"
      />
      <div className="mt-8 flex items-center space-x-2 space-y-1 md:space-y-0">
        <Button
          className="rounded-md px-8 py-2"
          onClick={() => {
            redirect("https://www.aipictors.com/")
          }}
          variant={"secondary"}
        >
          {"トップ"}
        </Button>
        <Button
          className="rounded-md px-8 py-2"
          onClick={() => {
            revalidator.revalidate()
          }}
        >
          {"再読み込み"}
        </Button>
      </div>

      <div className="mt-8 mb-8">
        <p className="mt-2 text-center text-xs opacity-70">
          {"500 "}
          {props.message}
        </p>
      </div>
    </div>
  )
}
