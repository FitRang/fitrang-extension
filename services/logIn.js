import axiosInstance from "./axios.js";

export async function logIn(data) {
  const formData = new URLSearchParams();
  formData.append("username", data.email);
  formData.append("password", data.password);

  try {
    const response = await axiosInstance.post("/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const {
      access_token,
      refresh_token,
      expires_in,
      refresh_expires_in,
      token_type,
    } = response.data;

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("access_token_expiry", (Date.now() + expires_in * 1000).toString());
    localStorage.setItem("refresh_token_expiry", (Date.now() + refresh_expires_in * 1000).toString());
    localStorage.setItem("token_type", token_type);

    return;
  } catch (error) {
    const message =
      error?.response?.data?.error_description ||
      error?.response?.data?.message ||
      error?.message ||
      "Login failed. Please try again.";

    throw new Error(message);
  }
}
