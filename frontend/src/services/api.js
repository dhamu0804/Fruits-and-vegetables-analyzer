import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const analyzeImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    if (file) {
      formData.append("images", file);
    }
  });

  const response = await api.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
