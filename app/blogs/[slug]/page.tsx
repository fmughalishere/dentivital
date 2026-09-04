import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getBlogBySlug, getBlogs } from "@/lib/data";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Article not found" };
  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [blog.coverImage] : undefined,
      type: "article",
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const more = (await getBlogs()).filter((b) => b.slug !== blog.slug).slice(0, 3);

  return (
    <article className="pb-20">
      <div className="dv-container max-w-3xl pt-10">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs text-dv-ink-soft transition-colors hover:text-dv-coral-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to journal
        </Link>

        <header className="mt-6">
          {blog.tags?.length > 0 && (
            <p className="eyebrow text-dv-coral-600">{blog.tags.join(" · ")}</p>
          )}
          <h1 className="mt-3 font-display text-3xl leading-tight text-dv-teal-900 sm:text-4xl">
            {blog.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-dv-ink-soft">
            <span>{blog.author}</span>
            <span>{formatDate(blog.createdAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {blog.readMinutes || 4} min read
            </span>
          </div>
        </header>
      </div>

      {blog.coverImage && (
        <div className="dv-container mt-8 max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-dv-mint-100">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="dv-container mt-10 max-w-3xl">
        <div className="space-y-5 text-[15px] leading-relaxed text-dv-ink/85">
          {blog.content
            .split("\n")
            .map((p) => p.trim())
            .filter(Boolean)
            .map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
        </div>
      </div>

      {more.length > 0 && (
        <section className="dv-container mt-16 max-w-4xl border-t border-dv-line pt-10">
          <h2 className="font-display text-xl text-dv-teal-900">Keep reading</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {more.map((item) => (
              <li key={item._id}>
                <Link
                  href={`/blogs/${item.slug}`}
                  className="block rounded-2xl border border-dv-line bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <p className="font-display text-base leading-snug text-dv-teal-900">
                    {item.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-dv-ink-soft">{item.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
