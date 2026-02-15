<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircleIcon, CheckCircle2Icon, XCircleIcon, InfoIcon, Loader2Icon } from 'lucide-vue-next'
import Dialog from './dialog.vue'
import Button from './button.vue'

interface AlertDialogProps {
  open?: boolean
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading'
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

const props = withDefaults(defineProps<AlertDialogProps>(), {
  open: false,
  type: 'info',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  showCancel: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const close = () => {
  isOpen.value = false
}

const handleConfirm = async () => {
  if (props.onConfirm) {
    await props.onConfirm()
  }
  close()
}

const handleCancel = () => {
  if (props.onCancel) {
    props.onCancel()
  }
  close()
}

const iconMap = {
  success: CheckCircle2Icon,
  error: XCircleIcon,
  warning: AlertCircleIcon,
  info: InfoIcon,
  loading: Loader2Icon,
}

const iconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  loading: 'text-gray-600',
}

const Icon = computed(() => iconMap[props.type])
</script>

<template>
  <Dialog v-model:open="isOpen">
    <div class="flex flex-col gap-5">
      <!-- Header -->
      <div class="flex items-start gap-4">
        <div
          :class="[
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-colors',
            type === 'success' && 'bg-green-100',
            type === 'error' && 'bg-red-100',
            type === 'warning' && 'bg-yellow-100',
            type === 'info' && 'bg-blue-100',
            type === 'loading' && 'bg-gray-100',
          ]"
        >
          <Icon
            :class="[
              'h-6 w-6',
              iconColors[type],
              type === 'loading' && 'animate-spin',
            ]"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h3 v-if="title" class="text-xl font-semibold text-gray-900 leading-tight">
            {{ title }}
          </h3>
          <template v-if="$slots.description">
            <div class="mt-2">
              <slot name="description" />
            </div>
          </template>
          <p v-else-if="description" class="mt-2 text-sm leading-relaxed text-gray-600">
            {{ description }}
          </p>
        </div>
      </div>

      <!-- Content -->
      <div v-if="$slots.default" class="pl-16">
        <slot />
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button
          v-if="showCancel"
          variant="outline"
          @click="handleCancel"
          :disabled="type === 'loading'"
        >
          {{ cancelText }}
        </Button>
        <Button
          :variant="type === 'error' ? 'destructive' : 'default'"
          @click="handleConfirm"
          :disabled="type === 'loading'"
        >
          <Loader2Icon v-if="type === 'loading'" class="mr-2 h-4 w-4 animate-spin" />
          {{ confirmText }}
        </Button>
      </div>
    </div>
  </Dialog>
</template>
