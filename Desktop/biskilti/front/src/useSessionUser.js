import { useEffect, useState } from "react";
import {
  apiRequest,
  getStoredToken,
  getStoredUser,
  storeAuthSession,
} from "./authClient.js";

export function useSessionUser() {
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    let isActive = true;
    const token = getStoredToken();

    if (!token) {
      return () => {
        isActive = false;
      };
    }

    apiRequest("/api/me")
      .then((data) => {
        if (isActive && data.user) {
          storeAuthSession({ token, user: data.user });
          setUser(data.user);
        }
      })
      .catch(() => {
        // Keep the locally stored user if the API is temporarily unavailable.
      });

    return () => {
      isActive = false;
    };
  }, []);

  return user;
}
