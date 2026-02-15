// HOOKS
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { ref, computed } from "vue";
// SERVICES
import { eventService } from "@/services/event.service";
// TYPES
import type { ListEventsParams } from "@/types/schema";

const POLLING_INTERVAL = 2000; // Poll every 2 seconds for real-time feel

export const useEvents = (params?: ListEventsParams, autoRefresh = true) => {
  const queryClient = useQueryClient();
  const isPollingEnabled = ref(autoRefresh);

  const query = useQuery({
    queryKey: ['events', params],
    queryFn: () => eventService.listEvents(params),
    refetchInterval: (query) => {
      // Only poll if enabled and query is not in error state
      return isPollingEnabled.value && !query.state.error ? POLLING_INTERVAL : false;
    },
  });

  const startPolling = () => {
    isPollingEnabled.value = true;
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const stopPolling = () => {
    isPollingEnabled.value = false;
  };

  return {
    ...query,
    isPolling: computed(() => isPollingEnabled.value),
    startPolling,
    stopPolling,
  };
};
