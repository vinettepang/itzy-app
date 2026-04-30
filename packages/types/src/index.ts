export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface AlbumWithPhotos {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  photos: PhotoItem[];
}

export interface PhotoItem {
  id: string;
  albumId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}
