"use client";

import { useCallback, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { Deployment } from "@/lib/types";

type DeploymentsResponse = {
  deployments: Deployment[];
};

type SaveDeploymentPayload = {
  wallet: string;
  contract_address: string;
  tx_hash: string;
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

  const saveDeployment = useCallback(async (payload: SaveDeploymentPayload) => {
    return apiPost("/deployment", payload);
  }, []);

  return { deployments, loadDeployments, saveDeployment };
}
