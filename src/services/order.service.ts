// CORE
import { ApiService } from '@/services/fetch';
// CONSTANTS
import { BASE_SERVICE_URL } from '@/utils/constants';

const apiService = new ApiService(`${BASE_SERVICE_URL}/orders`)

export const orderService = {
  async createOrder(payload: {
    customerId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    totalAmount: number;
  }) {
    const { data, isError = false, error } = await apiService.post('', payload)
    if (isError) {
      throw new Error(error?.message || 'Failed to create order')
    }
    return data
  },

  async getOrder(orderId: string) {
    const { data, isError = false, error } = await apiService.get(`/${orderId}`)
    if (isError) {
      throw new Error(error?.message || 'Failed to get order')
    }
    return data
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { data, isError = false, error } = await apiService.patch(`/${orderId}`, { status })
    if (isError) {
      throw new Error(error?.message || 'Failed to update order status')
    }
    return data
  },

  async listOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
  }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.customerId) queryParams.append('customerId', params.customerId)
    
    const queryString = queryParams.toString()
    const endpoint = queryString ? `?${queryString}` : ''
    
    const { data, isError = false, error } = await apiService.get(endpoint)
    if (isError) {
      throw new Error(error?.message || 'Failed to list orders')
    }
    return data
  },
}