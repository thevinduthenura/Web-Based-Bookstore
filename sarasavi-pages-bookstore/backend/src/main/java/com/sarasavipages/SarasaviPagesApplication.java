package com.sarasavipages;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Sarasavi Pages – Web-Based Bookstore
 * SE2030 Software Engineering – Year 2 Semester 1
 * Group: B9G2 | Project ID: 2026-Y2-S1-MLB-B9G2-01
 */
@SpringBootApplication
@EnableScheduling
public class SarasaviPagesApplication {

    public static void main(String[] args) {
        SpringApplication.run(SarasaviPagesApplication.class, args);
    }
}
