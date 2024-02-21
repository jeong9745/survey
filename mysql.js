const mysql = require('mysql2');
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'survey',
    port: '3306'
});

const dbName = 'survey';

// 데이터베이스 생성
connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (error) => {
    if (error) throw error;
    // 데이터베이스 선택
    connection.query(`USE ${dbName}`, (error) => {
        if (error) throw error;
        // Survey 테이블 생성
        connection.query(`
            CREATE TABLE IF NOT EXISTS Survey (
                id INT AUTO_INCREMENT PRIMARY KEY,
                Q1_1 VARCHAR(1),
                Q1_2 VARCHAR(1),
                Q1_3 VARCHAR(1),
                Q1_4 VARCHAR(1),
                Q1_5 VARCHAR(1),
                Q1_6 VARCHAR(1),
                Q1_7 VARCHAR(1),
                Q1_8 VARCHAR(1),
                Q1_9 VARCHAR(1)
            )
        `, (error) => {
            if (error) throw error;
            console.log('Database and table created!');
        });
    });
});


const port = 3007;
const app = express();
app.use(bodyParser.urlencoded({
    extended: false,
}));

app.use(express.static('main_html'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    connection.connect();
});

app.get('/', (_, response) => {
    fs.readFile('main_html/survey.html', 'utf-8', (error,data) => {
      if(error) throw error;
      response.send(data);
    });
  });


const createTableQuery = `
  CREATE TABLE IF NOT EXISTS survey (
    ${[...Array(9).keys()].map(i => `1_${i + 1} INT`).join(', ')},
    ${[...Array(10).keys()].map(i => `2_${i + 1} INT`).join(', ')},
    ${[...Array(7).keys()].map(i => `3_${i + 1} INT`).join(', ')}
  )
`;

connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error('테이블 생성 오류: ' + err.stack);
      return;
    }
    console.log('테이블이 성공적으로 생성되었습니다.');
  });

  app.post('/submit', (request, response) => {
    const body = request.body;
    const ValOrDef = (key, defV = 0) => (body[key] !== undefined ? body[key] : defV);
  
    const ch1 = Array.from({ length: 9 }, (_, i) => ValOrDef(`ch1-${i + 1}`));
    const ra2 = Array.from({ length: 10 }, (_, i) => ValOrDef(`ra2-${i + 1}`));
    const ra3 = Array.from({ length: 7 }, (_, i) => ValOrDef(`ra3-${i + 1}`));
  
    // 각 섹션에 대한 결과
    console.log('Section 1:', ch1);
    console.log('Section 2:', ra2);
    console.log('Section 3:', ra3);

    const columns = [...Array(9).keys()].map(i => `1_${i + 1}`).concat([...Array(10).keys()].map(i => `2_${i + 1}`)).concat([...Array(7).keys()].map(i => `3_${i + 1}`));
    const values = [...ch1, ...ra2, ...ra3];

    connection.query(
        `INSERT INTO survey (${columns.join(', ')}) VALUES (${values.map(_ => '?').join(', ')})`,
        values,
        (error, _) => {
          if (error) throw error;
          response.redirect('/');
      });
    });