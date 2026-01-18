package menu.q.backend.model;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Imagens padrão pré-definidas por categoria.
 * Todos os restaurantes podem usar essas imagens sem fazer upload.
 * Reduz custos de armazenamento e evita conteúdo inapropriado.
 */
public class DefaultImage {
    
    private final String id;
    private final String category;
    private final String url;
    private final String description;

    private DefaultImage(String id, String category, String url, String description) {
        this.id = id;
        this.category = category;
        this.url = url;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public String getUrl() {
        return url;
    }

    public String getDescription() {
        return description;
    }

    // Imagens pré-definidas - URLs de serviços gratuitos (Unsplash, Pexels) ou locais
    private static final List<DefaultImage> ALL_IMAGES = List.of(
        // Avatares de Usuário
        new DefaultImage("avatar_1", "Avatares", "https://api.dicebear.com/7.x/avataaars/svg?seed=1", "Avatar 1"),
        new DefaultImage("avatar_2", "Avatares", "https://api.dicebear.com/7.x/avataaars/svg?seed=2", "Avatar 2"),
        new DefaultImage("avatar_3", "Avatares", "https://api.dicebear.com/7.x/avataaars/svg?seed=3", "Avatar 3"),
        new DefaultImage("avatar_4", "Avatares", "https://api.dicebear.com/7.x/avataaars/svg?seed=4", "Avatar 4"),
        new DefaultImage("avatar_5", "Avatares", "https://api.dicebear.com/7.x/avataaars/svg?seed=5", "Avatar 5"),
        new DefaultImage("avatar_6", "Avatares", "https://api.dicebear.com/7.x/avataaars/svg?seed=6", "Avatar 6"),
        new DefaultImage("avatar_7", "Avatares", "https://api.dicebear.com/7.x/avataaars/svg?seed=7", "Avatar 7"),
        new DefaultImage("avatar_8", "Avatares", "https://api.dicebear.com/7.x/avataaars/svg?seed=8", "Avatar 8"),
        
        // Fotos de Funcionários
        new DefaultImage("employee_1", "Funcionários", "https://api.dicebear.com/7.x/personas/svg?seed=employee1", "Funcionário 1"),
        new DefaultImage("employee_2", "Funcionários", "https://api.dicebear.com/7.x/personas/svg?seed=employee2", "Funcionário 2"),
        new DefaultImage("employee_3", "Funcionários", "https://api.dicebear.com/7.x/personas/svg?seed=employee3", "Funcionário 3"),
        new DefaultImage("employee_4", "Funcionários", "https://api.dicebear.com/7.x/personas/svg?seed=employee4", "Funcionário 4"),
        new DefaultImage("employee_5", "Funcionários", "https://api.dicebear.com/7.x/personas/svg?seed=employee5", "Funcionário 5"),
        new DefaultImage("employee_6", "Funcionários", "https://api.dicebear.com/7.x/personas/svg?seed=employee6", "Funcionário 6"),
        
        // Hambúrgueres
        new DefaultImage("burger_1", "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", "Hambúrguer clássico com queijo"),
        new DefaultImage("burger_2", "Hambúrgueres", "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800", "Hambúrguer gourmet"),
        
        // Pizzas
        new DefaultImage("pizza_1", "Pizzas", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", "Pizza margherita"),
        new DefaultImage("pizza_2", "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800", "Pizza pepperoni"),
        
        // Bebidas
        new DefaultImage("drink_1", "Bebidas", "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800", "Refrigerante"),
        new DefaultImage("drink_2", "Bebidas", "https://images.unsplash.com/photo-1546173159-315724a31696?w=800", "Suco natural"),
        new DefaultImage("drink_3", "Bebidas", "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800", "Café"),
        
        // Sobremesas
        new DefaultImage("dessert_1", "Sobremesas", "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800", "Bolo de chocolate"),
        new DefaultImage("dessert_2", "Sobremesas", "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800", "Sorvete"),
        
        // Massas
        new DefaultImage("pasta_1", "Massas", "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800", "Espaguete"),
        new DefaultImage("pasta_2", "Massas", "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800", "Lasanha"),
        
        // Saladas
        new DefaultImage("salad_1", "Saladas", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800", "Salada caesar"),
        new DefaultImage("salad_2", "Saladas", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800", "Salada verde"),
        
        // Carnes
        new DefaultImage("meat_1", "Carnes", "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800", "Bife grelhado"),
        new DefaultImage("meat_2", "Carnes", "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800", "Picanha"),
        
        // Frutos do Mar
        new DefaultImage("seafood_1", "Frutos do Mar", "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800", "Camarão"),
        new DefaultImage("seafood_2", "Frutos do Mar", "https://images.unsplash.com/photo-1559737558-2f5a35f4523c?w=800", "Salmão grelhado"),
        
        // Comida Japonesa
        new DefaultImage("japanese_1", "Comida Japonesa", "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", "Sushi mix"),
        new DefaultImage("japanese_2", "Comida Japonesa", "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800", "Ramen"),
        
        // Comida Mexicana
        new DefaultImage("mexican_1", "Comida Mexicana", "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800", "Tacos"),
        new DefaultImage("mexican_2", "Comida Mexicana", "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800", "Burrito"),
        
        // Café da Manhã
        new DefaultImage("breakfast_1", "Café da Manhã", "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800", "Ovos e bacon"),
        new DefaultImage("breakfast_2", "Café da Manhã", "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800", "Panquecas"),
        
        // Lanches
        new DefaultImage("snack_1", "Lanches", "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800", "Sanduíche"),
        new DefaultImage("snack_2", "Lanches", "https://images.unsplash.com/photo-1619740455993-8cbed5de0e7b?w=800", "Batata frita"),
        
        // Vegano
        new DefaultImage("vegan_1", "Vegano", "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800", "Buddha bowl"),
        new DefaultImage("vegan_2", "Vegano", "https://images.unsplash.com/photo-1532597540161-b7d47b4c7a6d?w=800", "Poke vegano")
    );

    /**
     * Retorna todas as imagens disponíveis
     */
    public static List<DefaultImage> getAllImages() {
        return new ArrayList<>(ALL_IMAGES);
    }

    /**
     * Retorna imagens filtradas por categoria
     */
    public static List<DefaultImage> getImagesByCategory(String category) {
        if (category == null || category.isEmpty()) {
            return getAllImages();
        }
        return ALL_IMAGES.stream()
                .filter(img -> img.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }

    /**
     * Busca uma imagem pelo ID
     */
    public static Optional<DefaultImage> getImageById(String id) {
        return ALL_IMAGES.stream()
                .filter(img -> img.getId().equals(id))
                .findFirst();
    }

    /**
     * Retorna todas as categorias disponíveis
     */
    public static List<String> getAvailableCategories() {
        return ALL_IMAGES.stream()
                .map(DefaultImage::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Verifica se um ID de imagem existe
     */
    public static boolean exists(String imageId) {
        return getImageById(imageId).isPresent();
    }
}
