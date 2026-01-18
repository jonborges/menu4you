package menu.q.backend.data.dto;

public class RestaurantDto {
    private String name;
    private String description;
    private String cover;
    private String visibleCategories;
    private Integer tableCount;
    private Long ownerId;

    public RestaurantDto() {
    }

    public RestaurantDto(String name, String description, String cover, Long ownerId) {
        this.name = name;
        this.description = description;
        this.cover = cover;
        this.ownerId = ownerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCover() {
        return cover;
    }

    public void setCover(String cover) {
        this.cover = cover;
    }

    public String getVisibleCategories() {
        return visibleCategories;
    }

    public void setVisibleCategories(String visibleCategories) {
        this.visibleCategories = visibleCategories;
    }

    public Integer getTableCount() {
        return tableCount;
    }

    public void setTableCount(Integer tableCount) {
        this.tableCount = tableCount;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
