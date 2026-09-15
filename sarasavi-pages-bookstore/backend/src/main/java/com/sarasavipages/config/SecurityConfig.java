package com.sarasavipages.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security configuration.
 * - Stateless JWT sessions
 * - Role-based endpoint authorization
 * - CORS setup for Next.js frontend
 *
 * Shared config used by all modules.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/books/**").permitAll()
                .requestMatchers("/cart/**", "/promotions/**").permitAll()
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/h2-console/**"
                ).permitAll()

                // ── M1: Admin & Staff Management ──────────────────────────────
                // Only SUPER_ADMIN can manage staff
                .requestMatchers("/admin/staff/**").hasRole("SUPER_ADMIN")
                .requestMatchers("/admin/audit-logs/**").hasRole("SUPER_ADMIN")

                // ── M2: Payment ────────────────────────────────────────────────
                // SUPER_ADMIN or PAYMENT_ADMIN
                .requestMatchers("/payment/**", "/payments/**")
                    .hasAnyRole("SUPER_ADMIN", "PAYMENT_ADMIN")

                // ── M3: Customer Service ───────────────────────────────────────
                .requestMatchers("/customer-service/**")
                    .hasAnyRole("SUPER_ADMIN", "CUSTOMER_SERVICE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/tickets").permitAll()

                // ── M4: Inventory & Catalog ────────────────────────────────────
                .requestMatchers("/inventory/**")
                    .hasAnyRole("SUPER_ADMIN", "INVENTORY_ADMIN")

                // ── M5: User Accounts ──────────────────────────────────────────
                .requestMatchers("/accounts/**")
                    .hasAnyRole("SUPER_ADMIN", "ACCOUNT_ADMIN")

                // ── M6: Orders & Cart ──────────────────────────────────────────
                .requestMatchers("/orders/**")
                    .hasAnyRole("SUPER_ADMIN", "ORDER_ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
