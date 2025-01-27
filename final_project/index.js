const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const fs = require('fs');
let books = require('./router/booksdb.js');
let public_users = require('./router/general.js').general;
let auth_users = require('./router/auth_users.js').authenticated;

const app = express();

let users = [
  { username: "Mario Quintero", password: "Yh65JH&%21" }
];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username && user.password === password);
  return !!user;
}

// Middleware de autenticación
app.use(express.json());
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).send('No autorizado');
  }
  const token = authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, 'fingerprint_customer', (err, user) => {
      if (err) {
        return res.status(403).send('Token inválido');
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    res.status(401).send('No autorizado');
  }
});

// Usar el enrutador público
app.use("/", public_users);

// Usar el enrutador de usuarios autenticados
app.use("/auth", auth_users);

// Ruta para obtener libros
app.get('/books', (req, res) => {
  res.status(200).json(books);
});

// Ruta para obtener detalles de libros basado en ISBN
app.get('/books/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Libro no encontrado" });
  }
});

// Ruta para obtener detalles de libros basado en el autor
app.get('/books/author/:author', (req, res) => {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
  if (booksByAuthor.length > 0) {
    res.status(200).json(booksByAuthor);
  } else {
    res.status(404).json({ message: "Libros no encontrados para el autor especificado" });
  }
});

// Ruta para obtener detalles de libros basado en el título
app.get('/books/title/:title', (req, res) => {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
  if (booksByTitle.length > 0) {
    res.status(200).json(booksByTitle);
  } else {
    res.status(404).json({ message: "Libros no encontrados para el título especificado" });
  }
});

// Puerto de escucha del servidor
const PORT = 5000;
app.listen(PORT, () => console.log("Server is running at port " + PORT));
