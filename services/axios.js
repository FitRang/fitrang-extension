const FIREBASE_API_KEY = "AIzaSyCF330pJcqJAQgBR20dk-Gf21C8ORsyeV8";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  timeout: 15000,
});

const publicRoutes = ["/login"];

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const isPublic = publicRoutes.some((route) =>
      config.url?.startsWith(route)
    );

    if (!isPublic) {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response?.status === 401;

    if (isUnauthorized && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = "Bearer " + token;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const refreshResponse = await axios.post(
          `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
          new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const {
          access_token,
          refresh_token,
          expires_in,
          token_type,
        } = refreshResponse.data;

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem(
          "access_token_expiry",
          (Date.now() + Number(expires_in) * 1000).toString()
        );
        localStorage.setItem("token_type", token_type || "Bearer");

        axiosInstance.defaults.headers.common.Authorization =
          "Bearer " + access_token;

        processQueue(null, access_token);

        originalRequest.headers.Authorization = "Bearer " + access_token;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);

        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
