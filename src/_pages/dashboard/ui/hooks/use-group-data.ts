import { useState, useEffect } from "react";
import {
  fetchGroupsClient,
  fetchBrothersClient,
  type Group,
  type Brother,
} from "@/shared/api";

interface UseGroupDataOptions {
  congregationId: string;
}

export interface GroupDataState {
  groups: Group[];
  brothers: Brother[];
  isLoading: boolean;
  generalError: string;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  setBrothers: React.Dispatch<React.SetStateAction<Brother[]>>;
  setGeneralError: React.Dispatch<React.SetStateAction<string>>;
  reload: () => Promise<void>;
}

export function useGroupData({ congregationId }: UseGroupDataOptions): GroupDataState {
  const [groups, setGroups] = useState<Group[]>([]);
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setGeneralError("");
      const [groupsData, brothersData] = await Promise.all([
        fetchGroupsClient(congregationId),
        fetchBrothersClient(congregationId),
      ]);

      const sortedGroups = [...groupsData].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
      );
      setGroups(sortedGroups);
      setBrothers(brothersData);
    } catch (err: any) {
      setGeneralError(err.message || "Error al cargar los datos de los grupos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (congregationId) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [congregationId]);

  return {
    groups,
    brothers,
    isLoading,
    generalError,
    setGroups,
    setBrothers,
    setGeneralError,
    reload: loadData,
  };
}
