const fs = require('fs');
const path = require('path');

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const apiRouter = require('./api');
const { users, files } = require('./db');

// read pages
const home = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const signup = fs.readFileSync(
  path.resolve(__dirname, '../signup.html'),
  'utf8'
);
const signin = fs.readFileSync(
  path.resolve(__dirname, '../signin.html'),
  'utf8'
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/assets', express.static(path.join(__dirname, '../public')));

// home page
app.get('/', (req, res) => {
  const userList = users
    .map((user) => {
      return `<li>${user.id}: ${user.username}</li>`;
    })
    .join('');
  const filesList = files
    .map((file) => {
      return `<tr>
      <td>${file.originalname}</td>
      <td>${file.fileSize} </td>
      <td>${file.date}</td>
      <td><a href="/api/file/${file.filename}" target="_blank">download</a></td>
      </tr>`;
    })
    .join('');
  let homePage = home.replace('{ users }', `<ul>${userList}</ul>`);
  homePage = homePage.replace(
    '{ files }',
    filesList || '<td colspan="4" class="no-data">No files</td>'
  );
  res.send(homePage);
});

// signup page
app.get('/signup', (req, res) => {
  res.send(signup);
});

// signup page
app.get('/signin', (req, res) => {
  res.send(signin);
});

// api
app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
