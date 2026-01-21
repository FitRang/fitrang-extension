import axiosInstance from "./axios.js";

export async function sendData({ product, profile }) {
  const payload = { product };

  if (profile !== null) {
    payload.profile = profile;
  }

  try {
    const response = await axiosInstance.post("analysis/query/verdict/", payload);
    return response.data;
  } catch (error) {
    console.error("Error sending data:", error);
    throw error;
  }
}
