<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Activity, Filter, RefreshCw, TrendingUp, Clock, Database, Zap, X } from 'lucide-vue-next'
import { useEvents } from '@/composables/use-event'
import { useUpdateOrderStatus } from '@/composables/use-order'
import { useQueryClient } from '@tanstack/vue-query'
import { cn } from '@/utils'
import Button from '@/components/ui/button.vue'
import AlertDialog from '@/components/ui/alert-dialog.vue'
import type { CQRSEvent, EventType, OrderStatus } from '@/types/schema'

const router = useRouter()
const queryClient = useQueryClient()
const updateOrderStatusMutation = useUpdateOrderStatus()

// Filters
const selectedEventType = ref<EventType | OrderStatus | 'all'>('all')
const searchAggregateId = ref('')
const autoRefresh = ref(true)
const updatingOrderId = ref<string | null>(null)

// Dialog states
const statusUpdateDialogOpen = ref(false)
const statusUpdateDialogLoading = ref(false)
const selectedOrderIdForUpdate = ref<string | null>(null)
const selectedNewStatus = ref<OrderStatus | null>(null)
const successDialogOpen = ref(false)
const errorDialogOpen = ref(false)
const dialogMessage = ref('')

// Fetch events - only pass EventType, not OrderStatus filters
const eventTypeFilter = computed(() => {
  if (selectedEventType.value === 'all') return undefined
  // Only pass EventType values, not OrderStatus values
  if (['processing', 'shipped', 'delivered'].includes(selectedEventType.value)) return undefined
  return selectedEventType.value as EventType
})

const { data: eventsData, isLoading, isPolling, startPolling, stopPolling } = useEvents(
  {
    limit: 50,
    eventType: eventTypeFilter.value,
  },
  autoRefresh.value
)

// Helper to extract order ID from event
const getOrderId = (event: CQRSEvent): string => {
  // Try metadata first
  if (event.metadata?.orderId) return event.metadata.orderId
  // Try payload
  if (event.payload.orderId) return String(event.payload.orderId)
  // Try aggregateId if present
  if (event.aggregateId) return event.aggregateId
  // Fallback to eventId
  return event.eventId
}

// Helper to infer event type from payload
const inferEventType = (event: CQRSEvent): EventType => {
  // Check for cancelled status first (even if eventType is OrderStatusUpdated)
  if (event.payload?.status === 'cancelled') return 'OrderCancelled'
  
  // If eventType is explicitly set, use it (unless it's cancelled)
  if (event.eventType && event.eventType !== 'OrderStatusUpdated') return event.eventType
  if (event.metadata?.eventType && event.metadata.eventType !== 'OrderStatusUpdated') {
    return event.metadata.eventType as EventType
  }
  
  // Infer from payload structure
  if (event.payload?.status) return 'OrderStatusUpdated'
  if (event.payload?.items && event.payload?.totalAmount) return 'OrderCreated'
  
  // Check explicit eventType as fallback
  if (event.eventType) return event.eventType
  if (event.metadata?.eventType) return event.metadata.eventType as EventType
  
  return 'OrderCreated' // Default
}

// Helper to get event timestamp
const getEventTimestamp = (event: CQRSEvent): Date | null => {
  if (event.occurredAt) return new Date(event.occurredAt)
  if (event.metadata?.timestamp) return new Date(event.metadata.timestamp)
  return null
}

const events = computed(() => {
  if (!eventsData.value) return []
  let filtered = eventsData.value.events || []
  
  // Filter by order ID search (search in orderId, eventId, or customerId)
  if (searchAggregateId.value) {
    const searchLower = searchAggregateId.value.toLowerCase()
    filtered = filtered.filter(event => {
      const orderId = getOrderId(event).toLowerCase()
      const customerId = event.payload.customerId?.toLowerCase() || ''
      const eventId = event.eventId.toLowerCase()
      return orderId.includes(searchLower) || 
             customerId.includes(searchLower) || 
             eventId.includes(searchLower)
    })
  }
  
  // Filter by event type or status if selected
  if (selectedEventType.value !== 'all') {
    const filterValue = selectedEventType.value
    // Check if it's a status filter (processing, shipped, delivered)
    if (['processing', 'shipped', 'delivered'].includes(filterValue)) {
      filtered = filtered.filter(event => {
        const status = getCurrentStatus(event)
        return status === filterValue
      })
    } else {
      // Filter by event type
      filtered = filtered.filter(event => inferEventType(event) === filterValue)
    }
  }
  
  // Sort by timestamp (most recent first) or by eventId if no timestamp
  return filtered.sort((a, b) => {
    const dateA = getEventTimestamp(a)
    const dateB = getEventTimestamp(b)
    
    if (dateA && dateB) {
      return dateB.getTime() - dateA.getTime()
    }
    if (dateA) return -1
    if (dateB) return 1
    // Fallback: sort by eventId (newer UUIDs first)
    return b.eventId.localeCompare(a.eventId)
  })
})

