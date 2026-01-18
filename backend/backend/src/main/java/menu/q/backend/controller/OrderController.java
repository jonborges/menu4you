package menu.q.backend.controller;

import java.util.List;
import java.util.Map;

import menu.q.backend.model.Order;
import menu.q.backend.model.OrderItem;
import menu.q.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    public static record CreateOrderItemDTO(Long itemId, Integer quantity) {}
    public static record CreateOrderDTO(Long userId, Long restaurantId, Integer tableNumber, List<CreateOrderItemDTO> items, String guestName) {}
    public static record OrderItemDTO(Long id, String name, String price, Integer quantity) {}
    public static record OrderDTO(Long id, Integer tableNumber, String guestName, String total, String status, List<OrderItemDTO> items, Long createdAt) {
        public static OrderDTO fromOrder(Order order) {
            List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(oi -> new OrderItemDTO(oi.getId(), oi.getName(), oi.getPrice().toString(), oi.getQuantity()))
                .toList();
            return new OrderDTO(
                order.getId(),
                order.getTableNumber(),
                order.getGuestName(),
                order.getTotal().toString(),
                order.getStatus().toString(),
                itemDTOs,
                order.getCreatedAt() != null ? order.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 0L
            );
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CreateOrderDTO dto) {
        Order created = orderService.createOrder(dto.userId, dto.restaurantId, dto.tableNumber, dto.guestName, dto.items.stream().map(i -> new OrderService.OrderItemRequest(i.itemId, i.quantity)).toList());
        return ResponseEntity.status(201).body(Map.of("order", OrderDTO.fromOrder(created)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getById(@PathVariable Long id) {
        Order order = orderService.getById(id);
        return ResponseEntity.ok(OrderDTO.fromOrder(order));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getByBuyer(userId).stream().map(OrderDTO::fromOrder).toList());
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderDTO>> getByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(orderService.getByRestaurant(restaurantId).stream().map(OrderDTO::fromOrder).toList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(Map.of("message", "Pedido removido com sucesso"));
    }
}
