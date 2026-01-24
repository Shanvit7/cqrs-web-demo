<script setup lang="ts">
import { ref, computed } from 'vue'
import { ShoppingCartIcon, PlusIcon, MinusIcon, Trash2Icon } from 'lucide-vue-next'
import { useProducts } from '@/composables/use-product'
import { useCartStore } from '@/stores/cart.store'
import Button from '@/components/ui/button.vue'
import CartDrawer from '@/components/cart-drawer.vue'
import ProductCardSkeleton from '@/components/product-card-skeleton.vue'
import type { Product } from '@/types/schema'

const cartStore = useCartStore()
const page = ref(1)
const limit = ref(30)
const isCartDrawerOpen = ref(false)

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
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="mb-4 text-4xl font-light text-black tracking-tight md:text-5xl">
          Products
        </h1>
        <p class="text-lg text-gray-700">
          Explore our product catalog powered by DummyJSON. Add items to your cart to create an order.
        </p>
      </div>

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
</style>
