import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../error/AppError";
import {
  BookListQuery,
  BookResponse,
  GoogleBooksListResponse,
  GoogleBooksVolume,
} from "./books.types";

const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const DEFAULT_SEARCH_QUERY =
  "manifestation OR affirmations OR dream journaling OR mindfulness OR self help";
const MAX_LIMIT = 40;

const normalizeNumber = (value: string | undefined, fallback: number, max?: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  const normalized = Math.floor(parsed);
  return max ? Math.min(normalized, max) : normalized;
};

const ensureApiKey = () => {
  if (!config.googleBooks.apiKey) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Google Books API key is not configured (GOOGLE_BOOKS_API_KEY)"
    );
  }
};

const parseGoogleBooksError = async (response: Response) => {
  try {
    const payload = await response.json();
    return payload?.error?.message || null;
  } catch {
    return null;
  }
};

const requestGoogleBooks = async <T>(url: URL): Promise<T> => {
  ensureApiKey();
  url.searchParams.set("key", config.googleBooks.apiKey);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorMessage = await parseGoogleBooksError(response);
      throw new AppError(
        response.status === httpStatus.NOT_FOUND ? httpStatus.NOT_FOUND : httpStatus.BAD_GATEWAY,
        errorMessage || `Google Books API request failed with status ${response.status}`
      );
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(httpStatus.BAD_GATEWAY, "Failed to reach Google Books API");
  }
};

const getHttpsImageUrl = (url: string | undefined) => {
  if (!url) {
    return null;
  }

  return url.replace(/^http:\/\//, "https://");
};

const mapBook = (volume: GoogleBooksVolume): BookResponse => {
  const volumeInfo = volume.volumeInfo || {};
  const saleInfo = volume.saleInfo || {};
  const accessInfo = volume.accessInfo || {};

  return {
    id: volume.id,
    title: volumeInfo.title || "Untitled",
    subtitle: volumeInfo.subtitle || null,
    authors: volumeInfo.authors || [],
    publisher: volumeInfo.publisher || null,
    publishedDate: volumeInfo.publishedDate || null,
    description: volumeInfo.description || null,
    pageCount: volumeInfo.pageCount || null,
    categories: volumeInfo.categories || [],
    averageRating: volumeInfo.averageRating || null,
    ratingsCount: volumeInfo.ratingsCount || null,
    language: volumeInfo.language || null,
    thumbnail: getHttpsImageUrl(volumeInfo.imageLinks?.thumbnail),
    smallThumbnail: getHttpsImageUrl(volumeInfo.imageLinks?.smallThumbnail),
    previewLink: volumeInfo.previewLink || null,
    infoLink: volumeInfo.infoLink || null,
    canonicalVolumeLink: volumeInfo.canonicalVolumeLink || null,
    industryIdentifiers: (volumeInfo.industryIdentifiers || [])
      .filter((item) => item.type && item.identifier)
      .map((item) => ({
        type: item.type as string,
        identifier: item.identifier as string,
      })),
    saleInfo: {
      country: saleInfo.country || null,
      saleability: saleInfo.saleability || null,
      isEbook: Boolean(saleInfo.isEbook),
      buyLink: saleInfo.buyLink || null,
      retailPrice:
        typeof saleInfo.retailPrice?.amount === "number" && saleInfo.retailPrice.currencyCode
          ? {
              amount: saleInfo.retailPrice.amount,
              currencyCode: saleInfo.retailPrice.currencyCode,
            }
          : null,
    },
    accessInfo: {
      country: accessInfo.country || null,
      viewability: accessInfo.viewability || null,
      embeddable: Boolean(accessInfo.embeddable),
      publicDomain: Boolean(accessInfo.publicDomain),
      textToSpeechPermission: accessInfo.textToSpeechPermission || null,
      webReaderLink: accessInfo.webReaderLink || null,
    },
  };
};

const getBooks = async (query: BookListQuery) => {
  const page = normalizeNumber(query.page, 1);
  const limit = normalizeNumber(query.limit, 10, MAX_LIMIT);
  const search = query.search?.trim() || DEFAULT_SEARCH_QUERY;
  const startIndex = (page - 1) * limit;

  const url = new URL(GOOGLE_BOOKS_BASE_URL);
  url.searchParams.set("q", search);
  url.searchParams.set("startIndex", String(startIndex));
  url.searchParams.set("maxResults", String(limit));
  url.searchParams.set("printType", "books");
  url.searchParams.set("projection", "full");
  url.searchParams.set("orderBy", "relevance");

  const result = await requestGoogleBooks<GoogleBooksListResponse>(url);
  const total = result.totalItems || 0;

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: (result.items || []).map(mapBook),
  };
};

const getBookById = async (id: string) => {
  if (!id?.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, "Book id is required");
  }

  const url = new URL(`${GOOGLE_BOOKS_BASE_URL}/${encodeURIComponent(id.trim())}`);
  const result = await requestGoogleBooks<GoogleBooksVolume>(url);

  return mapBook(result);
};

export const BooksService = {
  getBooks,
  getBookById,
};
