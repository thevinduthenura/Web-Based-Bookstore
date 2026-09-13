package com.bookstore.ordercart.controller;

import com.bookstore.ordercart.dto.ApiResponse;
import com.bookstore.ordercart.model.Book;
import com.bookstore.ordercart.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookController {

    private final BookRepository bookRepository;

    // GET /api/books — returns all books in the catalog
    @GetMapping
    public ResponseEntity<ApiResponse<List<Book>>> getAllBooks() {
        List<Book> books = bookRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Books retrieved successfully", books));
    }

    // GET /api/books/{id} — get a single book by its MongoDB ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable String id) {
        return bookRepository.findById(id)
                .map(book -> ResponseEntity.ok(ApiResponse.success("Book found", book)))
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/books/category/{category} — filter books by category
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<Book>>> getBooksByCategory(@PathVariable String category) {
        List<Book> books = bookRepository.findByCategoryIgnoreCase(category);
        return ResponseEntity.ok(ApiResponse.success("Books retrieved for category: " + category, books));
    }

    // GET /api/books/search?q=... — search by title or author
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Book>>> searchBooks(@RequestParam String q) {
        List<Book> books = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(q, q);
        return ResponseEntity.ok(ApiResponse.success("Search results for: " + q, books));
    }
}
