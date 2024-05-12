console.log("Let's Play Standing Scraper!");

const trs = document.getElementsByTagName("tr")
console.log(trs);
for (let i = 1; i < trs.length; i++) {
    const tableRow = trs[i];
    console.log(tableRow.cells[1]);
}