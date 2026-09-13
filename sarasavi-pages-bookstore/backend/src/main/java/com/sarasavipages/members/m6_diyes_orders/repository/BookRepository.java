package com.sarasavipages.members.m6_diyes_orders.repository;

import com.sarasavipages.members.m6_diyes_orders.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, String> {

    List<Book> findByCategoryIgnoreCase(String category);

    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
}
