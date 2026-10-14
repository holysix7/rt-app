import { isServer, QueryClient } from "@tanstack/react-query";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let queryClientBrowser: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) return createQueryClient();
  queryClientBrowser ??= createQueryClient();
  return queryClientBrowser;
}
