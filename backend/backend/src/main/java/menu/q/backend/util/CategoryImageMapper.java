package menu.q.backend.util;

import java.util.HashMap;
import java.util.Map;

/**
 * Mapeia categorias para IDs de imagens padrão
 */
public class CategoryImageMapper {
    
    private static final Map<String, String> CATEGORY_TO_IMAGE = new HashMap<>();
    
    static {
        // Mapeamento de categorias para arquivos de imagem locais
        CATEGORY_TO_IMAGE.put("Hambúrgueres", "lanche.jpg");
        CATEGORY_TO_IMAGE.put("hamburgueres", "lanche.jpg");
        CATEGORY_TO_IMAGE.put("lanches", "lanche.jpg");
        CATEGORY_TO_IMAGE.put("Lanches", "lanche.jpg");
        
        CATEGORY_TO_IMAGE.put("Pizzas", "pizza.jpg");
        CATEGORY_TO_IMAGE.put("pizzas", "pizza.jpg");
        CATEGORY_TO_IMAGE.put("pizza", "pizza.jpg");
        
        CATEGORY_TO_IMAGE.put("Bebidas", "bebidas.jpg");
        CATEGORY_TO_IMAGE.put("bebidas", "bebidas.jpg");
        
        CATEGORY_TO_IMAGE.put("Sobremesas", "doces.jpg");
        CATEGORY_TO_IMAGE.put("sobremesas", "doces.jpg");
        CATEGORY_TO_IMAGE.put("doces", "doces.jpg");
        CATEGORY_TO_IMAGE.put("Doces", "doces.jpg");
        
        CATEGORY_TO_IMAGE.put("Massas", "pizza.jpg");
        CATEGORY_TO_IMAGE.put("massas", "pizza.jpg");
        
        CATEGORY_TO_IMAGE.put("Saladas", "fitness.jpg");
        CATEGORY_TO_IMAGE.put("saladas", "fitness.jpg");
        CATEGORY_TO_IMAGE.put("saudavel", "fitness.jpg");
        CATEGORY_TO_IMAGE.put("Saudável", "fitness.jpg");
        
        CATEGORY_TO_IMAGE.put("Carnes", "brasileira.jpg");
        CATEGORY_TO_IMAGE.put("carnes", "brasileira.jpg");
        
        CATEGORY_TO_IMAGE.put("Frutos do Mar", "brasileira.jpg");
        CATEGORY_TO_IMAGE.put("frutos do mar", "brasileira.jpg");
        
        CATEGORY_TO_IMAGE.put("Comida Japonesa", "japonesa.jpg");
        CATEGORY_TO_IMAGE.put("japonesa", "japonesa.jpg");
        CATEGORY_TO_IMAGE.put("Japonesa", "japonesa.jpg");
        
        CATEGORY_TO_IMAGE.put("Comida Mexicana", "lanche.jpg");
        CATEGORY_TO_IMAGE.put("mexicana", "lanche.jpg");
        
        CATEGORY_TO_IMAGE.put("Café da Manhã", "lanche.jpg");
        CATEGORY_TO_IMAGE.put("cafe da manha", "lanche.jpg");
        
        CATEGORY_TO_IMAGE.put("Vegano", "fitness.jpg");
        CATEGORY_TO_IMAGE.put("vegano", "fitness.jpg");
        
        CATEGORY_TO_IMAGE.put("Brasileira", "brasileira.jpg");
        CATEGORY_TO_IMAGE.put("brasileira", "brasileira.jpg");
        
        CATEGORY_TO_IMAGE.put("Açaí", "acai.jpg");
        CATEGORY_TO_IMAGE.put("acai", "acai.jpg");
    }
    
    /**
     * Retorna o nome do arquivo de imagem para uma categoria
     * @param category Nome da categoria
     * @return Nome do arquivo (ex: "lanche.jpg") ou "lanche.jpg" como fallback
     */
    public static String getImageForCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return "lanche.jpg"; // Fallback padrão
        }
        
        // Tenta buscar exato
        String imageId = CATEGORY_TO_IMAGE.get(category);
        if (imageId != null) {
            return imageId;
        }
        
        // Tenta buscar ignorando maiúsculas/minúsculas
        imageId = CATEGORY_TO_IMAGE.get(category.toLowerCase());
        if (imageId != null) {
            return imageId;
        }
        
        // Fallback para lanches
        return "lanche.jpg";
    }
    
    /**
     * Verifica se existe mapeamento para a categoria
     */
    public static boolean hasMappingForCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return false;
        }
        return CATEGORY_TO_IMAGE.containsKey(category) || 
               CATEGORY_TO_IMAGE.containsKey(category.toLowerCase());
    }
}
