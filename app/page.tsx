import { getCategories } from "@/actions";
import Link from "next/link";
import CategoriesFilter from "./components/CategoriesFilter";

export default async function Home() {
  const res = await getCategories();

  return (
    <>
      <h1 id="title">مساعد المكتبة الشاملة</h1>
      <main>
        <h2>أقسام المكتبة</h2>
        <div className="container cats">
          <CategoriesFilter elements={res} />
        </div>
      </main>
    </>
  );
}
