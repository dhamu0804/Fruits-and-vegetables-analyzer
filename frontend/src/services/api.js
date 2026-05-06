import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:10000/api",
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
