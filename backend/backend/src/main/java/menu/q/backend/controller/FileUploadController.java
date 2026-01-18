package menu.q.backend.controller;

import menu.q.backend.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Map;

/**
 * @deprecated Este controller está deprecated. O sistema agora usa apenas imagens padrão.
 * Use /api/default-images para obter imagens disponíveis.
 */
@Deprecated
@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * @deprecated Upload de arquivos não é mais suportado. Use IDs de imagens padrão.
     */
    @Deprecated
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(410) // Gone
                .body(Map.of(
                    "error", "Upload de arquivos não é mais suportado",
                    "message", "Use /api/default-images para obter imagens padrão disponíveis"
                ));
    }
}