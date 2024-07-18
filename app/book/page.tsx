import { getBookDetails } from "@/actions";
import DownloadBtn from "./DownloadBtn";

export default async function DownloadPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const title = searchParams?.title;

  return (
    <section className="flex flex-col gap-48">
      <h1>تحميل "{title}"</h1>

      <DownloadBtn
        bookUrl={`${searchParams?.url}`}
        bookTitle={searchParams?.title as string}
      />
    </section>
  );
}
