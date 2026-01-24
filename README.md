# CQRS OMS Web Frontend

A Vue 3 frontend application for the **CQRS Order Management System (OMS)** demo. This frontend demonstrates how to interact with a CQRS + Event Sourcing backend architecture.

## Overview

This is the frontend companion to the CQRS OMS backend demo. It provides a user interface to:

- Create orders (dispatches CreateOrderCommand)
- View orders (executes GetOrderQuery)
- Update order status (dispatches UpdateOrderStatusCommand)
- List orders with filtering (executes ListOrdersQuery)
- Visualize CQRS patterns in action

## Architecture

The frontend communicates with the CQRS OMS backend which implements:

- **Write Side (PostgreSQL)**: Event store - append-only log of all domain events
- **Read Side (Redis)**: Optimized read models - fast, in-memory queries
- **Event Bus**: Publishes events to projections that update read models
- **Domain Layer**: Order aggregate with business logic and event generation

### Frontend Structure

```
src/
├── components/          # Vue UI components
│   └── ui/             # Reusable UI components (buttons, inputs, etc.)
├── composables/        # Vue composition functions
│   └── use-order.ts    # Order-related composables (queries & mutations)
├── services/           # API service layer
│   ├── fetch.ts        # Generic API service
│   └── order.service.ts # Order API operations
├── types/              # TypeScript definitions
│   ├── index.ts        # General types
│   └── schema.ts       # Zod schemas and order types
├── utils/              # Helper functions
│   ├── constants.ts    # Configuration constants
│   └── logger.ts       # Logging utility
├── views/              # Page components
│   └── landing.vue     # Main demo page
└── routes/             # Vue Router configuration
```

## Tech Stack

- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Vue Router**: Client-side routing
- **Zod**: Schema validation
- **@tanstack/vue-query**: Data fetching and caching

## Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm
- CQRS OMS backend running (default: `http://localhost:3000`)

## Installation

```bash
# Install dependencies
pnpm install

# Or with npm
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
# CQRS OMS Backend API URL
VITE_API_BASE_URL=http://localhost:3000
```

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The dev server will start on `http://localhost:5173` (or the next available port).

## API Integration

The frontend communicates with the CQRS OMS backend using the following endpoints:

### Orders

- `POST /orders` - Create a new order
- `GET /orders/:id` - Get order by ID
- `PATCH /orders/:id` - Update order status
- `GET /orders` - List orders with pagination

### Example Usage

```typescript
import { useCreateOrder, useListOrders } from '@/composables/use-order'

// Create order
const createOrder = useCreateOrder()
createOrder.mutate({
  customerId: 'customer-123',
  items: [{ productId: 'product-1', quantity: 2, price: 29.99 }],
  totalAmount: 59.98
})

// List orders
const { data: orders } = useListOrders({ page: 1, limit: 10, status: 'pending' })
```

## Features

- **Order Management**: Create, view, update, and list orders
- **Real-time Updates**: Uses Vue Query for efficient data fetching and caching
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS
- **CQRS Patterns**: Demonstrates command/query separation in UI layer

## Project Structure

### Services Layer

- `services/fetch.ts`: Generic API service with error handling
- `services/order.service.ts`: Order-specific API operations

### Composables Layer

- `composables/use-order.ts`: Vue Query hooks for order operations
  - `useCreateOrder()`: Mutation for creating orders
  - `useUpdateOrderStatus()`: Mutation for updating order status
  - `useGetOrder()`: Query for fetching a single order
  - `useListOrders()`: Query for listing orders with filters

### Types & Schemas

- `types/schema.ts`: Zod schemas for validation and TypeScript types
  - `createOrderSchema`: Validates order creation input
  - `updateOrderStatusSchema`: Validates status updates
  - `OrderReadModel`: Type for order read models from Redis

## CQRS Concepts Demonstrated

1. **Commands (Write)**: Creating and updating orders dispatch commands
2. **Queries (Read)**: Fetching orders executes queries against read models
3. **Event Sourcing**: Backend stores all changes as events
4. **Read Models**: Frontend queries optimized Redis read models
5. **Eventual Consistency**: Read models updated asynchronously from events

## Development Notes

- All API calls go through the `ApiService` class for consistent error handling
- Vue Query provides automatic caching, refetching, and loading states
- Zod schemas ensure type safety and runtime validation
- Components use Composition API with `<script setup>` syntax

## License

MIT
