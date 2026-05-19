import { ProcessingClient } from "./ProcessingClient";

export const metadata = { title: "Processing..." };

export default async function ProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProcessingClient id={id} />;
}
