export async function Fetch(params: {
  endpoint: string;
  method: string;
  data?: Record<string, any> | FormData; // eslint-disable-line @typescript-eslint/no-explicit-any
  isBlob?: boolean;
}): Promise<unknown> {
  const headers = params.isBlob ? {} : { 'Content-Type': 'application/json' };
  const response = await fetch(`${import.meta.env.VITE_STRAPI_API_URL}${params.endpoint}`, {
    method: params.method,
    headers: {
      ...headers,
      Authorization: `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`,
    },
    body: params.data instanceof FormData ? params.data : JSON.stringify(params.data),
  });

  const res = await response.json();
  if (response.ok) {
    return res;
  }
  throw res;
}
