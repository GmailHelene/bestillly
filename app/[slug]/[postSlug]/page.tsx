import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, posts } from "@/db/schema";
import { resolveTheme } from "@/lib/themes";
import { formatDateShort } from "@/lib/format";

// cache() dedupliserer kallet mellom generateMetadata og siden.
const getData = cache(async (slug: string, postSlug: string) => {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.slug, slug),
  });
  if (!business || business.status === "paused") return null;
  const post = await db.query.posts.findFirst({
    where: and(
      eq(posts.businessId, business.id),
      eq(posts.slug, postSlug),
      eq(posts.published, true),
    ),
  });
  if (!post) return null;
  return { business, post };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}): Promise<Metadata> {
  const { slug, postSlug } = await params;
  const data = await getData(slug, postSlug);
  if (!data) return { title: "Siden finnes ikke" };

  const description = data.post.content.slice(0, 155);
  return {
    title: `${data.post.title} — ${data.business.name}`,
    description,
    alternates: { canonical: `/${slug}/${postSlug}` },
    openGraph: {
      title: data.post.title,
      description,
      type: "article",
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}) {
  const { slug, postSlug } = await params;
  const data = await getData(slug, postSlug);
  if (!data) notFound();

  const { business, post } = data;
  const theme = resolveTheme(business.template);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.createdAt.toISOString(),
    author: { "@type": "Organization", name: business.name },
    url: `${baseUrl}/${business.slug}/${post.slug}`,
  };

  return (
    <div className="flex-1" style={{ backgroundColor: theme.pageBg }}>
      <main className="mx-auto w-full max-w-2xl space-y-5 px-5 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Link
          href={`/${business.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <span aria-hidden>←</span>
          {business.name}
        </Link>
        <header className="space-y-1">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: theme.headingFont, color: theme.accent }}
          >
            {post.title}
          </h1>
          <p className="text-sm text-gray-500">
            {formatDateShort(post.createdAt)}
          </p>
        </header>
        {post.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt=""
            className={`w-full object-cover ${theme.radius}`}
          />
        )}
        <div className="whitespace-pre-line leading-relaxed text-gray-700">
          {post.content}
        </div>
      </main>
    </div>
  );
}
