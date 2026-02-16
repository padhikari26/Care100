// Base API client for making requests to the backend

type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
};

// export const API_BASE_URL = "https://thecaresnow.com/api";
export const API_BASE_URL = "http://localhost:3000/api";

// get token and include it in the headers

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = localStorage.getItem("authToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
    console.log(fetchOptions.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    // Try to parse error message from response

    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();

      errorMessage = errorData.message || errorMessage;
      if (response.status === 401 && errorMessage === "Unauthorized") {
        // Clear localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } catch (e) {
      // If parsing fails, use status text
      errorMessage = response.statusText;
    }

    throw new Error(`API Error (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

/// Helper methods for common HTTP methods
export const apiClient = {
  get: <T>(
    endpoint: string,
    options: Omit<FetchOptions, "method" | "body"> = {}
  ) => fetchApi<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(
    endpoint: string,
    data: any,
    options: Omit<FetchOptions, "method" | "body"> = {}
  ) => fetchApi<T>(endpoint, { ...options, method: "POST", body: data }),

  put: <T>(
    endpoint: string,
    data: any,
    options: Omit<FetchOptions, "method" | "body"> = {}
  ) => fetchApi<T>(endpoint, { ...options, method: "PUT", body: data }),

  delete: <T>(
    endpoint: string,
    options: Omit<FetchOptions, "method" | "body"> = {}
  ) => fetchApi<T>(endpoint, { ...options, method: "DELETE" }),
};
