export interface MicroCmsApiRelease {
  id: string
  title: string
  description: string
  thumbnail_url: {
    url: string
  }
  platform: string
  tag?: string
  is_important?: boolean | null
  createdAt: number
  publishedAt?: string | null
}

export interface MicroCmsApiReleaseResponse {
  contents: MicroCmsApiRelease[]
  totalCount: number
  offset: number
  limit: number
}
