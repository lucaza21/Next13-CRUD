import TopicsList from "@/components/TopicsList";

export default function Home({ searchParams }) {
  const query = searchParams?.q || "";
  const page = Number(searchParams?.page) || 1;
  return <TopicsList query={query} page={page} />;
}
