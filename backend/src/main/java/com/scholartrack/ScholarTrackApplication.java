package com.scholartrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// UserDetailsServiceAutoConfiguration excluded: we do our own JWT login, so no generated default password.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class ScholarTrackApplication {
    public static void main(String[] args) {
        SpringApplication.run(ScholarTrackApplication.class, args);
    }
}
