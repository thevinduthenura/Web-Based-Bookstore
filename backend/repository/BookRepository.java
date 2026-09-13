package com.bookstore.ordercart.repository;

import com.bookstore.ordercart.model.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends MongoRepository<Book, String> {

    // filter books by category (case-insensitive so "fiction" and "Fiction" both work)
    List<Book> findByCategoryIgnoreCase(String category);

    // search by title or author — powers the search bar on the catalog page
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
}
