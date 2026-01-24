<script setup lang="ts">
import Skeleton from '@/components/ui/skeleton.vue'
</script>

<template>
  <div class="group overflow-hidden rounded-lg border border-gray-200 bg-white">
    <!-- Product Image Skeleton -->
    <div class="aspect-square w-full overflow-hidden bg-gray-100">
      <Skeleton class="h-full w-full" />
    </div>

    <!-- Product Info Skeleton -->
    <div class="p-4 space-y-3">
      <!-- Title Skeleton -->
      <div class="space-y-2">
        <Skeleton class="h-5 w-3/4" />
        <Skeleton class="h-4 w-1/2" />
      </div>

      <!-- Description Skeleton -->
      <div class="space-y-2">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-5/6" />
      </div>

      <!-- Price and Rating Skeleton -->
      <div class="flex items-center justify-between">
        <Skeleton class="h-7 w-20" />
        <Skeleton class="h-4 w-12" />
      </div>

      <!-- Button Skeleton -->
      <Skeleton class="h-10 w-full" />
    </div>
  </div>
</template>
