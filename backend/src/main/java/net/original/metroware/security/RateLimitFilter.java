package net.original.metroware.security;

import java.io.IOException;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MS = 60_000L;
    private static final int MAX_LOGIN_PER_MIN = 10;
    private static final int MAX_SIGNUP_PER_MIN = 5;

    private final RateLimiter rateLimiter;

    public RateLimitFilter(RateLimiter rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        if ("POST".equals(request.getMethod())) {
            String path = request.getRequestURI();
            int max = 0;

            if ("/api/auth/login".equals(path)) {
                max = MAX_LOGIN_PER_MIN;
            } else if ("/api/auth/signup".equals(path)) {
                max = MAX_SIGNUP_PER_MIN;
            }

            if (max > 0 && !rateLimiter.allow(path + ":" + request.getRemoteAddr(), max, WINDOW_MS)) {
                response.setStatus(429);
                response.setHeader("Retry-After", "60");
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(
                        "{\"message\":\"Too many requests. Please wait a minute and try again.\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }
}