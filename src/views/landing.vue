<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Github, ExternalLink } from 'lucide-vue-next'
import Button from '@/components/ui/button.vue'

const router = useRouter()

const handleGetStarted = () => {
  router.push('/products')
}

const handleViewEvents = () => {
  const route = router.resolve('/admin')
  window.open(route.href, '_blank')
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto max-w-4xl px-6 py-12 md:px-8 md:py-16">
      <!-- Hero Section -->
      <div class="mb-16 text-center">
        <h1 class="mb-6 text-5xl font-light text-black tracking-tight md:text-6xl">
          CQRS OMS Demo
        </h1>
        <p class="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-gray-700">
          A demonstration of a CQRS (Command Query Responsibility Segregation) Order Management System built with Bun, Hono, PostgreSQL, and Redis. Explore products, add them to your cart, and experience CQRS + Event Sourcing architecture in action.
        </p>
        <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button class="px-8 py-3 text-base md:text-lg" @click="handleGetStarted">
            Get Started
          </Button>
          <Button 
            variant="outline" 
            class="px-8 py-3 text-base md:text-lg" 
            @click="handleViewEvents"
          >
            View Events Dashboard
          </Button>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="space-y-12">
        <!-- What You're Looking At -->
        <section>
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            What You're Looking At
          </h2>
          <p class="mb-4 text-base leading-relaxed text-gray-700">
            This frontend demonstrates how to interact with a CQRS + Event Sourcing backend architecture. All order operations are separated into commands (writes) and queries (reads).
          </p>
          <ul class="ml-6 list-disc space-y-2 text-base leading-relaxed text-gray-700">
            <li><strong>Commands</strong>: Create orders and update status (write to PostgreSQL event store)</li>
            <li><strong>Queries</strong>: Fetch orders from optimized Redis read models</li>
            <li><strong>Event Sourcing</strong>: All state changes stored as events in PostgreSQL</li>
            <li><strong>Read Models</strong>: Redis projections updated asynchronously from events</li>
            <li><strong>Separation</strong>: Write and read databases are completely independent</li>
          </ul>
        </section>

        <!-- How the Demo Works -->
        <section>
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            How the Demo Works
          </h2>
          <ol class="ml-6 list-decimal space-y-2 text-base leading-relaxed text-gray-700">
            <li><strong>Explore Products</strong>: Browse products from DummyJSON API and add them to your cart</li>
            <li><strong>Add to Cart</strong>: Products are stored in Zustand store (client-side cart management)</li>
            <li><strong>Create Order</strong>: When ready, create an order → Frontend dispatches CreateOrderCommand → Events saved to PostgreSQL → Projections update Redis</li>
            <li><strong>View Orders</strong>: Frontend executes GetOrderQuery → Reads from Redis read model</li>
            <li><strong>Update Status</strong>: Frontend dispatches UpdateOrderStatusCommand → New event appended → Redis updated</li>
          </ol>
          <p class="mt-4 text-base leading-relaxed text-gray-700">
            This architecture provides 10-100x faster reads than traditional approaches while maintaining complete audit trails.
          </p>
        </section>

        <!-- What This Demonstrates -->
        <section>
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            What This Demonstrates
          </h2>
          <ul class="ml-6 list-disc space-y-2 text-base leading-relaxed text-gray-700">
            <li><strong>CQRS Pattern</strong>: Separation of command and query responsibilities</li>
            <li><strong>Event Sourcing</strong>: Complete history of all domain events</li>
            <li><strong>Read Model Projections</strong>: Optimized views for fast queries</li>
            <li><strong>Scalability</strong>: Read and write sides can scale independently</li>
            <li><strong>Eventual Consistency</strong>: Read models updated asynchronously</li>
            <li><strong>Event Replay</strong>: Can rebuild read models from event store</li>
          </ul>
        </section>

        <!-- Architecture Benefits -->
        <section>
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            Architecture Benefits
          </h2>
          <ul class="ml-6 list-disc space-y-2 text-base leading-relaxed text-gray-700">
            <li><strong>Performance</strong>: Redis provides sub-millisecond read performance</li>
            <li><strong>Durability</strong>: PostgreSQL ensures events are never lost</li>
            <li><strong>Flexibility</strong>: Add new read models without changing write model</li>
            <li><strong>Audit Trail</strong>: Complete history in PostgreSQL event store</li>
            <li><strong>Real-World</strong>: Matches production architecture patterns</li>
          </ul>
        </section>

        <!-- Try It -->
        <section class="rounded-lg border border-gray-200 bg-gray-50 p-6 md:p-8">
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            Try It
          </h2>
          <p class="text-base leading-relaxed text-gray-700">
            Click "Get Started" to explore products from DummyJSON, add them to your cart, and experience the CQRS architecture. Products are fetched from an external API, while orders are managed through the CQRS backend.
          </p>
          <p class="mt-4 text-base leading-relaxed text-gray-700">
            The backend demonstrates CQRS patterns: commands generate events stored in PostgreSQL, while queries read from optimized Redis read models updated by projections.
          </p>
        </section>

        <!-- Repository Links -->
        <section>
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            Source Code
          </h2>
          <p class="mb-4 text-base leading-relaxed text-gray-700">
            This demo consists of two repositories - a backend API and a frontend application:
          </p>
          <div class="space-y-3">
            <a
              href="https://github.com/Shanvit7/cqrs-server-demo"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
            >
              <Github class="h-5 w-5 flex-shrink-0 text-gray-700" />
              <div class="flex-1">
                <div class="font-semibold text-gray-900">Backend Repository</div>
                <div class="text-sm text-gray-600">cqrs-server-demo</div>
              </div>
              <ExternalLink class="h-4 w-4 flex-shrink-0 text-gray-400" />
            </a>
            <a
              href="https://github.com/Shanvit7/cqrs-web-demo"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
            >
              <Github class="h-5 w-5 flex-shrink-0 text-gray-700" />
              <div class="flex-1">
                <div class="font-semibold text-gray-900">Frontend Repository</div>
                <div class="text-sm text-gray-600">cqrs-web-demo</div>
              </div>
              <ExternalLink class="h-4 w-4 flex-shrink-0 text-gray-400" />
            </a>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
