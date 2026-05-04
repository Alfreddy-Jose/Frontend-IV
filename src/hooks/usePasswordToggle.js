import { useState } from "react";

export const usePasswordToggle = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible(!visible);

  // 'type' será 'password' o 'text' según el estado
  const type = visible ? "text" : "password";

  return [type, toggleVisibility, visible];
};