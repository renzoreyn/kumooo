"use client";

import { ArrowRightIcon } from "@kumooo/ui";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, CodeBlock, FadeIn } from "@kumooo/ui";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <FadeIn>
        <p className="text-sm font-medium tracking-wide text-[hsl(var(--muted-foreground))]">kumooo.js</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Blank starter</h1>
        <p className="mt-3 max-w-xl text-[hsl(var(--muted-foreground))]">
          Next.js App Router, @kumooo/ui (shadcn-style + Kibo patterns + Radix Icons + Framer Motion). Build any site
          from here.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <a href="https://github.com/renzoreyn/kumooo">
              Get started <ArrowRightIcon />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://www.kibo-ui.com">Kibo UI</a>
          </Button>
        </div>
      </FadeIn>
      <FadeIn delay={0.12}>
        <Card>
          <CardHeader>
            <CardTitle>Ship something</CardTitle>
            <CardDescription>Replace this page. Keep the kit.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="bash" code={`npx create-kumooo my-app\ncd my-app\npnpm dev`} />
          </CardContent>
        </Card>
      </FadeIn>
    </main>
  );
}
