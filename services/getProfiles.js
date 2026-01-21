import axiosInstance from "./axios.js";

export async function getProfiles() {
  try {
    const response = await axiosInstance.get('/analysis/user/profiles/');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profiles:", error);
    throw error;
  }
}
