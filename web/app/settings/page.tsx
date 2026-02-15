import SettingsForm from "./client.page";

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ shop?: string; host?: string }>;
};

export default async function SettingsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { shop, host } = searchParams;
  if (!shop || !host) {
    return <h1>Missing Shop and Host Parameters</h1>;
  }

  return <SettingsForm />;
}
