export const get = async <T>(
  url: string,
  p?: Record<string, any>
): Promise<T> => {
  const params = new URLSearchParams();
  for (const key in p) {
    params.append(key, p[key]);
  }

  try {
    const result = await fetch([url, params ? "?" : "", params].join(""));
    if (result.ok) {
      return await result.json();
    } else {
      throw new Error(`${result.status} error`);
    }
  } catch (error) {
    console.error(error);
    return {} as T;
  }
};

export const post = async <T>(
  url: string,
  body?: Record<string, any>
): Promise<T> => {
  try {
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (result.ok) {
      return await result.json();
    } else {
      throw new Error(`${result.status} error`);
    }
  } catch (error) {
    console.error(error);
    return {} as T;
  }
};

export const del = async <T>(
  url: string,
  body?: Record<string, any>
): Promise<T> => {
  try {
    const result = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (result.ok) {
      return await result.json();
    } else {
      throw new Error(`${result.status} error`);
    }
  } catch (error) {
    console.error(error);
    return {} as T;
  }
};
