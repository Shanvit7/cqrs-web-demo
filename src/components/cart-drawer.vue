<script setup lang="ts">
import { computed } from 'vue'
import { XIcon, PlusIcon, MinusIcon, Trash2Icon, ShoppingBagIcon } from 'lucide-vue-next'
import Sheet from '@/components/ui/sheet.vue'
import Button from '@/components/ui/button.vue'
import { useCartStore } from '@/stores/cart.store'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const cartStore = useCartStore()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const cartItems = computed(() => cartStore.items)
const totalPrice = computed(() => cartStore.totalPrice)
const totalItems = computed(() => cartStore.totalItems)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

const handleRemove = (productId: number) => {
  cartStore.removeFromCart(productId)
  if (cartItems.value.length === 0) {
    isOpen.value = false
  }
}

const handleQuantityChange = (productId: number, delta: number) => {
  const item = cartStore.items.find(item => item.product.id === productId)
  if (item) {
    const newQuantity = item.quantity + delta
    if (newQuantity <= 0) {
      handleRemove(productId)
    } else {
      cartStore.updateQuantity(productId, newQuantity)
    }
  }
}

const handleCheckout = () => {
  // TODO: Navigate to checkout or create order
  console.log('Checkout clicked')
}
</script>

<template>
  <Sheet v-model:open="isOpen" side="right">
    <!-- Header -->
    <div class="flex items-center justify-between border-b pb-4 mb-4">
      <div class="flex items-center gap-2">
        <ShoppingBagIcon class="h-5 w-5" />
        <h2 class="text-lg font-semibold">Shopping Cart</h2>
        <span v-if="totalItems > 0" class="text-sm text-muted-foreground">
          ({{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }})
        </span>
      </div>
      <button
        @click="isOpen = false"
        class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <XIcon class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </button>
    </div>

    <!-- Empty Cart -->
    <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center h-full py-12">
      <ShoppingBagIcon class="h-16 w-16 text-muted-foreground mb-4" />
      <p class="text-lg font-medium text-muted-foreground mb-2">Your cart is empty</p>
      <p class="text-sm text-muted-foreground mb-6">Add some products to get started</p>
      <Button @click="isOpen = false" variant="outline">
        Continue Shopping
      </Button>
    </div>

    <!-- Cart Items -->
    <div v-else class="flex flex-col h-full">
      <div class="flex-1 overflow-y-auto space-y-4 mb-4">
        <div
          v-for="item in cartItems"
          :key="item.product.id"
          class="flex gap-4 border-b pb-4"
        >
          <!-- Product Image -->
          <div class="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
            <img
              :src="item.product.thumbnail"
              :alt="item.product.title"
              class="h-full w-full object-cover"
            />
          </div>

          <!-- Product Info -->
          <div class="flex-1 space-y-1">
            <h3 class="text-sm font-medium line-clamp-2">
              {{ item.product.title }}
            </h3>
            <p class="text-sm text-muted-foreground">
              {{ formatPrice(item.product.price) }} each
            </p>

            <!-- Quantity Controls -->
            <div class="flex items-center gap-2 mt-2">
              <div class="flex items-center gap-1 rounded-md border">
                <button
                  @click="handleQuantityChange(item.product.id, -1)"
                  class="p-1.5 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="item.quantity <= 0"
                >
                  <MinusIcon class="h-3 w-3" />
                </button>
                <span class="min-w-[2rem] text-center text-sm font-medium">
                  {{ item.quantity }}
                </span>
                <button
                  @click="handleQuantityChange(item.product.id, 1)"
                  class="p-1.5 hover:bg-accent transition-colors"
                >
                  <PlusIcon class="h-3 w-3" />
                </button>
              </div>

              <button
                @click="handleRemove(item.product.id)"
                class="ml-auto p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
              >
                <Trash2Icon class="h-4 w-4" />
              </button>
            </div>

            <!-- Item Total -->
            <p class="text-sm font-semibold mt-1">
              {{ formatPrice(item.product.price * item.quantity) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer with Total and Checkout -->
      <div class="border-t pt-4 space-y-4">
        <div class="flex items-center justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>{{ formatPrice(totalPrice) }}</span>
        </div>
        <Button class="w-full" size="lg" @click="handleCheckout">
          Proceed to Checkout
        </Button>
        <Button
          variant="outline"
          class="w-full"
          @click="isOpen = false"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  </Sheet>
</template>
