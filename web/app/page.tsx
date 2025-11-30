import Home from "./client.page";

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ shop?: string; host?: string }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  // we can perform some checks to see if the app has been installed and that it is still valid
  const { shop, host } = searchParams;
  if (!shop || !host) {
    return <h1>Missing Shop and Host Parameters</h1>;
  }

  // now we can use the new managed app bridge, so we don't need to
  // worry about checking if the app is installed or not
  return <Home />;
}
