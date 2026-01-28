import type { APIRoute } from "astro";
import { getBlogList } from "@libs/microcms.ts";
import { microCMSRichEditorHandler } from "microcms-rich-editor-handler";

export const prerender = true;

function removeHeadings(html: string) {
  return html.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, " ");
}

function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export const GET: APIRoute = async () => {
  const PER_PAGE = 100;      // microCMS上限
  const MAX_TOTAL = 2000;    // 目標上限（安全のため）
  const BODY_MAX = 1000;     // 本文は先頭だけ

  let offset = 0;
  let all: any[] = [];

  while (true) {
    const { contents, totalCount } = await getBlogList({
      limit: PER_PAGE,
      offset,
    });

    all = all.concat(contents);

    offset += PER_PAGE;

    // totalCount が返ってくるならそれで止める
    if (offset >= totalCount) break;

    // 念のため上限
    if (all.length >= MAX_TOTAL) break;
  }

  const index = await Promise.all(
    all.map(async (p) => {
      let body = "";

      if (p?.content) {
        const { html } = await microCMSRichEditorHandler(p.content, {
          transformers: [],
          extractors: {},
        });
        const noHeadings = removeHeadings(html);
        body = htmlToText(noHeadings).slice(0, BODY_MAX);
      }

      return {
        id: p.id,
        title: p.title ?? "",
        description: p.description ?? "",
        category: p.category?.name ?? "",
        tags: (p.tags ?? []).map((t: any) => t.name).join(" "),
        body,
      };
    })
  );

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
