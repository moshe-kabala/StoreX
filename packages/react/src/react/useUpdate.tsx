import { useState } from "react";

export const useUpdate = () => {
  const [, setState] = useState(0);
  return () => setState(cnt => cnt + 1);
};
