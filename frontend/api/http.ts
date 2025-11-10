const API_KEY = process.env.EXPO_PUBLIC_API_KEY || "";

export const get = async <T>(
  url: string,
  p?: Record<string, any>
): Promise<T> => {
  const params = new URLSearchParams();
  for (const key in p) {
    params.append(key, p[key]);
  }

  const result = await fetch([url, params ? "?" : "", params].join(""), {
    method: "GET",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (result.ok) {
    return await result.json();
  } else {
    throw new Error(`${result.status} error`);
  }
};

export const post = async <T>(
  url: string,
  body?: Record<string, any>
): Promise<T> => {
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (result.ok) {
    return await result.json();
  } else {
    throw new Error(`${result.status} error`);
  }
};

export const del = async <T>(
  url: string,
  body?: Record<string, any>
): Promise<T> => {
  const result = await fetch(url, {
    method: "DELETE",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (result.ok) {
    return await result.json();
  } else {
    throw new Error(`${result.status} error`);
  }
};
