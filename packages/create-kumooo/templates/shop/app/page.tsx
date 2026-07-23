"use client";

import * as React from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FadeIn,
  Stagger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kumooo/ui";
import { products } from "../lib/catalog";

type BagItem = { id: string; name: string; price: string; qty: number };

export default function ShopHome() {
  const [bag, setBag] = React.useState<BagItem[]>([]);

  function add(p: (typeof products)[number]) {
    setBag((prev) => {
      const hit = prev.find((i) => i.id === p.id);
      if (hit) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  }

  const count = bag.reduce((n, i) => n + i.qty, 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <FadeIn className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>Shop starter</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Drop catalog</h1>
          <p className="mt-2 max-w-lg text-[hsl(var(--muted-foreground))]">
            Commerce-adjacent UI with a demo bag. Wire Stripe when you are ready. Demo only - no payment.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Bag ({count})</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bag</DialogTitle>
              <DialogDescription>Demo only - no payment.</DialogDescription>
            </DialogHeader>
            {bag.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Empty.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {bag.map((i) => (
                  <li key={i.id} className="flex justify-between gap-4">
                    <span>
                      {i.name} × {i.qty}
                    </span>
                    <span>{i.price}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button
              disabled={!bag.length}
              onClick={() => alert("Demo only - no payment.")}
            >
              Checkout
            </Button>
          </DialogContent>
        </Dialog>
      </FadeIn>

      <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>{p.blurb}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <span className="font-semibold">{p.price}</span>
              <Button size="sm" onClick={() => add(p)}>
                Add to bag
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stagger>
    </main>
  );
}
