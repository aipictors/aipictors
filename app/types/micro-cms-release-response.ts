export interface MicroCmsApiRelease {
  id: string
  title: string
  description: string
  thumbnail_url: {
    url: string
  }
  platform: string
  createdAt: number
}

export interface MicroCmsApiReleaseResponse {
  contents: MicroCmsApiRelease[]
  totalCount: number
  offset: number
  limit: number
}
