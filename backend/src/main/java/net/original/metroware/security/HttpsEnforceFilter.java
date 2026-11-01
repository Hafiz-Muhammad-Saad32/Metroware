package net.original.metroware.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// REQUIRE_HTTPS=true ho to plain http requests reject (production mein)
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class HttpsEnforceFilter extends OncePerRequestFilter {

    private final boolean requireHttps;

    public HttpsEnforceFilter(@Value("${app.require-https:false}") boolean requireHttps) {
        this.requireHttps = requireHttps;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        if (requireHttps && !request.isSecure()) {
            response.setStatus(403);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"message\":\"HTTPS is required\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}