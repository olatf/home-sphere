import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDateAndTime } from '@/helpers/date.helpers';
import type { BlogPost } from '@/types/blog';

export const BlogCard = ({ post }: { post: BlogPost }) => {
  const { date } = formatDateAndTime(new Date(post.publishedAt));

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2"
    >
      <div className="relative h-52 overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 font-medium font-secondary text-brand-primary text-xs">
          {post.category}
        </span>
      </div>

      <div className="p-6">
        <h3 className="mb-2 line-clamp-2 font-primary font-semibold text-gray-900 text-lg transition group-hover:text-brand-primary">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-2 font-secondary text-gray-600 text-sm">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-3 font-secondary text-gray-400 text-xs">
          <span>{date}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTimeMinutes} min read
          </span>
        </div>
      </div>
    </Link>
  );
};
