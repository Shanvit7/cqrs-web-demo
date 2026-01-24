// CORE
import { ApiService } from '@/services/fetch';
// TYPES
import type { ProductsResponse, Product } from '@/types/schema';

const DUMMYJSON_BASE_URL = 'https://dummyjson.com'

const apiService = new ApiService(DUMMYJSON_BASE_URL)

export const productService = {
  async getAllProducts(params?: {
    limit?: number
    skip?: number
    select?: string
    sortBy?: string
    order?: 'asc' | 'desc'
  }): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.select) queryParams.append('select', params.select)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.order) queryParams.append('order', params.order)
    
    const queryString = queryParams.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`
    
    const { data, isError = false, error } = await apiService.get<ProductsResponse>(endpoint)
    if (isError) {
      throw new Error(error?.message || 'Failed to fetch products')
    }
    return data as ProductsResponse
  },

  async getProduct(productId: number): Promise<Product> {
    const { data, isError = false, error } = await apiService.get<Product>(`/products/${productId}`)
    if (isError) {
      throw new Error(error?.message || 'Failed to fetch product')
    }
    return data as Product
  },

  async searchProducts(query: string): Promise<ProductsResponse> {
    const { data, isError = false, error } = await apiService.get<ProductsResponse>(`/products/search?q=${encodeURIComponent(query)}`)
    if (isError) {
      throw new Error(error?.message || 'Failed to search products')
    }
    return data as ProductsResponse
  },

  async getProductsByCategory(category: string): Promise<ProductsResponse> {
    const { data, isError = false, error } = await apiService.get<ProductsResponse>(`/products/category/${category}`)
    if (isError) {
      throw new Error(error?.message || 'Failed to fetch products by category')
    }
    return data as ProductsResponse
  },

  async getCategories(): Promise<Array<{ slug: string; name: string; url: string }>> {
    const { data, isError = false, error } = await apiService.get<Array<{ slug: string; name: string; url: string }>>('/products/categories')
    if (isError) {
      throw new Error(error?.message || 'Failed to fetch categories')
    }
    return data as Array<{ slug: string; name: string; url: string }>
  },
}
