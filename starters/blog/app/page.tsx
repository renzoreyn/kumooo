"use client";

import Link from "next/link";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, FadeIn, Stagger } from "@kumooo/ui";
import { posts } from "../lib/posts";

export default function BlogHome() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <FadeIn>
        <Badge variant="secondary">Blog starter</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Field notes</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">MDX-ready shape. Plain TS posts for zero config.</p>
      </FadeIn>
      <Stagger className="mt-10 grid gap-4">
        {posts.map((post) => (
          <Card key={post.slug}>
            <CardHeader>
              <CardDescription>{post.date}</CardDescription>
              <CardTitle>
                <Link href={`/posts/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </Stagger>
    </main>
  );
}
