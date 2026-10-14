import photos from './generated/photos.json'
import type { Photo } from './types'

const PHOTOS = photos as Record<string, Photo[]>

export const photosOf = (id: string): Photo[] => PHOTOS[id] ?? []
