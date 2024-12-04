// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjtHjEhTHKWhWxX-7d-7lu9iUWtGea1HM",
  authDomain: "bookfairmtu.firebaseapp.com",
  projectId: "bookfairmtu",
  storageBucket: "bookfairmtu.appspot.com",
  messagingSenderId: "247257573786",
  appId: "1:247257573786:web:f921cb5455b07653843223",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Document ready function
$(document).ready(function () {
  // Initialize Materialize components
  $(".sidenav").sidenav();
  fetchSpecialAuthorsAndBooks();

  // Attach search functionality
  attachBookSearch();
});

// Attach search functionality for books
function attachBookSearch() {
  const bookSearchInput = document.getElementById("bookSearch");
  const bookResultsTable = document.getElementById("bookResultsTable");

  let booksCache = []; // Cache to store all books from Firestore
  let filteredBooks = []; // Cache for filtered results
  let currentSortOrder = "asc"; // Sort order: "asc" or "desc"

  if (!bookSearchInput || !bookResultsTable) {
    console.error("Required elements not found.");
    return;
  }

  // Hide the table initially
  bookResultsTable.style.display = "none";

  // Attach event listener for search input
  bookSearchInput.addEventListener("input", async (event) => {
    const searchQuery = event.target.value.toLowerCase();

    // Clear the table if the search query is empty
    if (!searchQuery) {
      bookResultsTable.style.display = "none";
      bookResultsTable.innerHTML = ""; // Clear results
      return;
    }

    try {
      // Load books into cache if not already loaded
      if (booksCache.length === 0) {
        const querySnapshot = await getDocs(collection(db, "Books"));
        booksCache = querySnapshot.docs.map((doc) => doc.data());
      }

      // Filter books based on the search query
      filteredBooks = booksCache.filter((book) => {
        const ISBN = String(book.ISBN || "").toLowerCase();
        const author = String(book.author || "").toLowerCase();
        const genre = String(book.genre || "").toLowerCase();
        const title = String(book.title || "").toLowerCase();

        return (
          ISBN.includes(searchQuery) ||
          author.includes(searchQuery) ||
          genre.includes(searchQuery) ||
          title.includes(searchQuery)
        );
      });

      renderBooks(filteredBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  });

  // Attach event listeners for sorting
  document.getElementById("sortTitle").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent screen from jumping to the top
    toggleSort("title");
  });
  document.getElementById("sortAuthor").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent screen from jumping to the top
    toggleSort("author");
  });
  document.getElementById("sortGenre").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent screen from jumping to the top
    toggleSort("genre");
  });
  document.getElementById("sortDate").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent screen from jumping to the top
    toggleSort("published_date");
  });

  // Function to toggle sorting and render books
  function toggleSort(field) {
    // Toggle sort order
    currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";

    // Sort filtered books
    const sortedBooks = [...filteredBooks]; // Copy of filteredBooks to sort
    sortedBooks.sort((a, b) => {
      const valueA = String(a[field] || "").toLowerCase();
      const valueB = String(b[field] || "").toLowerCase();

      if (currentSortOrder === "asc") {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });

    renderBooks(sortedBooks);
  }

  // Function to render books in the table
  function renderBooks(books) {
    bookResultsTable.innerHTML = ""; // Clear previous results

    if (books.length === 0) {
      bookResultsTable.style.display = "none";
      return;
    }

    // Populate table with filtered or sorted results
    books.forEach((book) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${book.title || "N/A"}</td>
                <td>${book.author || "N/A"}</td>
                <td>${book.genre || "N/A"}</td>
                <td>${book.published_date || "N/A"}</td>
            `;
      bookResultsTable.appendChild(row);
    });

    // Show the table if there are results
    bookResultsTable.style.display = "";
  }
}

// Gets the Special Authors and their Books
async function fetchSpecialAuthorsAndBooks() {
  try {
    // Query all special authors
    const specialAuthorsSnapshot = await getDocs(
      collection(db, "SpecialAuthors")
    );
    const specialAuthors = specialAuthorsSnapshot.docs.map(
      (doc) => doc.data().name
    );
    console.log("Special Authors:", specialAuthors); // Check if

    const authorBooks = {};

    const booksSnapshot = await getDocs(collection(db, "Books"));
    booksSnapshot.forEach((doc) => {
      const book = doc.data();

      if (specialAuthors.includes(book.author)) {
        if (!authorBooks[book.author]) {
          authorBooks[book.author] = [];
        }
        authorBooks[book.author].push(book);
        console.log(book.author);
      }
    });

    renderAuthorsAndBooks(authorBooks);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function renderAuthorsAndBooks(authorBooks) {
  const container = document.getElementById("special-authors-section");

  const heading = document.createElement("h2");
  heading.textContent = "Special Authors";
  heading.style.textAlign = "center";
  container.appendChild(heading);

  Object.keys(authorBooks).forEach((author) => {
    const authorSection = document.createElement("div");
    authorSection.className = "author-section";

    const authorHeading = document.createElement("h3");
    authorHeading.textContent = author;
    authorSection.appendChild(authorHeading);

    const booksRow = document.createElement("div");
    booksRow.className = "books-row";

    // Loop over the books for this author
    authorBooks[author].forEach((book) => {
      // Create a card for each book
      const bookCard = document.createElement("div");
      bookCard.className = "book-card";

      bookCard.innerHTML = `
                <p><strong>Title:</strong> ${book.title}</p>
                <p><strong>Genre:</strong> ${book.genre}</p>
                <p><strong>Published Date:</strong> ${book.published_date}</p>
                <p><strong>ISBN:</strong> ${book.ISBN}</p>
            `;

      booksRow.appendChild(bookCard);
    });

    authorSection.appendChild(booksRow);
    container.appendChild(authorSection);
  });
}