// Stats
const stats = computed(() => {
  const allEvents = eventsData.value?.events || []
  return {
    total: allEvents.length,
    orderCreated: allEvents.filter(e => {
      const inferred = inferEventType(e)
      return inferred === 'OrderCreated' || (e.eventType === 'OrderCreated' || e.metadata?.eventType === 'OrderCreated')
    }).length,
    processing: allEvents.filter(e => {
      const status = getCurrentStatus(e)
      return status === 'processing'
    }).length,
    shipped: allEvents.filter(e => {
      const status = getCurrentStatus(e)
      return status === 'shipped'
    }).length,
    delivered: allEvents.filter(e => {
      const status = getCurrentStatus(e)
      return status === 'delivered'
    }).length,
    cancelled: allEvents.filter(e => {
      // Check for cancelled status in payload (OrderStatusUpdated with cancelled status)
      if (e.payload?.status === 'cancelled') return true
      // Check for OrderCancelled event type
      if (e.eventType === 'OrderCancelled' || e.metadata?.eventType === 'OrderCancelled') return true
      // Check inferred type
      return inferEventType(e) === 'OrderCancelled'
    }).length,
  }
})

// Get display label for event type
const getEventTypeLabel = (event: CQRSEvent): string => {
  const inferred = inferEventType(event)
  if (inferred === 'OrderCancelled') return 'Cancelled'
  if (inferred === 'OrderCreated') return 'Order Created'
  
  // For OrderStatusUpdated, show the actual status
  const status = getCurrentStatus(event)
  if (status) {
    const statusLabels: Record<OrderStatus, string> = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    }
    return statusLabels[status] || 'Status Updated'
  }
  
  return 'Status Updated'
}

// Event type colors based on status
const getEventTypeColor = (event: CQRSEvent): string => {
  const inferred = inferEventType(event)
  if (inferred === 'OrderCancelled') return 'bg-red-500'
  if (inferred === 'OrderCreated') return 'bg-blue-500'
  
  // Color based on actual status
  const status = getCurrentStatus(event)
  if (status) {
    const statusColors: Record<OrderStatus, string> = {
      pending: 'bg-yellow-500',
      processing: 'bg-indigo-500', // Changed from blue-500 to differentiate from OrderCreated
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
    }
    return statusColors[status] || 'bg-gray-500'
  }
  
  return 'bg-yellow-500' // Default for OrderStatusUpdated without status
}

const getEventTypeBg = (event: CQRSEvent): string => {
  const inferred = inferEventType(event)
  if (inferred === 'OrderCancelled') return 'bg-red-50 border-red-200'
  if (inferred === 'OrderCreated') return 'bg-blue-50 border-blue-200'
  
  // Background based on actual status
  const status = getCurrentStatus(event)
  if (status) {
    const statusBgs: Record<OrderStatus, string> = {
      pending: 'bg-yellow-50 border-yellow-200',
      processing: 'bg-indigo-50 border-indigo-200', // Changed from blue to differentiate from OrderCreated
      shipped: 'bg-purple-50 border-purple-200',
      delivered: 'bg-green-50 border-green-200',
      cancelled: 'bg-red-50 border-red-200',
    }
    return statusBgs[status] || 'bg-gray-50 border-gray-200'
  }
  
  return 'bg-yellow-50 border-yellow-200' // Default
}

