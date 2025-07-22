import ClientNewPage from "./client";

export default async function Page({
  params,
  searchParams,
}: {
  params: any;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const awaitedSearchParams = await searchParams;
  const { shop, host } = awaitedSearchParams;
  if (!shop || !host) {
    return <h1>Missing Shop and Host Parameters</h1>;
  }

  return <ClientNewPage />;
}
