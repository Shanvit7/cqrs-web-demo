import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/types/schema'
import { generateCustomerId } from '@/utils'

export interface CartItem {
  product: Product
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const customerId = ref<string>(generateCustomerId())

  // Getters
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  })

  // Actions
  function addToCart(product: Product, quantity: number = 1) {
    const existingItem = items.value.find(
      (item) => item.product.id === product.id
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
  }

  function removeFromCart(productId: number) {
    const index = items.value.findIndex((item) => item.product.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const item = items.value.find((item) => item.product.id === productId)
    if (item) {
      item.quantity = quantity
    }
  }

  function clearCart() {
    items.value = []
  }

  function isInCart(productId: number): boolean {
    return items.value.some((item) => item.product.id === productId)
  }

  /**
   * Regenerate customer ID (useful for demo/testing)
   */
  function regenerateCustomerId() {
    customerId.value = generateCustomerId()
  }

  return {
    // State
    items,
    customerId,
    // Getters
    totalItems,
    totalPrice,
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    regenerateCustomerId,
  }
}, {
  persist: {
    key: 'cqrs-oms-cart',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
  },
})
