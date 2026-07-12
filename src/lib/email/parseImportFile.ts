import Papa from "papaparse";
import ExcelJS from "exceljs";

const MAX_ROWS = 5000;

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
  truncated: boolean;
}

export function parseCsvText(text: string): ParsedFile {
  const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  const headers = result.meta.fields ?? [];
  const rows = result.data.filter(Boolean);
  return { headers, rows: rows.slice(0, MAX_ROWS), truncated: rows.length > MAX_ROWS };
}

// Also used for "paste a list of names and emails directly" — pasted text is
// treated as CSV (handles comma or tab separated, with or without a header
// row auto-detected by papaparse).
export function parsePastedText(text: string): ParsedFile {
  return parseCsvText(text);
}

export async function parseXlsxBuffer(buffer: ArrayBuffer): Promise<ParsedFile> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return { headers: [], rows: [], truncated: false };

  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (c) => headers.push(String(c.value ?? "").trim()));

  const rows: Record<string, string>[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (rows.length >= MAX_ROWS) return;
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      const cellValue = row.getCell(i + 1).value;
      record[header] = cellValue === null || cellValue === undefined ? "" : String(cellValue).trim();
    });
    if (Object.values(record).some((v) => v !== "")) rows.push(record);
  });

  return { headers, rows, truncated: worksheet.rowCount - 1 > MAX_ROWS };
}
