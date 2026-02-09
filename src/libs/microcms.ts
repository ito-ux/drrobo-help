import { createClient } from "microcms-js-sdk";
import type {
  MicroCMSQueries,
  MicroCMSImage,
  MicroCMSListContent,
} from "microcms-js-sdk";

/* =========================
   client
========================= */

export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: import.meta.env.MICROCMS_API_KEY || "",
});

/* =========================
   お知らせ（news）
========================= */

export type Notice = {
  title?: string;
  content?: string;
  isImportant?: boolean;
} & MicroCMSListContent;

// ★ microCMS 側のエンドポイント名と完全一致させる
const NOTICE_ENDPOINT = "news";

export const getNoticeList = async (queries?: MicroCMSQueries) => {
  return client.getList<Notice>({
    endpoint: NOTICE_ENDPOINT,
    queries: {
      orders: "-publishedAt",
      ...queries,
    },
  });
};

export const getNoticeDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return client.getListDetail<Notice>({
    endpoint: NOTICE_ENDPOINT,
    contentId,
    queries,
  });
};

export const getImportantNotice = async () => {
  const res = await client.getList<Notice>({
    endpoint: NOTICE_ENDPOINT,
    queries: {
      filters: "isImportant[equals]true",
      orders: "-publishedAt",
      limit: 1,
    },
  });

  return res.contents?.[0] ?? null;
};

/* =========================
   コマンドグループ（comgr）
========================= */

export type CommandGroup = {
  name: string; // 表示名（例：Web操作）
  slug: string; // スラッグ（例：web）
  order: number; // 並び順（例：10）
} & MicroCMSListContent;

const COMGR_ENDPOINT = "comgr";

export const getComgrList = async (queries?: MicroCMSQueries) => {
  return client.getList<CommandGroup>({
    endpoint: COMGR_ENDPOINT,
    queries: {
      orders: "order",
      ...queries,
    },
  });
};

/* =========================
   カテゴリ（categories）
========================= */

export type Category = {
  name: string;
} & MicroCMSListContent;

const CATEGORY_ENDPOINT = "categories";

export const getCategoryList = async (queries?: MicroCMSQueries) => {
  return client.getList<Category>({
    endpoint: CATEGORY_ENDPOINT,
    queries,
  });
};

/* =========================
   ヘルプ記事（docs）
========================= */

export type Blog = {
  title: string;
  description?: string;
  content: string;
  thumbnail?: MicroCMSImage;

  // 参照（複数）想定
  category?: Category[];

  // 参照（複数）想定：コマンド解説側で使う
  comgr?: CommandGroup[];

  // ★Startガイド用：microCMSに数値フィールドを追加したら使う
  order?: number;

  // ★将来 slug フィールドを追加したいならここ（今はid運用でもOK）
  slug?: string;
} & MicroCMSListContent;

const DOCS_ENDPOINT = "docs";

export const getBlogList = async (queries?: MicroCMSQueries) => {
  return client.getList<Blog>({
    endpoint: DOCS_ENDPOINT,
    queries,
  });
};

export const getBlogDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return client.getListDetail<Blog>({
    endpoint: DOCS_ENDPOINT,
    contentId,
    queries,
  });
};

/**
 * スタートガイド用：カテゴリで絞り込み、order順で取得
 * startCategoryId は microCMS の categories の「スタートガイド」カテゴリIDを渡す想定
 *
 * 例）filters: category[contains]xxxxxx
 */
export const getStartGuideList = async (
  startCategoryId: string,
  queries?: MicroCMSQueries
) => {
  return client.getList<Blog>({
    endpoint: DOCS_ENDPOINT,
    queries: {
      filters: `category[contains]${startCategoryId}`,
      orders: "order",
      ...queries,
    },
  });
};

/* =========================
   Settings
========================= */

export interface Settings {
  title: string;
  description: string;
  about: string;
}

const DEFAULT_SETTINGS: Settings = {
  title: "Set Your Title Here",
  description: "Set Your Description Here",
  about: "Set Your Text Here",
};

export const getSettings = async (): Promise<Settings> => {
  try {
    const data = await client.get({ endpoint: "settings" });
    return data as Settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
};
