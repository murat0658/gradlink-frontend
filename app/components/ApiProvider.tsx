import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "../store";
import { apiService } from "../services/ApiService";

interface ApiProviderProps {
  children: React.ReactNode;
}

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const token = useSelector(selectToken);

  useEffect(() => {
    if (token) {
      apiService.setToken(token);
    } else {
      apiService.setToken(null);
    }
  }, [token]);

  return <>{children}</>;
};
