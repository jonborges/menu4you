package menu.q.backend.controller;

import menu.q.backend.model.DefaultImage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/default-images")
public class DefaultImageController {

    @GetMapping
    public ResponseEntity<List<DefaultImage>> getAllImages() {
        return ResponseEntity.ok(DefaultImage.getAllImages());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(DefaultImage.getAvailableCategories());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<DefaultImage>> getImagesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(DefaultImage.getImagesByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefaultImage> getImageById(@PathVariable String id) {
        return DefaultImage.getImageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<DefaultImage>>> getImagesGroupedByCategory() {
        Map<String, List<DefaultImage>> grouped = DefaultImage.getAvailableCategories()
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        category -> category,
                        DefaultImage::getImagesByCategory
                ));
        return ResponseEntity.ok(grouped);
    }

    @GetMapping("/covers")
    public ResponseEntity<List<String>> getCoverOptions() {
        // Retorna as 4 opções de capa para restaurantes
        List<String> covers = List.of(
            "cover_restaurant_1.jpg",
            "cover_restaurant_2.jpg", 
            "cover_restaurant_3.jpg",
            "cover_restaurant_4.jpg"
        );
        return ResponseEntity.ok(covers);
    }

    @GetMapping("/avatars")
    public ResponseEntity<List<DefaultImage>> getAvatarOptions() {
        // Retorna avatares de usuários
        return ResponseEntity.ok(DefaultImage.getImagesByCategory("Avatares"));
    }

    @GetMapping("/employees")
    public ResponseEntity<List<DefaultImage>> getEmployeeOptions() {
        // Retorna fotos de funcionários
        return ResponseEntity.ok(DefaultImage.getImagesByCategory("Funcionários"));
    }
}
