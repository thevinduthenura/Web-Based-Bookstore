package com.sarasavipages.members.m6_diyes_orders.controller;

import com.sarasavipages.common.ApiResponse;
import com.sarasavipages.members.m6_diyes_orders.entity.Book;
import com.sarasavipages.members.m6_diyes_orders.repository.BookRepository;
import com.sarasavipages.members.sync.document.BookMirror;
import com.sarasavipages.members.sync.repository.BookMirrorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@Tag(name = "Module 6 – Book Storefront", description = "Book catalog queries supporting shopping cart")
public class BookController {

    private final BookRepository bookRepository;
    private final Optional<BookMirrorRepository> bookMirrorRepository;

    @Operation(summary = "Get all books in catalog (with MongoDB mirror fallback)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Book>>> getAllBooks() {
        try {
            List<Book> books = bookRepository.findAll();
            if (!books.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success("Books retrieved successfully", books));
            }
        } catch (Exception ex) {
            // MSSQL query failed -> fallback to MongoDB mirror
        }

        // Fallback to MongoDB mirror
        if (bookMirrorRepository.isPresent()) {
            List<Book> mirrored = bookMirrorRepository.get().findAll().stream()
                    .map(this::fromBookMirror)
                    .collect(Collectors.toList());
            if (!mirrored.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success("Books retrieved from MongoDB mirror replica", mirrored));
            }
        }

        return ResponseEntity.ok(ApiResponse.success("No books available", List.of()));
    }

    @Operation(summary = "Get a single book by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable String id) {
        var bookOpt = bookRepository.findById(id);
        if (bookOpt.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Book found", bookOpt.get()));
        }

        if (bookMirrorRepository.isPresent()) {
            var mirrorOpt = bookMirrorRepository.get().findById(id);
            if (mirrorOpt.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("Book found in MongoDB mirror", fromBookMirror(mirrorOpt.get())));
            }
        }

        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Filter books by category")
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<Book>>> getBooksByCategory(@PathVariable String category) {
        List<Book> books = bookRepository.findByCategoryIgnoreCase(category);
        if (books.isEmpty() && bookMirrorRepository.isPresent()) {
            books = bookMirrorRepository.get().findAll().stream()
                    .filter(m -> category.equalsIgnoreCase(m.getCategory()))
                    .map(this::fromBookMirror)
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(ApiResponse.success("Books retrieved for category: " + category, books));
    }

    @Operation(summary = "Search books by title or author")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Book>>> searchBooks(@RequestParam String q) {
        List<Book> books = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(q, q);
        if (books.isEmpty() && bookMirrorRepository.isPresent()) {
            String term = q.toLowerCase();
            books = bookMirrorRepository.get().findAll().stream()
                    .filter(m -> (m.getTitle() != null && m.getTitle().toLowerCase().contains(term))
                            || (m.getAuthor() != null && m.getAuthor().toLowerCase().contains(term)))
                    .map(this::fromBookMirror)
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(ApiResponse.success("Search results for: " + q, books));
    }

    @Operation(summary = "Add a new book (Order Admin or Super Admin)")
    @PostMapping
    public ResponseEntity<ApiResponse<Book>> createBook(@RequestBody Book book) {
        if (book.getId() == null || book.getId().isBlank()) {
            book.setId("BK-" + System.currentTimeMillis());
        }
        Book saved = bookRepository.save(book);

        // Instant dual-save into MongoDB mirror
        bookMirrorRepository.ifPresent(repo -> {
            try {
                repo.save(toBookMirror(saved));
            } catch (Exception ignored) {}
        });

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

                    // Update MongoDB mirror
                    bookMirrorRepository.ifPresent(repo -> {
                        try {
                            repo.save(toBookMirror(updated));
                        } catch (Exception ignored) {}
                    });

                    return ResponseEntity.ok(ApiResponse.success("Book updated successfully", updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete book from catalog (Order Admin or Super Admin)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable String id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
        }
        bookMirrorRepository.ifPresent(repo -> {
            try {
                repo.deleteById(id);
            } catch (Exception ignored) {}
        });
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }

    private BookMirror toBookMirror(Book b) {
        return BookMirror.builder()
                .id(b.getId())
                .title(b.getTitle())
                .author(b.getAuthor())
                .category(b.getCategory())
                .price(b.getPrice())
                .coverImage(b.getCoverImage())
                .stockQuantity(b.getStockQuantity())
                .isbn(b.getIsbn())
                .description(b.getDescription())
                .rating(b.getRating())
                .syncedAt(LocalDateTime.now())
                .build();
    }

    private Book fromBookMirror(BookMirror m) {
        Book b = new Book();
        b.setId(m.getId());
        b.setTitle(m.getTitle());
        b.setAuthor(m.getAuthor());
        b.setCategory(m.getCategory());
        b.setPrice(m.getPrice());
        b.setCoverImage(m.getCoverImage());
        b.setStockQuantity(m.getStockQuantity());
        b.setIsbn(m.getIsbn());
        b.setDescription(m.getDescription());
        b.setRating(m.getRating());
        return b;
    }
}
