package com.sarasavipages.members.m6_diyes_orders.controller;

import com.sarasavipages.common.ApiResponse;
import com.sarasavipages.members.m6_diyes_orders.entity.Book;
import com.sarasavipages.members.m6_diyes_orders.repository.BookRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@Tag(name = "Module 6 – Book Storefront", description = "Book catalog queries supporting shopping cart")
public class BookController {

    private final BookRepository bookRepository;

    @Operation(summary = "Get all books in catalog")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Book>>> getAllBooks() {
        List<Book> books = bookRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Books retrieved successfully", books));
    }

    @Operation(summary = "Get a single book by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable String id) {
        return bookRepository.findById(id)
                .map(book -> ResponseEntity.ok(ApiResponse.success("Book found", book)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Filter books by category")
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<Book>>> getBooksByCategory(@PathVariable String category) {
        List<Book> books = bookRepository.findByCategoryIgnoreCase(category);
        return ResponseEntity.ok(ApiResponse.success("Books retrieved for category: " + category, books));
    }

    @Operation(summary = "Search books by title or author")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Book>>> searchBooks(@RequestParam String q) {
        List<Book> books = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(q, q);
        return ResponseEntity.ok(ApiResponse.success("Search results for: " + q, books));
    }

    @Operation(summary = "Add a new book (Order Admin or Super Admin)")
    @PostMapping
    public ResponseEntity<ApiResponse<Book>> createBook(@RequestBody Book book) {
        if (book.getId() == null || book.getId().isBlank()) {
            book.setId("BK-" + System.currentTimeMillis());
        }
        Book saved = bookRepository.save(book);
        return ResponseEntity.ok(ApiResponse.success("Book registered successfully", saved));
    }

    @Operation(summary = "Update book details (Order Admin or Super Admin)")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> updateBook(@PathVariable String id, @RequestBody Book book) {
        return bookRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(book.getTitle());
                    existing.setAuthor(book.getAuthor());
                    existing.setCategory(book.getCategory());
                    existing.setPrice(book.getPrice());
                    existing.setStockQuantity(book.getStockQuantity());
                    existing.setDescription(book.getDescription());
                    existing.setIsbn(book.getIsbn());
                    existing.setCoverImage(book.getCoverImage());
                    Book updated = bookRepository.save(existing);
                    return ResponseEntity.ok(ApiResponse.success("Book updated successfully", updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete book from catalog (Order Admin or Super Admin)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable String id) {
        if (!bookRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bookRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }
}
