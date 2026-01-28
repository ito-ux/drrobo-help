import type { APIRoute } from "astro";
import { getBlogList } from "@libs/microcms.ts";

export const prerender = true;

export const GET: APIRoute = async () => {
  const { contents } = await getBlogList({ limit: 100 });

  const index = contents.map((p) => ({
    id: p.id,
    title: p.title ?? "",
    description: p.description ?? "",

    // 🔽 検索の賢さ用
    category: p.category?.name ?? "",
    tags: (p.tags ?? []).map((t) => t.name).join(" "),
  }));

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
