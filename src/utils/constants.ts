// CQRS OMS API Configuration
export const BASE_SERVICE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Order Status Constants
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Pagination Defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;