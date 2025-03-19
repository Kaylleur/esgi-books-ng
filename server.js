const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const jwtSecretAccess = "un secret très très secret";
const jwtSecretRefresh = "un secret encore plus secret";

const app = express();
const port = 3000;
app.use(cors());
app.use(cookieParser());
app.use(express.json());

function checkBearerToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid Authorization format" });
  }
  jwt.verify(parts[1], jwtSecretAccess, (err, decoded) => {
    if (err) {
      // Token invalide ou expiré
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    next();
  });
}

let books = require("./books.json").map((book, index) => ({
  ...book,
  id: index,
}));
let currentId = books.length;

app.get("/api/books", checkBearerToken, (req, res) => {
  return res.status(200).json(books);
});

app.get("/api/books/:id", checkBearerToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const bookFound = books.find((liv) => liv.id === id);

  if (!bookFound) {
    return res.status(404).json({ message: "Book non trouvé" });
  }

  return res.status(200).json(bookFound);
});

app.post("/api/books", checkBearerToken, (req, res) => {
  const { title, author } = req.body;
  if (!title) {
    return res.status(400).json({ message: '"title" is required' });
  }
  if (!author) {
    return res.status(400).json({ message: '"author" is required' });
  }

  const newBook = {
    id: currentId++,
    ...req.body,
  };

  books.push(newBook);
  return res.status(201).json(newBook);
});

app.put("/api/books/:id", checkBearerToken, (req, res) => {
  const id = parseInt(req.params.id, 10);

  const indexBook = books.findIndex((liv) => liv.id === id);

  if (indexBook === -1) {
    return res.status(404).json({ message: "Livre non trouvé" });
  }

  Object.assign(books[indexBook], req.body);

  return res.status(200).json(books[indexBook]);
});

app.delete("/api/books/:id", checkBearerToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const indexBook = books.findIndex((liv) => liv.id === id);

  if (indexBook === -1) {
    return res.status(404).json({ message: "Book non trouvé" });
  }

  books.splice(indexBook, 1);
  return res.status(204).send();
});

//*******************************************************
//**************** auth *********************************
//*******************************************************

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "admin@localhost" && password === "admin") {
    return sendTokens(res, email);
  } else {
    return res.status(401).json({ message: "Identifiants incorrects" });
  }
});

app.get("/api/auth/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "refreshToken manquant" });
  }

  jwt.verify(refreshToken, jwtSecretRefresh, (err, decoded) => {
    if (err) {
      // Token invalide ou expiré
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    console.log(decoded);
    sendTokens(res, decoded.email);
  });
});

function sendTokens(res, email) {
  const refreshToken = jwt.sign({ email }, jwtSecretRefresh, {
    expiresIn: "1d",
  });
  const accessToken = jwt.sign({ email }, jwtSecretAccess, { expiresIn: "2m" });
  return res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // Durée de vie du cookie en ms (ici 1 jour)
    })
    .json({ accessToken });
}

app.listen(port, () => console.log(`Serveur démarré sur le port ${port}`));

// à installer
// npm install express cors cookie-parser jsonwebtoken
// faire le proxy
// changer les appels pour enlever le domaine et mettre le /api
