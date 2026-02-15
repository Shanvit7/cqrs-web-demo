# CQRS OMS Web Frontend

A Vue 3 frontend application for the **CQRS Order Management System (OMS)** demo. This frontend demonstrates how to interact with a CQRS + Event Sourcing backend architecture.

## Overview

This is the frontend companion to the CQRS OMS backend demo. It provides a user interface to:

- **Browse Products**: View available products and add them to cart
- **Create Orders**: Place orders from the shopping cart (dispatches CreateOrderCommand)
- **View Orders**: See your order history with status tracking
- **Cancel Orders**: Cancel your own orders (when in active states)
- **Admin Dashboard**: Real-time CQRS event stream visualization
- **Update Order Status**: Admin can update order statuses following proper progression rules
- **Event Monitoring**: Live event stream with filtering and statistics

## Architecture

The frontend communicates with the CQRS OMS backend which implements:

- **Write Side (PostgreSQL)**: Event store - append-only log of all domain events
- **Read Side (Redis)**: Optimized read models - fast, in-memory queries
- **Event Bus**: Publishes events to projections that update read models
- **Domain Layer**: Order aggregate with business logic and event generation

### Frontend Structure

```
src/
├── assets/             # Static assets (images, icons)
├── components/         # Vue UI components
│   ├── ui/             # Reusable UI components (shadcn-style)
│   │   ├── button.vue
│   │   ├── dialog.vue
│   │   ├── alert-dialog.vue
│   │   ├── input.vue
│   │   ├── sheet.vue
│   │   ├── sonner/     # Toast notifications
│   │   └── ...
│   ├── cart-drawer.vue # Shopping cart side drawer
│   └── product-card-skeleton.vue
├── composables/        # Vue composition functions
│   ├── use-order.ts    # Order-related composables (queries & mutations)
│   ├── use-product.ts  # Product-related composables
│   └── use-event.ts    # Event stream composable with polling
├── layouts/            # Layout components
│   └── default.vue     # Default layout wrapper
├── routes/             # Vue Router configuration
│   └── index.ts        # Route definitions
├── services/           # API service layer
│   ├── fetch.ts        # Generic API service with error handling
│   ├── order.service.ts # Order API operations
│   ├── product.service.ts # Product API operations
│   └── event.service.ts  # Event stream API operations
├── stores/             # State management (Pinia)
│   └── cart.store.ts   # Shopping cart state
├── styles/             # Global styles
│   └── tailwind.css    # Tailwind CSS imports
├── types/              # TypeScript definitions
│   ├── index.ts        # General types
│   └── schema.ts       # API response types and schemas
├── utils/              # Helper functions
│   ├── constants.ts    # Configuration constants (API URLs)
│   ├── index.ts        # Utility exports (cn function, etc.)
│   └── logger.ts       # Logging utility
├── views/              # Page components
│   ├── landing.vue     # Landing page
│   ├── products.vue    # Product catalog & order management
│   ├── admin.vue       # CQRS event monitor dashboard
│   └── observe.vue     # (Optional) Observation page
├── app.vue             # Root component
└── main.ts             # Application entry point
```

## Tech Stack

- **Vue 3**: Progressive JavaScript framework (Composition API)
- **TypeScript**: Type safety across the application
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Vue Router**: Client-side routing
- **Pinia**: State management (cart store)
- **@tanstack/vue-query**: Data fetching, caching, and real-time polling
- **Lucide Vue Next**: Icon library
- **vue-sonner**: Toast notifications (optional, mostly replaced by custom dialogs)

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
- `GET /orders` - List orders with pagination and filtering

### Products

- `GET /products` - List all products

### Events (CQRS Event Stream)

- `GET /events` - List events with filtering (eventType, aggregateId, pagination, date range)

### Example Usage

```typescript
import { useCreateOrder, useListOrders, useUpdateOrderStatus } from '@/composables/use-order'
import { useEvents } from '@/composables/use-event'
import { useProducts } from '@/composables/use-product'

// Create order
const createOrder = useCreateOrder()
createOrder.mutate({
  customerId: 'customer-123',
  items: [{ productId: 'product-1', quantity: 2, price: 29.99 }],
  totalAmount: 59.98
})

// List orders
const { data: orders } = useListOrders({ page: 1, limit: 10, status: 'pending' })

// Update order status
const updateStatus = useUpdateOrderStatus()
updateStatus.mutate({ orderId: 'order-123', status: 'processing' })

// Fetch events with real-time polling
const { data: eventsData, isPolling, startPolling, stopPolling } = useEvents(
  { limit: 50, eventType: 'OrderCreated' },
  true // auto-refresh enabled
)

// Fetch products
const { data: products } = useProducts({ page: 1, limit: 30 })
```

## Features

### User Features

- **Product Catalog**: Browse products with pagination
- **Shopping Cart**: Add/remove items with persistent cart state (Pinia)
- **Order Management**: Create orders, view order history, cancel orders
- **Order Status Tracking**: Real-time status updates (pending → processing → shipped → delivered)

### Admin Features

- **Event Stream Dashboard**: Real-time CQRS event visualization with auto-refresh
- **Event Filtering**: Filter by event type (OrderCreated, Processing, Shipped, Delivered, Cancelled)
- **Order Search**: Search by Order ID, Customer ID, or Event ID
- **Status Updates**: Update order statuses following proper progression rules
- **Statistics**: Live stats dashboard (Total Events, Orders Created, Processing, Shipped, Delivered, Cancelled)
- **Status Progression Rules**: 
  - Forward: `pending` → `processing` → `shipped` → `delivered`
  - Backward corrections: `shipped` → `processing`, `processing` → `pending`
  - Cancellation: Can cancel from `pending`, `processing`, `shipped` (NOT `delivered`)
  - Final states: `delivered` and `cancelled` cannot be updated

