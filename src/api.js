const { Router } = require('express');
const path = require('path');
const multer = require('multer');
const { users, files } = require('./db');

const router = Router();

const authMiddleware = (req, res, next) => {
  const found = users.find((user) => user.id === +req.cookies.auth);

  if (!found) {
    return res.status(401).json({ message: 'Unauthorised' });
  }

  next();
};

router.post('/signup', (req, res) => {
  const { username, password, repeat_password } = req.body;

  // verify all necessary fields
  if (!username || !password || !repeat_password) {
    return res.status(400);
  }

  // check passwords
  if (password !== repeat_password) {
    return res.status(400).send({
      message: 'Passwords are not the same',
    });
  }

  // if username already exist
  const found = users.find((user) => user.username === username);
  if (found) {
    return res.status(400).send({
      message: 'User already exist',
    });
  }

  // add new user
  users.push({
    id: Date.now(),
    username,
    password,
  });

  // redirect to home
  res.status(201).redirect('/');
});

router.post('/signin', (req, res) => {
  const { username, password } = req.body;

  // verify all necessary fields
  if (!username || !password) {
    return res.status(400);
  }

  // if username already exist
  const found = users.find(
    (user) => user.username === username && user.password === password
  );
  if (!found) {
    return res.status(400).send({
      message: 'User not found',
    });
  }

  res.cookie('auth', found.id, {
    //httpOnly: true,
    sameSite: 'strict',
    // maxAge: 100,
    path: '/',
  });

  // redirect to home
  res.status(200).redirect('/');
});

router.get('/logout', (req, res) => {
  res.clearCookie('auth').status(200).redirect('/');
});

router.get('/file/:id', authMiddleware, (req, res) => {
  const fileId = req.params.id;
  const found = files.find((file) => file.filename === fileId);

  if (!found) {
    return res.status(404).json({
      message: 'File not found',
    });
  }

  if (found.userId !== req.cookies.auth) {
    return res.status(403).json({
      message: 'Access Denied',
    });
  }

  const file = path.resolve(__dirname, '..', 'upload-files', found.filename);
  res.download(file, found.originalname);
});

const upload = multer({
  dest: './upload-files/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5mb,
  },
}).single('file');

router.post('/upload', authMiddleware, (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({
        message: err,
      });
    }

    const found = files.find(
      (file) => file.originalname === req.file.originalname
    );

    if (!found) {
      // Everything went fine.
      files.push({
        id: Date.now(),
        filename: req.file.filename,
        originalname: req.file.originalname,
        fileSize: req.file.size,
        userId: req.cookies.auth,
        date: new Date(),
      });
    }

    res.status(200).redirect('/');
  });
});

module.exports = router;
