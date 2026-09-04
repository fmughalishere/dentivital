import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Newspaper } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { getBlogs } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dentivital Blogs",
  description: "Oral care guides, ingredient deep-dives and whitening tips from the Dentivital team.",
};

export default async function BlogsPage() {
  const blogs = await getBlogs();
  const [lead, ...rest] = blogs;

  return (
    <>
      <section className="border-b border-dv-line bg-gradient-to-br from-dv-mint-100 to-dv-mint-50 py-14">
        <div className="dv-container max-w-3xl">
          <p className="eyebrow text-dv-coral-600">Dentivital Journal</p>
          <h1 className="mt-3 font-display text-4xl text-dv-teal-900 sm:text-5xl">
            Notes on whitening, enamel and gum health
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-dv-ink-soft sm:text-base">
            Practical, dentist-reviewed guidance to help you get the most from your routine.
          </p>
        </div>
      </section>

      <section className="dv-container py-12">
        {blogs.length === 0 ? (
          <EmptyState
            icon={<Newspaper className="h-5 w-5" />}
            title="No articles published yet"
            description="Run the seed script or publish an article to see it here."
          />
        ) : (
          <>
            {lead && (
              <Link
                href={`/blogs/${lead.slug}`}
                className="group mb-10 grid gap-6 overflow-hidden rounded-[1.75rem] border border-dv-line bg-white transition-all hover:shadow-lift md:grid-cols-2"
              >
                <div className="relative aspect-[16/10] bg-dv-mint-100 md:aspect-auto md:min-h-[320px]">
                  {lead.coverImage && (
                    <Image
                      src={lead.coverImage}
                      alt={lead.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-7 md:p-10">
                  <span className="eyebrow text-dv-coral-600">Latest</span>
                  <h2 className="mt-3 font-display text-2xl leading-snug text-dv-teal-900 sm:text-3xl">
                    {lead.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-dv-ink-soft">{lead.excerpt}</p>
                  <div className="mt-5 flex items-center gap-4 text-xs text-dv-ink-soft">
                    <span>{formatDate(lead.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {lead.readMinutes || 4} min read
                    </span>
                  </div>
                  <span className="dv-link-underline mt-5 inline-flex items-center gap-2 text-sm text-dv-teal-900">
                    Read article
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((blog) => (
                  <Link
                    key={blog._id}
                    href={`/blogs/${blog.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-dv-line bg-white transition-all hover:-translate-y-1 hover:shadow-lift"
                  >
                    <div className="relative aspect-[16/10] bg-dv-mint-100">
                      {blog.coverImage && (
                        <Image
                          src={blog.coverImage}
                          alt={blog.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="font-display text-lg leading-snug text-dv-teal-900">
                        {blog.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-dv-ink-soft">
                        {blog.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-dv-ink-soft">
                        <span>{formatDate(blog.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {blog.readMinutes || 4} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
