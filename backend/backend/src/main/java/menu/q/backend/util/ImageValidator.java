package menu.q.backend.util;

import menu.q.backend.model.DefaultImage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Base64;
import java.util.Set;

@Component
public class ImageValidator {

    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/jpg");
    
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;
    
    /**
     * Valida uma imagem. Aceita IDs de imagens padrão, nomes de capa de restaurante, ou base64 (deprecated).
     * IDs de imagens padrão são preferidos para economizar espaço em disco.
     */
    public void validateImage(String image) {
        if (image == null || image.isEmpty()) {
            return; // Imagem opcional
        }

        // Se for um nome de capa de restaurante (cover_restaurant_N.jpg)
        if (image.matches("^cover_restaurant_[1-4]\\.jpg$")) {
            return; // Nome de capa válido
        }

        // Se for um arquivo de imagem de item (acai.jpg, bebidas.jpg, etc)
        if (image.matches("^(acai|bebidas|brasileira|doces|fitness|japonesa|lanche|pizza)\\.jpg$")) {
            return; // Arquivo de item válido
        }

        // Se for um ID de avatar (avatar_N)
        if (image.matches("^avatar_[1-8]$")) {
            return; // Avatar válido
        }

        // Se for um ID de foto de funcionário (employee_N)
        if (image.matches("^employee_[1-6]$")) {
            return; // Foto de funcionário válida
        }

        // Se for um ID de imagem padrão antigo, apenas verificar se existe
        if (!image.contains("data:image/") && DefaultImage.exists(image)) {
            return; // ID válido
        }

        // Se não for ID nem capa, validar como base64 (deprecated)
        validateBase64Image(image);
    }
    
    /**
     * @deprecated Use validateImage() que aceita tanto IDs padrão quanto base64.
     * Upload de base64 consome muito espaço. Prefira usar imagens padrão.
     */
    @Deprecated
    public void validateBase64Image(String base64Image) {
        if (base64Image == null || base64Image.isEmpty()) {
            return; // Imagem opcional
        }

        // Validar formato base64 e extrair tipo
        if (!base64Image.startsWith("data:image/")) {
            throw new IllegalArgumentException("Formato de imagem inválido. Use base64 com prefixo data:image/ ou um ID de imagem padrão");
        }

        // Extrair tipo MIME
        String mimeType = base64Image.substring(5, base64Image.indexOf(';'));
        if (!ALLOWED_TYPES.contains(mimeType)) {
            throw new IllegalArgumentException("Tipo de imagem não permitido. Use: JPEG, PNG ou WebP");
        }

        // Extrair dados base64
        String base64Data;
        try {
            base64Data = base64Image.substring(base64Image.indexOf(',') + 1);
        } catch (Exception e) {
            throw new IllegalArgumentException("Formato base64 inválido");
        }

        // Validar tamanho
        try {
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            if (imageBytes.length > MAX_IMAGE_SIZE_BYTES) {
                long sizeMB = imageBytes.length / (1024 * 1024);
                throw new IllegalArgumentException("Imagem muito grande (" + sizeMB + "MB). Tamanho máximo: 5MB");
            }
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Imagem muito grande")) {
                throw e;
            }
            throw new IllegalArgumentException("Dados base64 inválidos");
        }
    }

    /**
     * Converte imageId para URL ou retorna o base64 original
     */
    public String resolveImageUrl(String image) {
        if (image == null || image.isEmpty()) {
            return null;
        }

        // Se for um nome de capa de restaurante, retornar o caminho para a pasta de capas
        if (image.matches("^cover_restaurant_[1-4]\\.jpg$")) {
            return baseUrl + "/default-images/covers/" + image;
        }

        // Se for um arquivo de imagem de item (acai.jpg, bebidas.jpg, etc)
        if (image.matches("^(acai|bebidas|brasileira|doces|fitness|japonesa|lanche|pizza)\\.jpg$")) {
            return baseUrl + "/default-images/items/" + image;
        }

        // Se for um ID de imagem padrão, retornar a URL
        if (!image.contains("data:image/")) {
            return DefaultImage.getImageById(image)
                    .map(DefaultImage::getUrl)
                    .orElse(image); // Se não encontrar, retorna o valor original
        }

        // Se for base64, retorna como está
        return image;
    }

    public static long getMaxImageSizeBytes() {
        return MAX_IMAGE_SIZE_BYTES;
    }

    public static Set<String> getAllowedTypes() {
        return ALLOWED_TYPES;
    }
}
