export async function Fetch(params: {
  endpoint: string;
  method: string;
  data?: Record<string, any> | FormData;
  isBlob?: boolean;
}): Promise<unknown> {
  return new Promise(async (resolve, reject) => {
    const headers = params.isBlob ? {} : { 'Content-Type': 'application/json' };
    const response = await fetch(`${import.meta.env.VITE_STRAPI_API_URL}${params.endpoint}`, {
      method: params.method,
      headers: {
        ...headers,
        Authorization: `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
      },
      body: params.data instanceof FormData ? params.data : JSON.stringify(params.data)
    });
    if (response.ok) {
      const res = await response.json();
      resolve(res);
    } else {
      const res = await response.json();
      reject(res);
    }
  });
}
