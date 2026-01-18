package menu.q.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import menu.q.backend.data.dto.UserDTO;
import menu.q.backend.model.User;
import menu.q.backend.service.UserService;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Gerenciamento de Usuários")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Lista todos os usuários")
    public ResponseEntity<List<EntityModel<UserDTO>>> getAllUsers() {
        List<User> users = userService.getAllUsers(null);
        List<EntityModel<UserDTO>> usersDtos = users.stream()
                .map(user -> addLinks(convertToDto(user)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(usersDtos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um usuário pelo ID")
    public ResponseEntity<EntityModel<UserDTO>> getUserById(@PathVariable Long id) {
        return Optional.ofNullable(userService.getUserById(id))
                .map(user -> {
                    UserDTO dto = convertToDto(user);
                    EntityModel<UserDTO> model = addLinks(dto);
                    return ResponseEntity.ok(model);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza os dados de um usuário")
    public ResponseEntity<EntityModel<UserDTO>> updateUser(@PathVariable Long id, @RequestBody UserDTO userDto) {
        User updatedUser = userService.updateUser(id, userDto);
        UserDTO resultDto = convertToDto(updatedUser);
        EntityModel<UserDTO> model = addLinks(resultDto);
        return ResponseEntity.ok(model);
    }

    @PostMapping
    @Operation(summary = "Cria um novo usuário")
    public ResponseEntity<EntityModel<UserDTO>> createUser(@RequestBody UserDTO userDto) {
        User createdUser = userService.createUser(userDto);
        UserDTO resultDto = convertToDto(createdUser);
        EntityModel<UserDTO> model = addLinks(resultDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(model);
    }

    private UserDTO convertToDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setAvatar(user.getAvatar());
        return dto;
    }

    @SuppressWarnings("null")
    private EntityModel<UserDTO> addLinks(UserDTO dto) {
        EntityModel<UserDTO> model = EntityModel.of(dto);
        model.add(linkTo(methodOn(UserController.class).getUserById(dto.getId())).withSelfRel());
        return model;
    }

    @ExceptionHandler
    public ResponseEntity<String> handleExceptions(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erro interno: " + ex.getMessage());
    }
}
