const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const fs = require('fs');  // Añadir el módulo fs para escribir en el archivo
let books = require('./router/booksdb.js');  // Asegúrate de que esta ruta es correcta

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

// Ruta para registrar un nuevo usuario
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Nombre de usuario y contraseña son requeridos" });
  }

  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "El nombre de usuario ya existe" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "Usuario registrado con éxito" });
});

// Ruta para iniciar sesión
app.post("/customer/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) { // Corrección aquí
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

// Ruta para agregar o modificar una reseña de un libro
app.put("/customer/auth/review/:isbn", (req, res) => {
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

  book.reviews[username] = review; // Guardando la reseña en el campo correcto 'reviews'
  
  // Guardar la variable 'books' en el archivo 'booksdb.js'
  fs.writeFile('./router/booksdb.js', 'let books = ' + JSON.stringify(books, null, 2) + ';\n\nmodule.exports = books;', (err) => {
    if (err) {
      return res.status(500).json({ message: "Error al guardar la reseña" });
    }

    return res.status(200).json({ message: "Reseña agregada/modificada con éxito" });
  });
});

// Ruta para eliminar una reseña de un libro
app.delete("/customer/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  const book = books[isbn];
  if (!book || !book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Reseña no encontrada" });
  }

  delete book.reviews[username]; // Eliminar la reseña

  // Guardar la variable 'books' en el archivo 'booksdb.js'
  fs.writeFile('./router/booksdb.js', 'let books = ' + JSON.stringify(books, null, 2) + ';\n\nmodule.exports = books;', (err) => {
    if (err) {
      return res.status(500).json({ message: "Error al eliminar la reseña" });
    }

    return res.status(200).json({ message: "Reseña eliminada con éxito" });
  });
});

// Nueva ruta para obtener las reseñas de un libro
app.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: "Libro no encontrado" });
  }
});

// Ruta para obtener la lista de usuarios registrados
app.get("/users", (req, res) => {
  return res.status(200).json(users);
});

const PORT = 5000;
app.listen(PORT, () => console.log("Server is running at port " + PORT));
