import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, posts } from "../../../lib/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-[hsl(var(--muted-foreground))] hover:underline">
        Back
      </Link>
      <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">{post.date}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{post.title}</h1>
      <p className="mt-6 text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">{post.body}</p>
    </main>
  );
}
