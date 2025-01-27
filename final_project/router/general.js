const express = require('express');
const axios = require('axios'); // Importar Axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Obtener la lista de libros disponibles en la tienda utilizando async-await con Axios
public_users.get('/', async function (req, res) {
  try {
    // Simular una llamada de API para obtener libros
    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;
    return res.status(200).json(JSON.stringify(books, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener la lista de libros", error: error.message });
  }
});

// Obtener detalles de un libro basado en ISBN utilizando async-await con Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    // Simular una llamada de API para obtener los detalles del libro
    const response = await axios.get(`http://localhost:5000/books/${isbn}`);
    const book = response.data;
    return res.status(200).json(JSON.stringify(book, null, 2));
  } catch (error) {
    return res.status(500).json({ message: `Error al obtener los detalles del libro con ISBN ${isbn}`, error: error.message });
  }
});

// Obtener detalles de un libro basado en autor utilizando async-await con Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    // Simular una llamada de API para obtener los detalles del libro por autor
    const response = await axios.get(`http://localhost:5000/books/author/${author}`);
    const booksByAuthor = response.data;
    return res.status(200).json(JSON.stringify(booksByAuthor, null, 2));
  } catch (error) {
    return res.status(500).json({ message: `Error al obtener los detalles del libro por autor ${author}`, error: error.message });
  }
});

// Obtener detalles de un libro basado en título utilizando async-await con Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    // Llamada de API para obtener los detalles del libro por título
    const response = await axios.get(`http://localhost:5000/books/title/${title}`);
    const booksByTitle = response.data;
    return res.status(200).json(JSON.stringify(booksByTitle, null, 2));
  } catch (error) {
    return res.status(500).json({ message: `Error al obtener los detalles del libro por título ${title}`, error: error.message });
  }
});

// Obtener reseña de un libro
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
