package com.sms.controller;

import com.sms.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
    private final AuthService authService;

    public PageController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/")
    public String root(HttpSession session) {
        return authService.isAuthenticated(session) ? "redirect:/app" : "redirect:/login";
    }

    @GetMapping("/app")
    public String app(HttpSession session) {
        return authService.isAuthenticated(session) ? "forward:/index.html" : "redirect:/login";
    }

    @GetMapping("/login")
    public String login(HttpSession session) {
        return authService.isAuthenticated(session) ? "redirect:/app" : "forward:/login.html";
    }
}
