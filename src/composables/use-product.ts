// HOOKS
import { useQuery } from "@tanstack/vue-query";
// SERVICES
import { productService } from "@/services/product.service";

export const useProducts = (params?: {
  limit?: number
  skip?: number
  select?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAllProducts(params),
  });
};

export const useProduct = (productId: number, enabled = true) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productService.getProduct(productId),
    enabled: enabled && !!productId,
  });
};

export const useSearchProducts = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => productService.searchProducts(query),
    enabled: enabled && query.length > 0,
  });
};

export const useProductsByCategory = (category: string, enabled = true) => {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: () => productService.getProductsByCategory(category),
    enabled: enabled && !!category,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  });
};
