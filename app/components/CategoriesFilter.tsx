"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  elements: any[];
};

export default function CategoriesFilter({ elements }: Props) {
  const [search, setSearch] = useState("");

  return (
    <>
      <h1 className="text-xl text-right">البحث: </h1>
      <input
        placeholder="اسم القسم"
        onChange={(e) => setSearch(e.target.value)}
        className="search__input"
      />
      {elements.map((category) => {
        if (category.innerText.includes(search)) {
          return (
            <Link
              href={`/cate?url=${category.href}`}
              key={category.href}
              className="cat__btn"
            >
              {category.innerText}
            </Link>
          );
        }
      })}
    </>
  );
}
