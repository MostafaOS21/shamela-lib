import { NextRequest, NextResponse } from "next/server";
import * as puppeteer from "puppeteer";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { btoa } from "buffer";
import { redirect } from "next/navigation";

const fontsPath = path.join(process.cwd(), "public", "fonts");
const fontFace = `
    @font-face {
      font-family: 'Calibri';
      font-style: normal;
      font-weight: 400;
      src: url(${path.join(fontsPath, "Calibri.woff")}) format('woff')
      url(${path.join(fontsPath, "Calibri.woff2")}) format('woff2');
    }
  `;

const mainTemplate = (content: string, styles: string) => {
  return `
    <html dir="rtl">
      <head>

        <style>
        ${fontFace}
          * {
            font-family: 'Amiri', serif;
            font-family: 'Noto Naskh Arabic', serif;
            font-family: 'Calibri';
          }

          ${styles}
        </style>
      </head>
      <body>
        <div class="nass">${content}</div>
      </body>
    </html>
  `;
};

const createBlankTitlePage = (mainTitle: string) => {
  const styles = `
    .container {
      height: 100vh;
      background: red;
    }
    .nass {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    h1 {
      font-size: 3em;
      font-weight: 400;
      margin: 0;
    }
  `;
  const content = `
  <container>
    <h1>${mainTitle}</h1>
  </container>
  `;

  return mainTemplate(content, styles);
};

const createContent = (nass: string, titles: { main: string; sub: string }) => {
  const styles = `
    .nass {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .titles__main__and__sub {
      position: relative;
      font-size: 1em;
      padding: 1.2em;
      margin-bottom: 30px;
    }

    p {
      font-size: 1.3em;
      margin: 10px 0px;
    }

    p:last-child {
      position: relative;
      padding: 1.2em;
      font-size: 1em;
      margin-top: auto;
    }

    p:last-child::before {
      top: 0
    }

    .titles__main__and__sub::after {
      bottom: 0
    }

    p:last-child::before,
    .titles__main__and__sub::after {
      content: "";
      position: absolute;
      left: 0;
      width: 100%;
      height: 1px;
      background-image: -webkit-linear-gradient(left, transparent, rgba(0, 0, 0, 0.2), transparent);
      background-image: -moz-linear-gradient(left, transparent, rgba(0, 0, 0, 0.2), transparent);
      background-image: -ms-linear-gradient(left, transparent, rgba(0, 0, 0, 0.2), transparent);
      background-image: -o-linear-gradient(left, transparent, rgba(0, 0, 0, 0.2), transparent);
      background-image: linear-gradient(left, transparent, rgba(0, 0, 0, 0.2), transparent);
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#d6d6d6', endColorstr='#d6d6d6',GradientType=0 );
    }

    
  `;

  const content = `
    <div class="titles__main__and__sub">${titles.main}: ${titles.sub}</div>
    ${nass.replace("<hr>", "")}
  `;

  return mainTemplate(content, styles);
};

export async function GET(req: NextRequest, res: NextResponse) {
  const url = new URL(req.url);
  const limit = url.searchParams.get("limit") || "MAX";
  const bookUrl = url.searchParams.get("url");
  const bookTitle = url.searchParams.get("title");
  // const savePath = path.join(process.cwd(), "public", "output", `output.pdf`);

  // Merge PDF
  const resultPDF = await PDFDocument.create();

  // Puppeteer PDF
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  let titles = {
    main: "",
    sub: "",
  };
  let i = 1;
  const end = Number.isNaN(+limit) ? Number.MAX_SAFE_INTEGER : +limit;
  while (i <= end) {
    await page.goto(`${bookUrl}/${i}`);
    const mainFahresTitle = await page.$(".s-nav-head + ul > li > a.active");
    const subFahresTitle = await page.$(
      ".s-nav-head + ul > li > a + ul a.active"
    );

    console.log("Current Page:", i);

    if (mainFahresTitle) {
      const newMainTitle =
        (await page.evaluate((el) => el.textContent, mainFahresTitle)) || "";

      if (newMainTitle && newMainTitle !== titles.main) {
        titles.main = newMainTitle;
        const titlePage = createBlankTitlePage(titles.main);

        await page.setContent(titlePage, { waitUntil: "networkidle2" });
        const pdfCurrentPage = await page.pdf({
          format: "Letter",
          margin: {
            top: "4px",
            bottom: "4px",
            left: "20px",
            right: "20px",
          },
          printBackground: true,
        });

        const pdfDoc = await PDFDocument.load(pdfCurrentPage);
        const copiedPages = await resultPDF.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        copiedPages.forEach((page) => {
          resultPDF.addPage(page);
        });
        continue;
      }
    }

    if (subFahresTitle) {
      const newSubFahresTitle = await page.evaluate(
        (el) => el.textContent,
        subFahresTitle
      );
      titles.sub = newSubFahresTitle || "";
    }

    const nass = await page.$eval(".nass", (node) => node.innerHTML);

    const content = createContent(nass, titles);

    await page.setContent(content, { waitUntil: "networkidle2" });

    const pdfCurrentPage = await page.pdf({
      format: "Letter",
      margin: {
        top: "4px",
        bottom: "4px",
        left: "20px",
        right: "20px",
      },
      printBackground: true,
    });

    const pdfDoc = await PDFDocument.load(pdfCurrentPage);
    const copiedPages = await resultPDF.copyPages(
      pdfDoc,
      pdfDoc.getPageIndices()
    );
    copiedPages.forEach((page) => {
      resultPDF.addPage(page);
    });

    const elementExists = (await page.$("div input + button")) !== null;
    if (elementExists) {
      break;
    }
    i++;
  }

  const pdfBytes = await resultPDF.save();
  // fs.writeFileSync(savePath, pdfBytes);

  browser.close();
  // let binaryString = "";
  // pdfBytes.forEach((byte) => {
  //   binaryString += String.fromCharCode(byte);
  // });

  // const pdfLink = "data:application/pdf;base64," + btoa(binaryString);
  const blob = new Blob([pdfBytes], {
    type: "application/octet-stream",
  });

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename=outpu${bookTitle}.pdf`,
    },
  });
}
