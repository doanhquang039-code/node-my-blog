const ExcelJS = require("exceljs");
const puppeteer = require("puppeteer");

class ReportService {
  async exportExcel(data, columns, sheetName) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = columns;
    worksheet.addRows(data);
    worksheet.getRow(1).font = { bold: true };
    return await workbook.xlsx.writeBuffer();
  }
  async exportPDF(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();
    return pdfBuffer;
  }
}
module.exports = new ReportService();
