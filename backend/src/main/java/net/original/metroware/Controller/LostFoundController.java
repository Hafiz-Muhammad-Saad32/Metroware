package net.original.metroware.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import net.original.metroware.Entity.User;
import net.original.metroware.Service.LostFoundService;
import net.original.metroware.dto.LostFoundDto;
import net.original.metroware.dto.LostFoundRequest;

@RestController
@RequestMapping("/api/lost-found")
public class LostFoundController {

    private final LostFoundService lostFoundService;

    public LostFoundController(LostFoundService lostFoundService) {
        this.lostFoundService = lostFoundService;
    }

    @GetMapping
    public List<LostFoundDto> getAll() {
        return lostFoundService.getAll();
    }

    @PostMapping
    public LostFoundDto create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody LostFoundRequest request) {
        return lostFoundService.create(user, request);
    }

    @PutMapping("/{id}")
    public LostFoundDto update(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody LostFoundRequest request) {
        return lostFoundService.update(id, user, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal User user) {
        lostFoundService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}