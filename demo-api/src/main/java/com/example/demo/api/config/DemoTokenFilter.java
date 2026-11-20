package com.example.demo.api.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Optional shared-secret check for the REST API.
 *
 * When DEMO_API_TOKEN is set, every /api/** request must carry the same value
 * in the X-Demo-Token header. This is for public deployments where a trusted
 * server (not a browser) calls the API: without it anyone who finds the URL can
 * produce records or clear the stored ones.
 *
 * When DEMO_API_TOKEN is unset the API is open, which is what local development
 * and the bundled static UI expect. The bundled UI cannot send the token, so it
 * does not work against a deployment that has one.
 */
@Component
public class DemoTokenFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Demo-Token";

    private final byte[] token;

    public DemoTokenFilter(@Value("${DEMO_API_TOKEN:}") String token) {
        this.token = token.trim().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return token.length == 0
                || !request.getRequestURI().startsWith("/api/")
                // CORS preflight requests never carry custom headers.
                || "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String presented = request.getHeader(HEADER);
        if (presented != null
                && MessageDigest.isEqual(token, presented.getBytes(StandardCharsets.UTF_8))) {
            chain.doFilter(request, response);
            return;
        }
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"Missing or invalid API token\"}");
    }
}
