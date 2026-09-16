import { Suspense } from "react";
import TopicsList from "@/components/TopicsList";
import SearchBar from "@/components/SearchBar";
import Loading from "./loading";

export const dynamic = "force-dynamic";

export default function Home({ searchParams }) {
  const query = searchParams?.q || "";
  const page = Number(searchParams?.page) || 1;
  return (
    <>
      <SearchBar initialQuery={query} />
      <Suspense key={`${query}-${page}`} fallback={<Loading />}>
        <TopicsList query={query} page={page} />
      </Suspense>
    </>
  );
}
