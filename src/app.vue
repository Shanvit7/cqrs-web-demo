<script lang="ts">
import { defineComponent } from 'vue';
import { Toaster } from '@/components/ui/sonner';

export default defineComponent({
  name: 'App',
  components: {
    Toaster,
  },
});
</script>

<template>
  <router-view></router-view>
  <Toaster />
</template>
