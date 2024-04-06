"use client"

import { Button } from "@/_components/ui/button"
import { Card } from "@/_components/ui/card"

export const TitleWorkCard = () => {
  return (
    <Card>
      <Button>
        <img src="https://source.unsplash.com/random/800x600" alt="" />
      </Button>
      <p className="text-xs">{"title"}</p>
    </Card>
  )
}
