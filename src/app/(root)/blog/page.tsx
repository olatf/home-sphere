import { getBlogPosts } from '@/data/blogPosts';
import { BlogCard, BlogHero } from '@/sections/blog';

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHero />

      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
