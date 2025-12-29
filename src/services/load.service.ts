// CORE
import { ApiService } from '@/services/fetch';
// CONSTANTS
import { BASE_SERVICE_URL } from '@/utils/constants';

const apiService = new ApiService(`${BASE_SERVICE_URL}/load`)

export const laodService = {
  async get() {
    const { data, isError = false, error } = await apiService.get('')
    if (isError) {
      throw new Error(error?.message || 'Failed to load data')
    }
    return data
  },
}