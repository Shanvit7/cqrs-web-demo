// Re-export order-related types from schema
export type {
  OrderStatus,
  OrderItem,
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrderReadModel,
  ListOrdersParams,
  ListOrdersResponse,
} from './schema'

// API Response Types
export interface ApiResponse<T> {
  message: string
  data?: T
}

export interface CreateOrderResponse {
  message: string
  orderId: string
}

export interface UpdateOrderStatusResponse {
  message: string
  orderId: string
  status: string
}
