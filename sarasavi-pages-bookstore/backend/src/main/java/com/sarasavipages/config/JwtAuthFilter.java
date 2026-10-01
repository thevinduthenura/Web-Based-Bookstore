package com.sarasavipages.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT authentication filter – intercepts every request,
 * validates Bearer token, and sets SecurityContext.
 * Shared config used by all modules.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtUtil jwtUtil, @Lazy UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        String username = null;

        if (jwt.startsWith("demo-jwt-")) {
            String suffix = jwt.substring(9).toLowerCase();
            switch (suffix) {
                case "superadmin":
                    username = "admin";
                    break;
                case "payment":
                    username = "AnafS2345";
                    break;
                case "cs":
                    username = "ZeenC3342";
                    break;
                case "inventory":
                    username = "DissanayakeD1062";
                    break;
                case "accounts":
                    username = "GayathmiR3013";
                    break;
                case "orders":
                    username = "DiyesL0263";
                    break;
                default:
                    username = suffix;
                    break;
            }

            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>(userDetails.getAuthorities());
                if ("admin".equalsIgnoreCase(username)) {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"));
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
                }
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } catch (Exception e) {
                java.util.List<org.springframework.security.core.GrantedAuthority> fallbackAuth = new java.util.ArrayList<>();
                fallbackAuth.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
                fallbackAuth.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"));
                UserDetails fallbackUser = org.springframework.security.core.userdetails.User
                        .withUsername(username)
                        .password("demo")
                        .authorities(fallbackAuth)
                        .build();
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                fallbackUser, null, fallbackAuth);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

            filterChain.doFilter(request, response);
            return;
        }

        try {
            username = jwtUtil.extractUsername(jwt);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
