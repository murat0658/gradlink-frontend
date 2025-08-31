import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "../store";
import { apiService } from "../services/ApiService";

export const useApiInit = () => {
  const token = useSelector(selectToken);

  useEffect(() => {
    if (token) {
      apiService.setToken(token);
    } else {
      apiService.setToken(null);
    }
  }, [token]);

  return { isInitialized: !!token };
};

export default useApiInit;
