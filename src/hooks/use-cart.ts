"use client";

import { useEffect, useState, useCallback } from "react";
import { getCartCount } from "@/actions/cart";

export function useCartCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const newCount = await getCartCount();
    setCount(newCount);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { count, refresh };
}
