import { EmptyState, PageHeader } from "../../components/ui";

export function PlaceholderPage({ title, body }: { title: string; body: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState title="Next up" body={body} />
    </>
  );
}
