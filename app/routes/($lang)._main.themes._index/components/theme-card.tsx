import { Card } from "~/components/ui/card"

export function ThemeCard() {
  return (
    <Card>
      <img
        className="w-40 rounded-lg object-cover"
        src="https://bit.ly/dan-abramov"
        alt="Dan Abramov"
      />
      <div className="flex flex-col justify-between space-y-1 p-2">
        <p className="font-bold text-sm">{"作品名"}</p>
        <div className="flex items-center space-x-2">
          <img
            className="size-10 rounded-full"
            src="https://bit.ly/dan-abramov"
            alt="Dan Abrahmov"
          />
          <p className="text-sm">{"名前"}</p>
        </div>
      </div>
    </Card>
  )
}
