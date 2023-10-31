const exceljs = require('exceljs');
const xlsx = require('xlsx');
var express = require('express');
const cors = require('cors');


const Model = require('./db');

const fs = require('fs');
const { Op } = require('sequelize');

var app = express();
// Excel file path
const excelFilePath = './test.xlsx';
const configFilePath = './last.json';

async function importData() {
  try {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    const worksheet = workbook.getWorksheet(1);

    let lastImportedTimestamp = fs.existsSync(configFilePath)
      ? JSON.parse(fs.readFileSync(configFilePath))
      : null;

    const dateObject = new Date(lastImportedTimestamp.timestamp);

    let nextTime = null;

    var arr = [];
    function calculateData(row, prevRow, count, maxCount, maxNumber) {
      if (count === maxCount) {
        arr.push(maxNumber)
        return maxNumber;
      }
      const current = row.getCell(count).value;
      const previous = prevRow.getCell(count).value;

      const rc = Math.abs((current - previous) / (current + previous));

      const deformation = Math.abs((0.0188 * rc) - 0.0142);
      if (deformation > maxNumber) {
        maxNumber = deformation;
      }

      return calculateData(row, prevRow, count + 1, maxCount, maxNumber);
    }

    const workbook2 = xlsx.readFile('./test.xlsx');
    const sheetName = 'Sheet1';

    const worksheet2 = workbook2.Sheets[sheetName];

    const range = xlsx.utils.decode_range(worksheet2['!ref']);

    const rowCount = range.e.r - range.s.r + 1;

    console.log(`Total rows in ${sheetName}: ${rowCount}`);

    for (let rowNumber = rowCount; rowNumber >= 9; rowNumber--) {
      const row = worksheet.getRow(rowNumber);
      const prevRow = worksheet.getRow(rowNumber - 8);

      const timestamp = row.getCell(1).value; 

      if (timestamp > dateObject) {
        if (!nextTime) {
          nextTime = timestamp;
        }

        const current = 16;
        await Promise.all([
          calculateData(row, prevRow, current, current + 30, 0),
          calculateData(row, prevRow, current + 30, current + 60, 0),
          calculateData(row, prevRow, current + 60, current + 90, 0),
          calculateData(row, prevRow, current + 90, current + 110, 0),
          calculateData(row, prevRow, current + 110, current + 140, 0),
          calculateData(row, prevRow, current + 140, current + 170, 0),
          calculateData(row, prevRow, current + 170, current + 200, 0),
          calculateData(row, prevRow, current + 200, current + 240, 0),
        ]);

        if (arr.length > 0) {
          const deformation = Math.max(...arr);

          const cable_number = row.getCell(3).value;
          let cable_name = "default";


          switch (cable_number) {
            case 1001:
              cable_name = "cable 1";
              break;
            case 2001:
              cable_name = "cable 2";
              break;
            case 3001:
              cable_name = "cable 3";
              break;
            case 4001:
              cable_name = "cable 4";
              break;
            case 5001:
              cable_name = "cable 5";
              break;
            case 6001:
              cable_name = "cable 6";
              break;
            case 7001:
              cable_name = "cable 7";
              break;
            case 8001:
              cable_name = "cable 8";
              break;
            default:
              cable_name = "default";
          }

          const velocity = (deformation / (5 * 60));
         
          const obj = {
            cable: cable_name,
            timestamp: timestamp,
            inverse_velocity: 1 / velocity,
            deformation: deformation
          }

          const cr =await Model.create(obj);
          arr = []
        }
      } else {
        return;
      }


    }

    console.log("---NEXT--", nextTime);
    if (nextTime) {
      fs.writeFileSync(configFilePath, JSON.stringify({
        "timestamp": nextTime
      }));
    }

  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(400).json({
      code:400,
      error : error.message
    })
  }
}


app.use(cors({
  origin: 'http://localhost:19006',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));


app.get("/", (req, res) => {
  res.send("WELCOME TO MY PROJECT");
});

app.get("/loadData", async (req, res) => {
  await importData();
  return res.status(200).json({
    code: 200,
    data: "loaded"
  })
});

app.get("/getData" , async(req, res)=>{
  const data = req.query;
  if(!data.cable_name){
    return res.status(400).json({
      code:400,
      error: "cable_name is missing"
    })
  }

  const whereObj ={
    cable: data.cable_name
  }

  if(data.start_time && data.end_time){
    whereObj.timestamp= {
      [Op.between]:[data.start_time , data.end_time]
    }
  }

  const result = await Model.findAll({
    where:whereObj,
    order:[["timestamp" , "DESC"]]
  });

  return res.status(200).json({
    code:200,
    data:result
  })

})

app.listen(process.env.PORT, () => {
  console.log('App listening on port 4000')
});
