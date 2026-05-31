const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiErrorBody = {
  detail?: string | { msg?: string }[] | unknown;
  message?: string;
};

function getErrorMessage(status: number, statusText: string, body: ApiErrorBody | null) {
  if (!body) {
    return `API request failed: ${status} ${statusText}`;
  }

  if (typeof body.detail === "string") {
    return body.detail;
  }

  if (Array.isArray(body.detail)) {
    return body.detail
      .map((item) => {
        if (typeof item === "object" && item !== null && "msg" in item) {
          return String(item.msg);
        }

        return JSON.stringify(item);
      })
      .join(", ");
  }

  if (typeof body.message === "string") {
    return body.message;
  }

  return `API request failed: ${status} ${statusText}`;
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let errorBody: ApiErrorBody | null = null;

    try {
      errorBody = await response.json();
    } catch {
      errorBody = null;
    }

    throw new Error(
      getErrorMessage(response.status, response.statusText, errorBody)
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}