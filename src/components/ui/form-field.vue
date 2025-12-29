<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const fieldClass = computed(() => {
  return cn('space-y-2', props.class)
})
</script>

<template>
  <div :class="fieldClass">
    <slot />
  </div>
</template>



