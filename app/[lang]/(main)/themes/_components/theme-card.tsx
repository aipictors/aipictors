"use client"

import { Card } from "@/components/ui/card"

export const ThemeCard = () => {
  return (
    <Card>
      <img
        className="w-40 object-cover rounded-lg"
        src="https://bit.ly/dan-abramov"
        alt="Dan Abramov"
      />
      <div className="p-2 flex flex-col justify-between h-full space-y-1">
        <p className="text-sm font-bold">{"作品名"}</p>
        <div className="flex items-center space-x-2">
          <img
            className="w-10 h-10 rounded-full"
            src="https://bit.ly/dan-abramov"
            alt="Dan Abrahmov"
          />
          <p className="text-sm">{"名前"}</p>
        </div>
      </div>
    </Card>
  )
}
