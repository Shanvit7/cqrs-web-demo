// CORE
import { ApiService } from '@/services/fetch';
// CONSTANTS
import { BASE_SERVICE_URL } from '@/utils/constants';
// TYPES
import type { EventsResponse, ListEventsParams } from '@/types/schema';

const apiService = new ApiService(`${BASE_SERVICE_URL}/events`)

export const eventService = {
  async listEvents(params?: ListEventsParams): Promise<EventsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.eventType) queryParams.append('eventType', params.eventType)
    if (params?.aggregateId) queryParams.append('aggregateId', params.aggregateId)
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate)
    if (params?.toDate) queryParams.append('toDate', params.toDate)
    
    const queryString = queryParams.toString()
    const endpoint = queryString ? `?${queryString}` : ''
    
    const { data, isError = false, error } = await apiService.get<EventsResponse>(endpoint)
    if (isError) {
      throw new Error(error?.message || 'Failed to list events')
    }
    return data || { message: 'Events retrieved', events: [] }
  },
}
