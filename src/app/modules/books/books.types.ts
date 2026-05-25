export type BookListQuery = {
  search?: string;
  page?: string;
  limit?: string;
};

export type GoogleBooksVolumeInfo = {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
  language?: string;
  previewLink?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
  industryIdentifiers?: {
    type?: string;
    identifier?: string;
  }[];
};

export type GoogleBooksSaleInfo = {
  country?: string;
  saleability?: string;
  isEbook?: boolean;
  buyLink?: string;
  retailPrice?: {
    amount?: number;
    currencyCode?: string;
  };
};

export type GoogleBooksAccessInfo = {
  country?: string;
  viewability?: string;
  embeddable?: boolean;
  publicDomain?: boolean;
  textToSpeechPermission?: string;
  webReaderLink?: string;
};

export type GoogleBooksVolume = {
  id: string;
  selfLink?: string;
  volumeInfo?: GoogleBooksVolumeInfo;
  saleInfo?: GoogleBooksSaleInfo;
  accessInfo?: GoogleBooksAccessInfo;
};

export type GoogleBooksListResponse = {
  totalItems?: number;
  items?: GoogleBooksVolume[];
};

export type BookResponse = {
  id: string;
  title: string;
  subtitle: string | null;
  authors: string[];
  publisher: string | null;
  publishedDate: string | null;
  description: string | null;
  pageCount: number | null;
  categories: string[];
  averageRating: number | null;
  ratingsCount: number | null;
  language: string | null;
  thumbnail: string | null;
  smallThumbnail: string | null;
  previewLink: string | null;
  infoLink: string | null;
  canonicalVolumeLink: string | null;
  industryIdentifiers: {
    type: string;
    identifier: string;
  }[];
  saleInfo: {
    country: string | null;
    saleability: string | null;
    isEbook: boolean;
    buyLink: string | null;
    retailPrice: {
      amount: number;
      currencyCode: string;
    } | null;
  };
  accessInfo: {
    country: string | null;
    viewability: string | null;
    embeddable: boolean;
    publicDomain: boolean;
    textToSpeechPermission: string | null;
    webReaderLink: string | null;
  };
};
