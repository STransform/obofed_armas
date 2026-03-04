package com.oss2.common.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Configuration
public class FeignClientConfig {
    // Every time any Feign client makes a request → this interceptor runs
    // It looks at the current Spring Security context
    // If there's a JwtAuthenticationToken → it takes the raw JWT string and adds it
    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
                requestTemplate.header("Authorization", "Bearer " + jwtAuthenticationToken.getToken().getTokenValue());
            }
        };
    }
}
