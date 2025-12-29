<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils'

interface Props {
  message?: string
  class?: string
}

const props = defineProps<Props>()

const errorClass = computed(() => {
  return cn('text-sm font-medium text-destructive', props.class)
})
</script>

<template>
  <p v-if="message" :class="errorClass">
    {{ message }}
  </p>
</template>



