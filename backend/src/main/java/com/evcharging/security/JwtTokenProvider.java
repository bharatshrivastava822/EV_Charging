package com.evcharging.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;

@Component
public class JwtTokenProvider {

    public static final String DEFAULT_DEV_SECRET = "ev-charging-booking-secret-key-that-is-long-enough-for-hs512-algorithm-minimum-64-bytes-requirement";

    private final SecretKey key;
    private final long jwtExpirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms}") long jwtExpirationMs,
            Environment env) {

        if (jwtSecret == null || jwtSecret.trim().length() < 32) {
            throw new IllegalStateException("FATAL: app.jwt.secret must be configured with a minimum of 32 characters (256 bits).");
        }

        boolean isProd = Arrays.asList(env.getActiveProfiles()).contains("prod") ||
                         Arrays.asList(env.getActiveProfiles()).contains("production") ||
                         "true".equalsIgnoreCase(System.getenv("PRODUCTION")) ||
                         "production".equalsIgnoreCase(System.getenv("ENVIRONMENT")) ||
                         "production".equalsIgnoreCase(System.getenv("NODE_ENV"));

        if (isProd && DEFAULT_DEV_SECRET.equals(jwtSecret.trim())) {
            throw new IllegalStateException("FATAL: Production environment cannot use the default development JWT secret! Please set APP_JWT_SECRET environment variable.");
        }

        this.key = Keys.hmacShaKeyFor(jwtSecret.trim().getBytes(StandardCharsets.UTF_8));
        this.jwtExpirationMs = jwtExpirationMs;
    }

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String generateTokenFromEmail(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
