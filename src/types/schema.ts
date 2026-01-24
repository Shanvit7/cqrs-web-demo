import { z } from 'zod'

// Order Item Schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, { message: 'Product ID is required' }),
  quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
  price: z.number().positive({ message: 'Price must be positive' }),
})

// Create Order Schema (Command)
export const createOrderSchema = z.object({
  customerId: z.string().min(1, { message: 'Customer ID is required' }),
  items: z.array(orderItemSchema).min(1, { message: 'At least one item is required' }),
  totalAmount: z.number().positive({ message: 'Total amount must be positive' }),
})

// Update Order Status Schema (Command)
export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
})

// Order Status Type
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

// Order Item Type
export type OrderItem = z.infer<typeof orderItemSchema>

// Create Order Type (Command)
export type CreateOrderInput = z.infer<typeof createOrderSchema>

// Update Order Status Type (Command)
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

// Order Read Model (Query Result)
export interface OrderReadModel {
  id: string
  customerId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

// List Orders Query Parameters
export interface ListOrdersParams {
  page?: number
  limit?: number
  status?: OrderStatus
  customerId?: string
}

// List Orders Response
export interface ListOrdersResponse {
  message: string
  pagination: {
    page: number
    limit: number
    total: number
  }
  orders: OrderReadModel[]
}

// Product Types (DummyJSON)
export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage?: number
  rating?: number
  stock?: number
  tags?: string[]
  brand?: string
  sku?: string
  weight?: number
  dimensions?: {
    width: number
    height: number
    depth: number
  }
  warrantyInformation?: string
  shippingInformation?: string
  availabilityStatus?: string
  reviews?: Array<{
    rating: number
    comment: string
    date: string
    reviewerName: string
    reviewerEmail: string
  }>
  returnPolicy?: string
  minimumOrderQuantity?: number
  meta?: {
    createdAt: string
    updatedAt: string
    barcode?: string
    qrCode?: string
  }
  thumbnail: string
  images: string[]
}

export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export interface Category {
  slug: string
  name: string
  url: string
}

