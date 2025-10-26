import { fetchWithTimeout } from "@/service/serviceUtils";

export const healthCheck = async (server: any) => {
  return await fetchWithTimeout(`http://${server}:8080/api/v1/health`);
};
