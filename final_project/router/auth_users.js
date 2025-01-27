const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

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

// Solo los usuarios registrados pueden iniciar sesión
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Nombre de usuario y contraseña son requeridos" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username: username }, 'fingerprint_customer', { expiresIn: '1h' });
    req.session.token = accessToken;
    return res.status(200).json({ message: "Inicio de sesión exitoso", token: accessToken });
  } else {
    return res.status(401).json({ message: "Nombre de usuario o contraseña incorrectos" });
  }
});

// Agregar o modificar una reseña de un libro
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username;

  if (!review) {
    return res.status(400).json({ message: "Se requiere una reseña" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;
  return res.status(200).json({ message: "Reseña agregada/modificada con éxito" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
