import httpStatus from "http-status";
import AppError from "../../error/AppError";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AknChatMessageResponse } from "./chat.types";

const withTrailingSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`);

const buildUrl = (path: string) => {
  const baseUrl = config.aknChat?.baseUrl;
  if (!baseUrl) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "AKN chat base URL is not configured (AKN_CHAT_BASE_URL)"
    );
  }
  return new URL(path.replace(/^\//, ""), withTrailingSlash(baseUrl)).toString();
};

const parseErrorBody = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    }
    return await response.text();
  } catch {
    return null;
  }
};

const requestAknChat = async <T>(path: string, init: RequestInit, timeoutMs?: number): Promise<T> => {
  const url = buildUrl(path);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs ?? config.aknChat.timeoutMs);

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(init.headers as Record<string, string> | undefined),
    };

    const apiKey = config.aknChat.apiKey;
    if (apiKey) {
      headers.Authorization = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
    }

    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await parseErrorBody(response);
      const details =
        errorBody && typeof errorBody === "object"
          ? JSON.stringify(errorBody)
          : typeof errorBody === "string"
            ? errorBody
            : "";

      throw new AppError(
        httpStatus.BAD_GATEWAY,
        `AKN chat service error (${response.status})${details ? `: ${details}` : ""}`
      );
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }
    if (err?.name === "AbortError") {
      throw new AppError(httpStatus.GATEWAY_TIMEOUT, "AKN chat service request timed out");
    }
    throw new AppError(httpStatus.BAD_GATEWAY, "Failed to reach AKN chat service");
  } finally {
    clearTimeout(timeout);
  }
};

export const ChatService = {
  async sendMessage(userId: string, message: string) {
    return requestAknChat<AknChatMessageResponse>(
      "/api/v1/chat/message",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message }),
      },
      config.aknChat.timeoutMs
    );
  },

  async getHistory(userId: string) {
    return requestAknChat<any>(`/api/v1/chat/history/${encodeURIComponent(userId)}`, { method: "GET" });
  },

  async deleteHistory(userId: string) {
    return requestAknChat<any>(`/api/v1/chat/history/${encodeURIComponent(userId)}`, { method: "DELETE" });
  },

  async getMemory(userId: string) {
    return requestAknChat<any>(`/api/v1/chat/memory/${encodeURIComponent(userId)}`, { method: "GET" });
  },

  async getUsage(userId: string) {
    return requestAknChat<any>(`/api/v1/chat/usage/${encodeURIComponent(userId)}`, { method: "GET" });
  },

  async getAllUsersUsage() {
    const users = await prisma.user.findMany({
      where: {
        role: "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    const usagePromises = users.map(async (user) => {
      try {
        const usage = await this.getUsage(user.id);
        return {
          user,
          usage,
        };
      } catch (err) {
        return {
          user,
          usage: {
            user_id: user.id,
            total_tokens: 0,
            prompt_tokens: 0,
            completion_tokens: 0,
            message_count: 0,
          },
        };
      }
    });

    return Promise.all(usagePromises);
  },
};
