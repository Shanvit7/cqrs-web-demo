// HOOKS
import { useMutation } from "@tanstack/vue-query";
// SERVICES
import { analyzeService } from "@/services/load.service";

const useAnalyze = () => {
  return useMutation({
    mutationFn: analyzeService.start,
  });
};

export default useAnalyze;