### Technical Features

- **Real-time Polling**: Event stream auto-refreshes every 2 seconds
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS
- **Custom Dialogs**: Shadcn-style alert dialogs for confirmations and feedback
- **Vue Animations**: Smooth transitions for event cards and UI elements
- **CQRS Patterns**: Demonstrates command/query separation in UI layer

## Project Structure Details

### Services Layer (`src/services/`)

- `fetch.ts`: Generic `ApiService` class with error handling and request/response interceptors
- `order.service.ts`: Order-specific API operations (create, get, list, update status)
- `product.service.ts`: Product API operations (list products)
- `event.service.ts`: Event stream API operations (list events with filtering)

### Composables Layer (`src/composables/`)

- `use-order.ts`: Vue Query hooks for order operations
  - `useCreateOrder()`: Mutation for creating orders
  - `useUpdateOrderStatus()`: Mutation for updating order status
  - `useGetOrder()`: Query for fetching a single order by ID
  - `useListOrders()`: Query for listing orders with filters (status, pagination)
  
- `use-product.ts`: Vue Query hooks for product operations
  - `useProducts()`: Query for listing products with pagination
  
- `use-event.ts`: Vue Query hooks for event stream operations
  - `useEvents()`: Query for listing events with real-time polling (2s interval)
  - `startPolling()` / `stopPolling()`: Control polling state
  - `isPolling`: Computed property for polling status

### State Management (`src/stores/`)

- `cart.store.ts`: Pinia store for shopping cart state
  - Cart items management (add, remove, update quantity)
  - Cart persistence
  - Total calculation

### Types & Schemas (`src/types/`)

- `schema.ts`: TypeScript types and interfaces
  - `Order`, `OrderStatus`, `OrderReadModel`: Order-related types
  - `Product`: Product type
  - `CQRSEvent`, `EventType`, `EventsResponse`: Event stream types
  - `ListOrdersParams`, `ListEventsParams`: Query parameter types
  
- `index.ts`: General shared types

### UI Components (`src/components/`)

- `ui/`: Reusable shadcn-style components
  - `button.vue`: Button component with variants
  - `dialog.vue`: Base dialog component with transitions
  - `alert-dialog.vue`: Alert dialog with types (success, error, warning, info, loading)
  - `input.vue`, `textarea.vue`: Form input components
  - `sheet.vue`: Side sheet component
  - `sonner/`: Toast notification components
  
- `cart-drawer.vue`: Shopping cart side drawer component
- `product-card-skeleton.vue`: Loading skeleton for product cards

### Views (`src/views/`)

- `landing.vue`: Landing page with hero section and navigation
- `products.vue`: Product catalog page with:
  - Product listing with pagination
  - Shopping cart integration
  - Order creation flow
  - "My Orders" section with order history
  - Order cancellation functionality
  
- `admin.vue`: CQRS Event Monitor dashboard with:
  - Real-time event stream visualization
  - Event filtering (by type, status, search)
  - Statistics dashboard
  - Order status update functionality
  - Event timeline with animations

### Utils (`src/utils/`)

- `constants.ts`: Configuration constants (API base URLs)
- `index.ts`: Utility functions (e.g., `cn` for conditional class names)
- `logger.ts`: Logging utility

### Routes (`src/routes/`)

- `index.ts`: Vue Router configuration
  - `/` - Landing page
  - `/products` - Product catalog
  - `/admin` - Event monitor dashboard

## CQRS Concepts Demonstrated

1. **Commands (Write)**: Creating and updating orders dispatch commands to the write side
2. **Queries (Read)**: Fetching orders executes queries against optimized read models
3. **Event Sourcing**: Backend stores all changes as events in an append-only log
4. **Read Models**: Frontend queries optimized Redis read models for fast reads
5. **Event Stream**: Real-time visualization of all domain events as they occur
6. **Eventual Consistency**: Read models updated asynchronously from events
7. **Status Progression**: Demonstrates proper order lifecycle management with business rules

## Order Status Progression Rules

The application enforces proper order status transitions:

### Normal Flow
```
pending → processing → shipped → delivered
```

### Backward Corrections (Allowed)
```
shipped → processing
processing → pending
```

### Cancellation
- Can cancel from: `pending`, `processing`, `shipped`
- Cannot cancel from: `delivered` (final state)

### Final States
- `delivered`: Order completed, cannot be modified
- `cancelled`: Order terminated, cannot be reactivated

## Development Notes

- All API calls go through the `ApiService` class for consistent error handling
- Vue Query provides automatic caching, refetching, and loading states
- Real-time event polling uses `refetchInterval` with manual start/stop controls
- Custom dialog components replace browser alerts/toasts for better UX
- Pinia store manages cart state with persistence
- Components use Composition API with `<script setup>` syntax
- TypeScript types ensure type safety across the application
- Tailwind CSS utility classes for styling
- Lucide icons for consistent iconography

## Key Files Reference

- **Event Stream**: `src/views/admin.vue` - Main admin dashboard
- **Product Catalog**: `src/views/products.vue` - Shopping and order management
- **Cart Store**: `src/stores/cart.store.ts` - Shopping cart state
- **Event Composable**: `src/composables/use-event.ts` - Event polling logic
- **Order Composable**: `src/composables/use-order.ts` - Order CRUD operations
- **API Service**: `src/services/fetch.ts` - Base API client

## License

MIT
