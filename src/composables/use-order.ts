// HOOKS
import { useMutation, useQuery } from "@tanstack/vue-query";
// SERVICES
import { orderService } from "@/services/order.service";

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: orderService.createOrder,
  });
};

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      orderService.updateOrderStatus(orderId, status),
  });
};

export const useGetOrder = (orderId: string, enabled = true) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: enabled && !!orderId,
  });
};

export const useListOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.listOrders(params),
  });
};