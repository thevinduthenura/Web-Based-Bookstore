package com.sarasavipages.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Custom Flyway migration strategy to automatically repair checksum mismatches
 * (e.g. when migration scripts are tweaked during development) before migrating.
 */
@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            log.info("Running Flyway repair to align schema history checksums...");
            flyway.repair();
            log.info("Running Flyway migration...");
            flyway.migrate();
        };
    }
}
