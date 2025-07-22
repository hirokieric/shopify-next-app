import Home from "./client.page";

export default async function Page({
  params,
  searchParams,
}: {
  params: any;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // we can perform some checks to see if the app has been installed and that it is still valid
  const awaitedSearchParams = await searchParams;
  const { shop, host } = awaitedSearchParams;
  if (!shop || !host) {
    return <h1>Missing Shop and Host Parameters</h1>;
  }

  // now we can use the new managed app bridge, so we don't need to
  // worry about checking if the app is installed or not
  return <Home />;
}
