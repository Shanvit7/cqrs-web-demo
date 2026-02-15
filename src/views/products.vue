<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCartIcon, PlusIcon, MinusIcon, Trash2Icon, Activity, Package, X } from 'lucide-vue-next'
import { useProducts } from '@/composables/use-product'
import { useCartStore } from '@/stores/cart.store'
import { useListOrders, useUpdateOrderStatus } from '@/composables/use-order'
import { useQueryClient } from '@tanstack/vue-query'
import Button from '@/components/ui/button.vue'
import AlertDialog from '@/components/ui/alert-dialog.vue'
import CartDrawer from '@/components/cart-drawer.vue'
import ProductCardSkeleton from '@/components/product-card-skeleton.vue'
import type { Product, OrderStatus, ListOrdersResponse } from '@/types/schema'

const router = useRouter()
const queryClient = useQueryClient()
const cartStore = useCartStore()
const page = ref(1)
const limit = ref(30)
const isCartDrawerOpen = ref(false)
const showMyOrders = ref(false)
const updateOrderStatusMutation = useUpdateOrderStatus()

// Dialog states
const cancelDialogOpen = ref(false)
const cancelDialogLoading = ref(false)
const selectedOrderId = ref<string | null>(null)
const successDialogOpen = ref(false)
const successMessage = ref('')

// Fetch user's orders
const { data: ordersData, isLoading: isLoadingOrders } = useListOrders({
  customerId: cartStore.customerId,
  limit: 20,
})

const { data: productsData, isLoading, isError } = useProducts({
  limit: limit.value,
  skip: (page.value - 1) * limit.value,
})

const products = computed(() => {
  if (!productsData.value) return []
  return productsData.value.products || []
})

const total = computed(() => {
  if (!productsData.value) return 0
  return productsData.value.total || 0
})

const cartItemCount = computed(() => cartStore.totalItems)
const hasItemsInCart = computed(() => cartItemCount.value > 0)

const addToCart = (product: Product) => {
  cartStore.addToCart(product, 1)
}

const removeFromCart = (productId: number) => {
  cartStore.removeFromCart(productId)
}

const getCartQuantity = (productId: number) => {
  const item = cartStore.items.find(item => item.product.id === productId)
  return item?.quantity || 0
}

const isProductInCart = (productId: number) => {
  return cartStore.isInCart(productId)
}

const handleCartClick = () => {
  isCartDrawerOpen.value = true
}

const handleViewEvents = () => {
  const route = router.resolve('/admin')
  window.open(route.href, '_blank')
}

