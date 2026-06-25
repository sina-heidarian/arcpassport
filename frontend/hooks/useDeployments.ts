"use client";

import { useCallback, useState } from "react";
import { apiGet } from "@/lib/api";
import type { Deployment } from "@/lib/types";

type DeploymentsResponse = {
  deployments: Deployment[];
};

export function useDeployments() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  const loadDeployments = useCallback(async (walletAddress: string) => {
    try {
      const data = await apiGet<DeploymentsResponse>(
        `/deployments/${walletAddress}`
      );
      setDeployments(data.deployments || []);
    } catch (error) {
      console.error("Failed to load deployments:", error);
    }
  }, []);

  return { deployments, loadDeployments };
}
