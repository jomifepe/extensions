import { useEffect, DependencyList } from "react";

function useOnUnmount(callback: () => void, deps?: DependencyList) {
  useEffect(() => callback, deps);
}

export default useOnUnmount;
