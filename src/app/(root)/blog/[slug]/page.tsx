import { ArrowLeft, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaSection } from '@/components/common/CtaSection';
import {
  getBlogPostBySlug,
  getBlogPosts,
  getRelatedPosts,
} from '@/data/blogPosts';
import { formatDateAndTime } from '@/helpers/date.helpers';
import { BlogCard } from '@/sections/blog';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getBlogPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) return { title: 'Post Not Found | Homesphere' };

  return {
    title: `${post.title} | Homesphere Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  const { date } = formatDateAndTime(new Date(post.publishedAt));
  const relatedPosts = getRelatedPosts(slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="py-32">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-2 font-secondary text-brand-primary text-sm hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-1.5 font-medium font-secondary text-brand-primary text-sm">
              {post.category}
            </span>

            <h1 className="mb-4 font-bold font-primary text-3xl text-gray-900 sm:text-4xl md:text-5xl">
              {post.title}
            </h1>

            <div className="mb-8 flex items-center gap-3 font-secondary text-gray-500 text-sm">
              <span>By {post.author}</span>
              <span aria-hidden="true">·</span>
              <span>{date}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTimeMinutes} min read
              </span>
            </div>
          </div>

          <div className="relative mx-auto mb-12 h-72 max-w-4xl overflow-hidden rounded-2xl shadow-lg sm:h-96">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            {post.content.map(paragraph => (
              <p
                key={paragraph.slice(0, 40)}
                className="font-secondary text-gray-700 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="pb-20">
          <div className="container mx-auto px-6 lg:px-16">
            <h2 className="mb-8 font-bold font-primary text-2xl text-gray-900">
              More from the blog
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map(related => (
                <BlogCard key={related.slug} post={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection
        title="Ready to find your next home?"
        description="Browse verified listings from trusted landlords across the country."
      />
    </div>
  );
}
