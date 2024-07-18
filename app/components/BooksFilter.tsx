"use client";
import Link from "next/link";
import { useState } from "react";

type Props = {
  elements: any[];
};

export default function BooksFilter({ elements }: Props) {
  const [search, setSearch] = useState("");

  return (
    <>
      <h1 className="text-xl text-right">البحث: </h1>
      <input
        placeholder="اسم الكتاب"
        onChange={(e) => setSearch(e.target.value)}
        className="search__input"
      />

      {elements.map((element) => {
        if (element.title.includes(search)) {
          return (
            <div className="mb-12">
              <Link
                href={`/book?url=${element.href}&title=${element.title}`}
                className="book"
                key={element.href}
              >
                <h3 className="text-xl">
                  {element.title} - {element.author}
                </h3>
              </Link>

              <p className="pt-1 pb-3 text-white">{element.description}</p>
            </div>
          );
        }
      })}
    </>
  );
}
