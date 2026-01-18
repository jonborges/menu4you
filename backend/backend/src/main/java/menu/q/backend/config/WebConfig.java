package menu.q.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serve arquivos da pasta uploads (para uploads antigos, se houver)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        
        // Serve imagens padrão de capa dos restaurantes
        registry.addResourceHandler("/default-images/covers/**")
                .addResourceLocations("file:default-images/covers/");
        
        // Serve imagens padrão de itens (produtos)
        registry.addResourceHandler("/default-images/items/**")
                .addResourceLocations("file:default-images/items/");
        
        registry.addResourceHandler("/**") // Fallback para imagens na raiz
                .addResourceLocations("file:uploads/");
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        // Configuração via filtro abaixo é mais robusta
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        
        // Em produção, usar domínios específicos da variável de ambiente
        // Ex: ALLOWED_ORIGINS=https://meusite.com,https://www.meusite.com
        Arrays.stream(allowedOrigins.split(","))
            .forEach(config::addAllowedOrigin);
        
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}