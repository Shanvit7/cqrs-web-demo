<template>
    <div>
      <main>
        <router-view></router-view>
      </main>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'DefaultLayout'
  });
  </script>
  
<style scoped>

</style>
  