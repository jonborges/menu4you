package menu.q.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.stream.Collectors;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import menu.q.backend.data.dto.ItemDto;
import menu.q.backend.model.Item;
import menu.q.backend.service.ItemService;
import menu.q.backend.util.ImageValidator;

@RestController
@RequestMapping("/api")
@Tag(name = "Itens", description = "Endpoints para Gerenciar Itens do Cardápio")
public class ItemController {
    
    private final ItemService itemService;
    private final ImageValidator imageValidator;

    public ItemController(ItemService itemService, ImageValidator imageValidator) {
        this.itemService = itemService;
        this.imageValidator = imageValidator;
    }

    @PostMapping("/items")
    @Operation(summary = "Cria um novo item", description = "Cria um novo item e o associa a um usuário existente. A imagem é automaticamente atribuída baseada na categoria.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Item criado com sucesso", content = @Content(schema = @Schema(implementation = ItemDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    public ResponseEntity<EntityModel<ItemDto>> createItem(@RequestBody ItemDto itemDto) {
        // Não precisa validar imagem - é atribuída automaticamente pela categoria
        Item createdItem = itemService.createItem(itemDto);
        ItemDto dto = convertToDto(createdItem);
        addLinks(dto);

        return new ResponseEntity<>(EntityModel.of(dto), HttpStatus.CREATED);
    }

    @GetMapping(value = "/items/{itemId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Busca um item pelo ID", description = "Retorna os detalhes de um item específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item encontrado", content = @Content(schema = @Schema(implementation = ItemDto.class))),
        @ApiResponse(responseCode = "404", description = "Item não encontrado", content = @Content)
    })
    public ResponseEntity<EntityModel<ItemDto>> getItemById(@PathVariable Long itemId) {
        return itemService.getItemById(itemId)
                .map(this::convertToDto)
                .map(dto -> {
                    addLinks(dto);
                    return ResponseEntity.ok(EntityModel.of(dto));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping(value = "/items/{itemId}")
    @Operation(summary = "Remove um item", description = "Remove um item do cardápio pelo ID.")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        itemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping(value = "/items/{itemId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Atualiza um item", description = "Atualiza as informações de um item existente.")
    public ResponseEntity<EntityModel<ItemDto>> updateItem(@PathVariable Long itemId, @RequestBody ItemDto itemDto) {
        Item updatedItem = itemService.updateItem(itemId, itemDto);
        ItemDto dto = convertToDto(updatedItem);
        addLinks(dto);
        return ResponseEntity.ok(EntityModel.of(dto));
    }

    @GetMapping(value = "/users/{userId}/items", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Lista todos os itens de um usuário", description = "Retorna uma lista de todos os itens do cardápio pertencentes a um usuário específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Itens listados com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    public ResponseEntity<List<ItemDto>> getItemsByUserId(@PathVariable Long userId, @RequestParam(required = false) String name) {
        List<Item> items = itemService.getItemsByUserId(userId, name);
        List<ItemDto> itemDtos = items.stream()
                                      .map(this::convertToDto)
                                      .peek(this::addLinks)
                                      .collect(Collectors.toList());
        return ResponseEntity.ok(itemDtos);
    }

    @GetMapping(value = "/items/search", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Busca itens por nome", description = "Retorna itens cujo nome contenha o termo informado.")
    public ResponseEntity<List<ItemDto>> searchItems(@RequestParam String name) {
        List<Item> items = itemService.searchByName(name);
        List<ItemDto> itemDtos = items.stream()
                                      .map(this::convertToDto)
                                      .peek(this::addLinks)
                                      .collect(Collectors.toList());
        return ResponseEntity.ok(itemDtos);
    }

    @GetMapping(value = "/restaurants/{restaurantId}/items", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Lista itens por restaurante", description = "Retorna itens pertencentes a um restaurante.")
    public ResponseEntity<List<ItemDto>> getByRestaurant(@PathVariable Long restaurantId) {
        List<Item> items = itemService.getByRestaurantId(restaurantId);
        List<ItemDto> itemDtos = items.stream()
                                      .map(this::convertToDto)
                                      .peek(this::addLinks)
                                      .collect(Collectors.toList());
        return ResponseEntity.ok(itemDtos);
    }

    @GetMapping(value = "/restaurants/{restaurantId}/items/featured", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Lista itens em destaque por restaurante", description = "Retorna itens marcados como em alta de um restaurante.")
    public ResponseEntity<List<ItemDto>> getFeaturedByRestaurant(@PathVariable Long restaurantId) {
        List<Item> items = itemService.getFeaturedByRestaurantId(restaurantId);
        List<ItemDto> itemDtos = items.stream()
                                      .map(this::convertToDto)
                                      .peek(this::addLinks)
                                      .collect(Collectors.toList());
        return ResponseEntity.ok(itemDtos);
    }

    private ItemDto convertToDto(Item item) {
        Long restaurantId = item.getRestaurant() != null ? item.getRestaurant().getId() : null;
        Long userId = item.getUser() != null ? item.getUser().getId() : null;
        ItemDto dto = new ItemDto();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setCategory(item.getCategory());
        dto.setImage(item.getImage());
        dto.setUserId(userId);
        dto.setRestaurantId(restaurantId);
        dto.setFeatured(item.getFeatured());
        return dto;
    }

    private void addLinks(ItemDto dto) {
        dto.add(linkTo(methodOn(ItemController.class).getItemById(dto.getId())).withSelfRel());
        dto.add(linkTo(methodOn(UserController.class).getUserById(dto.getUserId())).withRel("user"));
        dto.add(linkTo(methodOn(ItemController.class).getItemsByUserId(dto.getUserId(), null)).withRel("user-items"));
    }
}