const orders = computed(() => {
  if (!ordersData.value) return []
  const data = ordersData.value as ListOrdersResponse
  return data.orders || []
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const canCancelOrder = (status: OrderStatus) => {
  return status !== 'cancelled' && status !== 'delivered'
}

const openCancelDialog = (orderId: string) => {
  selectedOrderId.value = orderId
  cancelDialogOpen.value = true
}

const handleCancelOrder = async () => {
  if (!selectedOrderId.value) return
  
  cancelDialogLoading.value = true
  try {
    await updateOrderStatusMutation.mutateAsync({ orderId: selectedOrderId.value, status: 'cancelled' })
    cancelDialogOpen.value = false
    successMessage.value = 'Order cancelled successfully!'
    successDialogOpen.value = true
    // Refresh orders list
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    // Refresh events in admin panel if open
    queryClient.invalidateQueries({ queryKey: ['events'] })
  } catch (error) {
    console.error('Failed to cancel order:', error)
    cancelDialogOpen.value = false
    successMessage.value = error instanceof Error ? error.message : 'Failed to cancel order. Please try again.'
    successDialogOpen.value = true
  } finally {
    cancelDialogLoading.value = false
    selectedOrderId.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="mb-4 text-4xl font-light text-black tracking-tight md:text-5xl">
              Products
            </h1>
            <p class="text-lg text-gray-700">
              Explore our product catalog powered by DummyJSON. Add items to your cart to create an order.
            </p>
          </div>
          <div class="flex gap-2">
            <Button
              variant="outline"
              @click="showMyOrders = !showMyOrders"
              class="hidden sm:flex"
            >
              <Package class="mr-2 h-4 w-4" />
              My Orders ({{ orders.length }})
            </Button>
            <Button
              variant="outline"
              @click="handleViewEvents"
              class="hidden sm:flex"
            >
              <Activity class="mr-2 h-4 w-4" />
              View Events
            </Button>
          </div>
        </div>
      </div>

      <!-- My Orders Section -->
      <Transition name="slide">
        <div v-if="showMyOrders" class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-2xl font-semibold text-gray-900">My Orders</h2>
            <Button variant="ghost" size="sm" @click="showMyOrders = false">
              <X class="size-4" />
            </Button>
          </div>

          <div v-if="isLoadingOrders" class="py-8 text-center">
            <p class="text-gray-500">Loading orders...</p>
          </div>

          <div v-else-if="orders.length === 0" class="py-8 text-center">
            <Package class="mx-auto size-12 text-gray-300 mb-4" />
            <p class="text-gray-500">You haven't placed any orders yet.</p>
            <p class="mt-2 text-sm text-gray-400">Add items to your cart and checkout to create an order!</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="order in orders"
              :key="order.id"
              class="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
            >
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div class="flex-1">
                  <div class="mb-2 flex items-center gap-3">
                    <h3 class="font-semibold text-gray-900">
                      Order #<span class="font-mono text-blue-600">{{ order.id.slice(0, 8) }}...</span>
                    </h3>
                    <span
                      :class="[
                        'inline-flex capitalize items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        getStatusColor(order.status)
                      ]"
                    >
                      {{ order.status }}
                    </span>
                  </div>
                  
                  <div class="space-y-1 text-sm text-gray-600">
                    <p>
                      <span class="font-medium">Items:</span> {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}
                    </p>
                    <p>
                      <span class="font-medium">Total:</span> {{ formatPrice(order.totalAmount) }}
                    </p>
                    <p>
                      <span class="font-medium">Placed:</span> {{ formatDate(order.createdAt) }}
                    </p>
                    <p v-if="order.updatedAt !== order.createdAt">
                      <span class="font-medium">Updated:</span> {{ formatDate(order.updatedAt) }}
                    </p>
                  </div>

                  <!-- Order Items -->
                  <div class="mt-3 space-y-1">
                    <p class="text-xs font-medium text-gray-700">Items:</p>
                    <div class="space-y-1">
                      <div
                        v-for="(item, idx) in order.items"
                        :key="idx"
                        class="text-xs text-gray-600"
                      >
                        • {{ item.productId }} - Qty: {{ item.quantity }} × {{ formatPrice(item.price) }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-2 sm:items-end">
                  <Button
                    v-if="canCancelOrder(order.status)"
                    variant="destructive"
                    size="sm"
                    @click="openCancelDialog(order.id)"
                    :disabled="updateOrderStatusMutation.isPending.value"
                  >
                    <X class="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                  <p v-else class="text-xs text-gray-400">
                    {{ order.status === 'delivered' ? 'Order delivered' : 'Order cancelled' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Loading State with Skeleton -->
      <div v-if="isLoading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductCardSkeleton v-for="i in 8" :key="i" />
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="rounded-lg border border-red-200 bg-red-50 p-6">
        <p class="text-red-800">Failed to load products. Please try again later.</p>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="product in products"
          :key="product.id"
          class="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
        >
          <!-- Product Image -->
          <div class="aspect-square w-full overflow-hidden bg-gray-100">
            <img
              :src="product.thumbnail"
              :alt="product.title"
              class="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <h3 class="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
              {{ product.title }}
            </h3>
            <p class="mb-3 line-clamp-2 text-sm text-gray-600">
              {{ product.description }}
            </p>
            
            <!-- Price and Rating -->
            <div class="mb-4 flex items-center justify-between">
              <div>
                <span class="text-2xl font-bold text-gray-900">${{ product.price }}</span>
                <span v-if="product.discountPercentage" class="ml-2 text-sm text-green-600">
                  {{ product.discountPercentage }}% off
                </span>
              </div>
              <div v-if="product.rating" class="text-sm text-gray-500">
                ⭐ {{ product.rating }}
              </div>
            </div>

            <!-- Cart Actions -->
            <div v-if="isProductInCart(product.id)" class="space-y-2">
              <!-- Quantity Controls -->
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  class="flex-1"
                  @click="removeFromCart(product.id)"
                >
                  <Trash2Icon class="h-4 w-4" />
                  <span class="ml-1">Remove</span>
                </Button>
                <div class="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5">
                  <button
                    @click="cartStore.updateQuantity(product.id, getCartQuantity(product.id) - 1)"
                    class="rounded p-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="getCartQuantity(product.id) <= 0"
                  >
                    <MinusIcon class="h-4 w-4 text-gray-600" />
                  </button>
                  <span class="min-w-[2rem] text-center font-medium">{{ getCartQuantity(product.id) }}</span>
                  <button
                    @click="cartStore.updateQuantity(product.id, getCartQuantity(product.id) + 1)"
                    class="rounded p-1 hover:bg-gray-100 transition-colors"
                  >
                    <PlusIcon class="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            <Button
              v-else
              variant="default"
              class="w-full"
              @click="addToCart(product)"
            >
              <PlusIcon class="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <!-- Pagination Info -->
      <div v-if="!isLoading && !isError" class="mt-8 text-center text-gray-600">
        Showing {{ products.length }} of {{ total }} products
      </div>
    </div>

    <!-- Cart FAB (Floating Action Button) -->
    <Transition name="fab">
      <button
        v-if="hasItemsInCart"
        @click="handleCartClick"
        class="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-primary px-6 py-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="View Cart"
      >
        <div class="relative">
          <ShoppingCartIcon class="h-6 w-6 text-primary-foreground" />
          <span
            v-if="cartItemCount > 0"
            class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground"
          >
            {{ cartItemCount > 99 ? '99+' : cartItemCount }}
          </span>
        </div>
        <span class="hidden text-base font-semibold text-primary-foreground sm:inline">
          Cart ({{ cartItemCount }})
        </span>
      </button>
    </Transition>

    <!-- Cart Drawer -->
    <CartDrawer v-model:open="isCartDrawerOpen" />

    <!-- Cancel Order Dialog -->
    <AlertDialog
      v-model:open="cancelDialogOpen"
      :type="cancelDialogLoading ? 'loading' : 'warning'"
      title="Cancel Order"
      description="Are you sure you want to cancel this order? This action cannot be undone."
      confirm-text="Yes, Cancel Order"
      cancel-text="Keep Order"
      :on-confirm="handleCancelOrder"
    />

    <!-- Success/Error Dialog -->
    <AlertDialog
      v-model:open="successDialogOpen"
      :type="successMessage.includes('successfully') ? 'success' : 'error'"
      :title="successMessage.includes('successfully') ? 'Success' : 'Error'"
      :description="successMessage"
      confirm-text="OK"
      :show-cancel="false"
    />
  </div>
</template>

<style scoped>
/* FAB Animation */
.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s ease;
}

.fab-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.fab-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

/* Slide Animation */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
