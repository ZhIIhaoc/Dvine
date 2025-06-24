package com.dvineapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for stateless JSON APIs; keep it if you serve HTML forms
                .csrf(csrf -> csrf.disable())

                // Authorisation rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()   // <-- register & login
                        .anyRequest().authenticated()              // everything else
                )

                // For now use HTTP Basic so you can test quickly;
                // later you’ll replace this with JWT, OAuth2, etc.
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
