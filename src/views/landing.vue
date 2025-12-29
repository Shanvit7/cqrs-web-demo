<script setup lang="ts">
import Button from '@/components/ui/button.vue'
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto max-w-4xl px-6 py-12 md:px-8 md:py-16">
      <!-- Hero Section -->
      <div class="mb-16 text-center">
        <h1 class="mb-6 text-5xl font-light text-black tracking-tight md:text-6xl">
          Go Balancer Demo
        </h1>
        <p class="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-gray-700">
          This project demonstrates how a load balancer distributes concurrent HTTP requests across multiple backend servers, handles failures, and maintains availability — using real network hops and concurrency primitives in Go.
        </p>
        <Button class="px-8 py-3 text-base md:text-lg">
          Generate Load
        </Button>
      </div>

      <!-- Content Sections -->
      <div class="space-y-12">
        <!-- What You're Looking At -->
        <section>
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            What You're Looking At
          </h2>
          <p class="mb-4 text-base leading-relaxed text-gray-700">
            This interface visualizes real routing decisions made by the load balancer in real time.
          </p>
          <ul class="ml-6 list-disc space-y-2 text-base leading-relaxed text-gray-700">
            <li>Each request is routed to exactly one backend</li>
            <li>Backend selection is automatic (round-robin)</li>
            <li>Traffic distribution emerges under concurrency</li>
            <li>Failed backends are automatically skipped</li>
            <li>No routing decisions are controlled by the UI.</li>
          </ul>
        </section>

        <!-- How the Demo Works -->
        <section>
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            How the Demo Works
          </h2>
          <ol class="ml-6 list-decimal space-y-2 text-base leading-relaxed text-gray-700">
            <li>The browser sends multiple concurrent requests to the load balancer.</li>
            <li>The load balancer selects a healthy backend for each request.</li>
            <li>Requests are forwarded over HTTP to independent backend servers.</li>
            <li>Routing events are streamed back and visualized here.</li>
          </ol>
          <p class="mt-4 text-base leading-relaxed text-gray-700">
            This mirrors how real-world load balancers behave under traffic.
          </p>
        </section>

        <!-- What This Demonstrates -->
        <section>
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            What This Demonstrates
          </h2>
          <ul class="ml-6 list-disc space-y-2 text-base leading-relaxed text-gray-700">
            <li>Concurrency handling in Go</li>
            <li>Request distribution (round robin)</li>
            <li>Fault tolerance via health checks</li>
            <li>Separation of concerns between client, balancer, and backends</li>
            <li>Observability without influencing routing logic</li>
          </ul>
        </section>

        <!-- What This Is Not -->
        <section>
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            What This Is Not
          </h2>
          <ul class="ml-6 list-disc space-y-2 text-base leading-relaxed text-gray-700">
            <li>This is not a performance benchmark</li>
            <li>This is not a production-grade replacement for Nginx/Envoy</li>
            <li>This UI does not influence routing decisions</li>
            <li>The goal is correctness, clarity, and systems understanding.</li>
          </ul>
        </section>

        <!-- Try It -->
        <section class="rounded-lg border border-gray-200 bg-gray-50 p-6 md:p-8">
          <h2 class="mb-4 text-2xl font-semibold text-black md:text-3xl">
            Try It
          </h2>
          <p class="text-base leading-relaxed text-gray-700">
            Click "Generate Load" to send concurrent requests and observe how traffic is distributed across backends in real time.
          </p>
          <p class="mt-4 text-base leading-relaxed text-gray-700">
            You can also simulate failure by stopping a backend and watching traffic reroute automatically.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
