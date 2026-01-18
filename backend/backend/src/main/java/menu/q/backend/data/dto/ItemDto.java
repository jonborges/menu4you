package menu.q.backend.data.dto;

import java.math.BigDecimal;
import org.springframework.hateoas.RepresentationModel;

public class ItemDto extends RepresentationModel<ItemDto> {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String image;
    private String category;
    private Boolean featured;
    private Long userId;
    private Long restaurantId;

    public ItemDto() {}

    public ItemDto(Long id, String name, String description, BigDecimal price, String category, String image, Long userId, Long restaurantId, Boolean featured) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.image = image;
        this.userId = userId;
        this.restaurantId = restaurantId;
        this.featured = featured;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
    public Boolean getFeatured() { return featured; }
    public Boolean isFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
}