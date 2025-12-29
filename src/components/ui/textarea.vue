<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  class?: string
  id?: string
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaClass = computed(() => {
  return cn(
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.class
  )
})

const value = computed({
  get: () => props.modelValue ?? '',
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <textarea
    :id="id"
    :class="textareaClass"
    :placeholder="placeholder"
    :disabled="disabled"
    :rows="rows"
    v-model="value"
  />
</template>



