const xlsx = require('xlsx');

// Replace 'your-excel-file.xlsx' with the path to your Excel file
const workbook2 = xlsx.readFile('./test.xlsx');

// Specify the sheet name or index you want to count rows in
const sheetName = 'Sheet1'; // Change this to the actual sheet name or index

// Get the worksheet
const worksheet2 = workbook2.Sheets[sheetName];

// Calculate the range of cells in the worksheet
const range = xlsx.utils.decode_range(worksheet2['!ref']);

// Calculate the total number of rows in the worksheet
const rowCount = range.e.r - range.s.r + 1;

console.log(`Total rows in ${sheetName}: ${rowCount}`);