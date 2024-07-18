"use server";
import * as puppeteer from "puppeteer";

export async function getCategories() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://shamela.ws/#categories");
  const elements = await page.$$(".list-group .list-group-item.cat_title");

  const results = await Promise.all(
    elements.map(async (element) => {
      const innerText = await element.evaluate((node: any) => node.innerText);
      const href = await element.evaluate((node: any) => node.href);

      return { innerText, href };
    })
  );

  await browser.close();

  return results;
}

export async function getBooksList({ url }: { url: string }) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url);
  const elements = await page.$$("#cat_books .book_item");

  const result: {
    title: string;
    href: string;
    author: string;
    description: string;
  }[] = [];

  await Promise.all(
    elements.map(async (element) => {
      const bookLinkAndTitle = await element.$eval(
        ".book_title",
        (node: any) => {
          return { href: node.href, title: node.innerText };
        }
      );

      const author = await element.$eval(".book_title + a", (node: any) => {
        return node.innerText;
      });

      const description = await element.$eval("p", (node: any) => {
        return node.innerText;
      });

      result.push({ ...bookLinkAndTitle, author, description });
    })
  );

  await browser.close();

  return result;
}

export async function getBookDetails({ url }: { url: string }) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let result;

  if (url) {
    await page.goto(url);

    const title = await page.$eval(".text-primary", (node: any) => {
      return node.innerText;
    });

    result = { title };
  } else {
    result = { title: "عذرًا رابط الكتاب غير متوفر" };
  }

  browser.close();

  return result;
}
