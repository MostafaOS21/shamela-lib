import { getBooksList } from "@/actions";
import BooksFilter from "../components/BooksFilter";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const res = await getBooksList({ url: `${searchParams?.url}` });

  return (
    <section>
      <h2>قائمة الكتب</h2>

      <div className="p-8">
        <BooksFilter elements={res} />
      </div>
    </section>
  );
}