const formatDate = (date: Date | null) => {
  if (!date || isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatRelativeTime = (event: CQRSEvent) => {
  const date = getEventTimestamp(event)
  if (!date || isNaN(date.getTime())) return 'just now'
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  
  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return formatDate(date)
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    startPolling()
  } else {
    stopPolling()
  }
}

const clearFilters = () => {
  selectedEventType.value = 'all'
  searchAggregateId.value = ''
}

// Get valid next statuses based on current status
// Follows the order status progression rules:
// - Forward progression: pending → processing → shipped → delivered
// - Backward correction: shipped → processing, processing → pending
// - Cancellation: Can cancel from pending, processing, shipped (but NOT delivered)
// - Final states: delivered and cancelled cannot be updated
const getValidNextStatuses = (currentStatus: OrderStatus | null): OrderStatus[] => {
  if (!currentStatus) {
    // If no status, can set to initial status
    return ['pending', 'processing']
  }
  
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['pending', 'shipped', 'cancelled'], // Can go backward to pending for correction
    shipped: ['processing', 'delivered', 'cancelled'], // Can go backward to processing for correction
    delivered: [], // Final state - no transitions allowed
    cancelled: [], // Final state - no transitions allowed
  }
  
  return statusFlow[currentStatus] || []
}

// Check if order can be updated (based on latest status across all events)
// Business Rules:
// - Active states (pending, processing, shipped) can be updated ✅
// - Final states (delivered, cancelled) cannot be updated ❌
// - Cancellation is done via status update to 'cancelled' (not a separate action)
// - Cannot cancel delivered orders (enforced by getValidNextStatuses returning empty array)
const canUpdateOrder = (event: CQRSEvent): boolean => {
  const orderId = getOrderId(event)
  const latestStatus = getLatestStatusForOrder(orderId)
  if (!latestStatus) return true // Can set initial status
  // Can't update if cancelled or delivered (final states)
  return latestStatus !== 'cancelled' && latestStatus !== 'delivered'
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-indigo-100 text-indigo-800', // Changed from blue to differentiate from OrderCreated
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getCurrentStatus = (event: CQRSEvent): OrderStatus | null => {
  return (event.payload.status as OrderStatus) || null
}

// Get the latest status for an order ID across all events
const getLatestStatusForOrder = (orderId: string): OrderStatus | null => {
  const allEvents = eventsData.value?.events || []
  const orderEvents = allEvents.filter(e => getOrderId(e) === orderId)
  
  // Sort events by timestamp (most recent first)
  const sortedEvents = orderEvents.sort((a, b) => {
    const dateA = getEventTimestamp(a)
    const dateB = getEventTimestamp(b)
    if (dateA && dateB) return dateB.getTime() - dateA.getTime()
    if (dateA) return -1
    if (dateB) return 1
    return 0
  })
  
  // Find the latest status from the events
  for (const event of sortedEvents) {
    const status = getCurrentStatus(event)
    if (status) return status
    
    // Also check if it's a cancelled event
    if (inferEventType(event) === 'OrderCancelled') {
      return 'cancelled'
    }
  }
  
  return null
}

const openStatusUpdateDialog = (orderId: string, newStatus: OrderStatus) => {
  selectedOrderIdForUpdate.value = orderId
  selectedNewStatus.value = newStatus
  statusUpdateDialogOpen.value = true
}

const handleUpdateStatus = async () => {
  if (!selectedOrderIdForUpdate.value || !selectedNewStatus.value) return
  
  statusUpdateDialogLoading.value = true
  updatingOrderId.value = selectedOrderIdForUpdate.value
  
  try {
    await updateOrderStatusMutation.mutateAsync({ 
      orderId: selectedOrderIdForUpdate.value, 
      status: selectedNewStatus.value 
    })
    statusUpdateDialogOpen.value = false
    dialogMessage.value = `Order status updated successfully! Order is now ${selectedNewStatus.value}.`
    successDialogOpen.value = true
    // Invalidate events query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['events'] })
  } catch (error) {
    console.error('Failed to update order status:', error)
    statusUpdateDialogOpen.value = false
    dialogMessage.value = error instanceof Error ? error.message : 'Failed to update order status. Please try again.'
    errorDialogOpen.value = true
  } finally {
    statusUpdateDialogLoading.value = false
    updatingOrderId.value = null
    selectedOrderIdForUpdate.value = null
    selectedNewStatus.value = null
  }
}

const getStatusDisplayName = (status: OrderStatus) => {
  const names: Record<OrderStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return names[status] || status
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <div class="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Activity class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">CQRS Event Monitor</h1>
              <p class="text-sm text-gray-500">Real-time event stream from PostgreSQL event store</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              @click="toggleAutoRefresh"
              :class="cn(isPolling && 'bg-green-50 text-green-700')"
            >
              <RefreshCw :class="cn('h-4 w-4 mr-2', isPolling && 'animate-spin')" />
              {{ isPolling ? 'Live' : 'Paused' }}
            </Button>
            <Button variant="outline" size="sm" @click="router.push('/products')">
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <!-- Stats Dashboard -->
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Database class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="truncate text-sm font-medium text-gray-500">Total Events</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ stats.total }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Zap class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="truncate text-sm font-medium text-gray-500">Orders Created</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ stats.orderCreated }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <TrendingUp class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="truncate text-sm font-medium text-gray-500">Processing</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ stats.processing }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Activity class="h-6 w-6 text-purple-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="truncate text-sm font-medium text-gray-500">Shipped</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ stats.shipped }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Zap class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="truncate text-sm font-medium text-gray-500">Delivered</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ stats.delivered }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <X class="h-6 w-6 text-red-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="truncate text-sm font-medium text-gray-500">Cancelled</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ stats.cancelled }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <Filter class="h-5 w-5 text-gray-400" />
            <span class="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            v-model="selectedEventType"
            class="appearance-none rounded-md border border-gray-300 bg-white bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat px-3 pr-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style="background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22currentColor%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22M19 9l-7 7-7-7%22 /%3E%3C/svg%3E');"
          >
            <option value="all">All Event Types</option>
            <option value="OrderCreated">Order Created</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="OrderCancelled">Cancelled</option>
          </select>

          <input
            v-model="searchAggregateId"
            type="text"
            placeholder="Search by Order ID, Customer ID, or Event ID..."
            class="min-w-80 flex-1 max-w-md rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <Button
            v-if="selectedEventType !== 'all' || searchAggregateId"
            variant="outline"
            size="sm"
            @click="clearFilters"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <!-- Events Timeline -->
      <div class="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Event Stream</h2>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <Clock class="h-4 w-4" />
              <span>{{ events.length }} events</span>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="p-8 text-center">
          <RefreshCw class="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p class="mt-2 text-sm text-gray-500">Loading events...</p>
        </div>

        <div v-else-if="events.length === 0" class="p-8 text-center">
          <Activity class="mx-auto h-12 w-12 text-gray-300" />
          <p class="mt-2 text-sm text-gray-500">No events found. Create an order to see events!</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <TransitionGroup
            name="event-list"
            tag="div"
            class="max-h-[600px] overflow-y-auto"
          >
            <div
              v-for="event in events"
              :key="event.eventId"
              :class="[
                'group relative px-6 py-4 transition-all hover:bg-gray-50',
                getEventTypeBg(event)
              ]"
            >
              <div class="flex items-start gap-4">
                <!-- Timeline Indicator -->
                <div class="flex flex-col items-center">
                  <div
                    :class="[
                      'h-3 w-3 rounded-full ring-2 ring-white transition-all group-hover:scale-125',
                      getEventTypeColor(event)
                    ]"
                  ></div>
                  <div class="mt-1 h-full w-0.5 bg-gray-200"></div>
                </div>

                <!-- Event Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <span
                          :class="[
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            getEventTypeColor(event),
                            'text-white'
                          ]"
                        >
                          {{ getEventTypeLabel(event) }}
                        </span>
                        <span class="text-xs text-gray-500">
                          {{ formatRelativeTime(event) }}
                        </span>
                      </div>
                      
                      <div class="mt-2">
                        <p class="text-sm font-medium text-gray-900">
                          Order ID: <span class="font-mono text-blue-600">{{ getOrderId(event) }}</span>
                        </p>
                        <p class="mt-1 text-xs text-gray-500">
                          Event ID: <span class="font-mono text-gray-700">{{ event.eventId }}</span>
                        </p>
                        <p v-if="event.payload.customerId" class="mt-1 text-xs text-gray-500">
                          Customer: <span class="font-mono">{{ event.payload.customerId }}</span>
                        </p>
                        <p class="mt-1 text-xs text-gray-500">
                          {{ formatDate(getEventTimestamp(event)) }}
                        </p>
                      </div>

                      <!-- Order Status Update Section -->
                      <div v-if="canUpdateOrder(event) && (inferEventType(event) === 'OrderCreated' || inferEventType(event) === 'OrderStatusUpdated')" class="mt-3 space-y-2">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-medium text-gray-700">Status:</span>
                          <span
                            v-if="getLatestStatusForOrder(getOrderId(event))"
                            :class="[
                              'inline-flex uppercase items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                              getStatusColor(getLatestStatusForOrder(getOrderId(event))!)
                            ]"
                          >
                            {{ getLatestStatusForOrder(getOrderId(event)) }}
                          </span>
                          <span v-else class="text-xs text-gray-400">Not set</span>
                        </div>
                        <div v-if="getValidNextStatuses(getLatestStatusForOrder(getOrderId(event))).length > 0" class="flex flex-wrap items-center gap-2">
                          <span class="text-xs font-medium text-gray-700">Update to:</span>
                          <div class="flex flex-wrap gap-1">
                            <Button
                              v-for="status in getValidNextStatuses(getLatestStatusForOrder(getOrderId(event)))"
                              :key="status"
                              variant="outline"
                              size="sm"
                              :disabled="updatingOrderId === getOrderId(event)"
                              :class="cn(
                                'text-xs',
                                status === 'cancelled' && 'border-red-300 text-red-700 hover:bg-red-50'
                              )"
                              @click="openStatusUpdateDialog(getOrderId(event), status)"
                            >
                              <RefreshCw v-if="updatingOrderId === getOrderId(event)" class="mr-1 h-3 w-3 animate-spin" />
                              <span class="capitalize">{{ status }}</span>
                            </Button>
                          </div>
                        </div>
                        <p v-else class="text-xs text-gray-400 italic">
                          Order is in final state and cannot be updated
                        </p>
                      </div>

                      <!-- Event Payload -->
                      <div class="mt-3 rounded-md bg-white/60 p-3 font-mono text-xs">
                        <pre class="whitespace-pre-wrap text-gray-700">{{ JSON.stringify(event.payload, null, 2) }}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- CQRS Explanation -->
      <div class="mt-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 ring-1 ring-blue-200">
        <h3 class="mb-2 text-lg font-semibold text-gray-900">How CQRS Events Work</h3>
        <p class="text-sm leading-relaxed text-gray-700">
          This admin panel shows events from the PostgreSQL event store. When you create or update orders:
        </p>
        <ul class="mt-2 ml-6 list-disc space-y-1 text-sm text-gray-700">
          <li><strong>Commands</strong> (POST/PATCH) write events to PostgreSQL</li>
          <li><strong>Events</strong> are projected to Redis read models asynchronously</li>
          <li><strong>Queries</strong> (GET) read from optimized Redis projections</li>
          <li>This separation provides 10-100x faster reads while maintaining complete audit trails</li>
        </ul>
      </div>
    </div>

    <!-- Status Update Confirmation Dialog -->
    <AlertDialog
      v-model:open="statusUpdateDialogOpen"
      :type="statusUpdateDialogLoading ? 'loading' : 'info'"
      title="Update Order Status"
      :description="selectedOrderIdForUpdate && selectedNewStatus ? `Are you sure you want to update order ${selectedOrderIdForUpdate.slice(0, 8)}... to ${getStatusDisplayName(selectedNewStatus)}?` : ''"
      confirm-text="Update Status"
      cancel-text="Cancel"
      :on-confirm="handleUpdateStatus"
    />

    <!-- Success Dialog -->
    <AlertDialog
      v-model:open="successDialogOpen"
      type="success"
      title="Success"
      :description="dialogMessage"
      confirm-text="OK"
      :show-cancel="false"
    />

    <!-- Error Dialog -->
    <AlertDialog
      v-model:open="errorDialogOpen"
      type="error"
      title="Error"
      :description="dialogMessage"
      confirm-text="OK"
      :show-cancel="false"
    />
  </div>
</template>

<style scoped>
/* Event list animations */
.event-list-enter-active {
  transition: all 0.5s ease-out;
}

.event-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.event-list-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.event-list-move {
  transition: transform 0.5s ease;
}

/* Smooth scrollbar */
.max-h-\[600px\]::-webkit-scrollbar {
  width: 8px;
}

.max-h-\[600px\]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.max-h-\[600px\]::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.max-h-\[600px\]::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
