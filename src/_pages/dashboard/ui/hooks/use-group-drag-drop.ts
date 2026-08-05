import { useState } from "react";
import {
  updateBrotherClient,
  updateGroupClient,
  deleteGroupClient,
  type Group,
  type Brother,
} from "@/shared/api";

interface UseGroupDragDropOptions {
  congregationId: string;
  groups: Group[];
  brothers: Brother[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  setBrothers: React.Dispatch<React.SetStateAction<Brother[]>>;
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  onError: (message: string) => void;
  reload: () => Promise<void>;
}

export interface GroupDragDropState {
  draggedBrotherId: string | null;
  draggedOverGroupId: string | null;
  draggedGroupId: string | null;
  groupDragOverId: string | null;
  isGroupDragOverTrash: boolean;
  handleBrotherDragStart: (e: React.DragEvent, brotherId: string) => void;
  handleBrotherDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, targetGroupId: string | null) => void;
  setDraggedOverGroupId: (id: string | null) => void;
  handleDrop: (e: React.DragEvent, targetGroupId: string | null) => Promise<void>;
  handleGroupDragStart: (e: React.DragEvent, groupId: string) => void;
  handleGroupDragEnd: () => void;
  handleGroupDragOver: (e: React.DragEvent, targetGroupId: string) => void;
  setGroupDragOverId: (id: string | null) => void;
  handleGroupDrop: (e: React.DragEvent, targetGroupId: string) => Promise<void>;
  handleTrashDragOver: (e: React.DragEvent) => void;
  handleTrashDragLeave: () => void;
  handleTrashDrop: (e: React.DragEvent) => Promise<void>;
  handleGeneralDrop: (e: React.DragEvent, targetGroupId: string) => void;
  handleGeneralDragOver: (e: React.DragEvent, targetGroupId: string) => void;
}

export function useGroupDragDrop({
  congregationId,
  groups,
  brothers,
  setGroups,
  setBrothers,
  selectedGroupId,
  setSelectedGroupId,
  onError,
  reload,
}: UseGroupDragDropOptions): GroupDragDropState {
  const [draggedBrotherId, setDraggedBrotherId] = useState<string | null>(null);
  const [draggedOverGroupId, setDraggedOverGroupId] = useState<string | null>(null);
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);
  const [groupDragOverId, setGroupDragOverId] = useState<string | null>(null);
  const [isGroupDragOverTrash, setIsGroupDragOverTrash] = useState(false);

  // --- Brother drag handlers ---

  const handleBrotherDragStart = (e: React.DragEvent, brotherId: string) => {
    setDraggedBrotherId(brotherId);
    e.dataTransfer.setData("text/plain", brotherId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleBrotherDragEnd = () => {
    setDraggedBrotherId(null);
    setDraggedOverGroupId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetGroupId: string | null) => {
    e.preventDefault();
    if (draggedOverGroupId !== targetGroupId) {
      setDraggedOverGroupId(targetGroupId);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetGroupId: string | null) => {
    e.preventDefault();
    const brotherId = e.dataTransfer.getData("text/plain") || draggedBrotherId;
    setDraggedOverGroupId(null);
    setDraggedBrotherId(null);

    if (!brotherId) return;

    const brother = brothers.find((b) => b.id === brotherId);
    if (!brother) return;

    const isSameGroup =
      brother.groupId === targetGroupId ||
      (!brother.groupId && targetGroupId === null);
    if (isSameGroup) return;

    const originalBrothers = [...brothers];
    setBrothers((prev) =>
      prev.map((b) => (b.id === brotherId ? { ...b, groupId: targetGroupId } : b)),
    );

    try {
      await updateBrotherClient(brotherId, { ...brother, groupId: targetGroupId });
    } catch (err: any) {
      setBrothers(originalBrothers);
      alert(err.message || "Error al actualizar el grupo del hermano");
    }
  };

  // --- Group reorder drag handlers ---

  const handleGroupDragStart = (e: React.DragEvent, groupId: string) => {
    setDraggedGroupId(groupId);
    e.dataTransfer.setData("text/group-id", groupId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleGroupDragEnd = () => {
    setDraggedGroupId(null);
    setGroupDragOverId(null);
    setIsGroupDragOverTrash(false);
  };

  const handleGroupDragOver = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    if (draggedGroupId && draggedGroupId !== targetGroupId) {
      if (groupDragOverId !== targetGroupId) {
        setGroupDragOverId(targetGroupId);
      }
    }
  };

  const handleGroupDrop = async (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    const sourceGroupId = e.dataTransfer.getData("text/group-id") || draggedGroupId;
    setDraggedGroupId(null);
    setGroupDragOverId(null);

    if (!sourceGroupId || sourceGroupId === targetGroupId) return;

    const sourceIndex = groups.findIndex((g) => g.id === sourceGroupId);
    const targetIndex = groups.findIndex((g) => g.id === targetGroupId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...groups];
    const [draggedGroup] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, draggedGroup);

    const withUpdatedOrder = reordered.map((g, idx) => ({ ...g, sortOrder: idx }));
    setGroups(withUpdatedOrder);

    try {
      await Promise.all(
        withUpdatedOrder.map((g) =>
          updateGroupClient(g.id, {
            name: g.name,
            congregationId,
            sortOrder: g.sortOrder,
          }),
        ),
      );
    } catch (err: any) {
      console.error("Error al guardar el orden de los grupos:", err);
      reload();
    }
  };

  // --- Trash drop zone handlers ---

  const handleTrashDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isGroupDragOverTrash) setIsGroupDragOverTrash(true);
  };

  const handleTrashDragLeave = () => {
    setIsGroupDragOverTrash(false);
  };

  const handleTrashDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const groupId = e.dataTransfer.getData("text/group-id") || draggedGroupId;
    setIsGroupDragOverTrash(false);
    setDraggedGroupId(null);

    if (!groupId) return;

    const groupToDelete = groups.find((g) => g.id === groupId);
    if (!groupToDelete) return;

    const members = brothers.filter((b) => b.groupId === groupId);
    const confirmMessage =
      members.length > 0
        ? `El grupo "${groupToDelete.name}" tiene ${members.length} hermano(s) asignado(s). Si lo eliminas, estos hermanos quedarán sin grupo asignado. ¿Estás seguro?`
        : `¿Estás seguro de que deseas eliminar el grupo "${groupToDelete.name}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      onError("");
      await deleteGroupClient(groupToDelete.id);
      setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
      setBrothers((prev) =>
        prev.map((b) => (b.groupId === groupToDelete.id ? { ...b, groupId: null } : b)),
      );
      if (selectedGroupId === groupToDelete.id) setSelectedGroupId(null);
    } catch (err: any) {
      onError(err.message || "Error al eliminar el grupo");
    }
  };

  // --- Unified drag routing (differentiates group vs brother drag) ---

  const handleGeneralDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("text/group-id") || draggedGroupId) {
      handleGroupDrop(e, targetGroupId);
    } else {
      handleDrop(e, targetGroupId);
    }
  };

  const handleGeneralDragOver = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("text/group-id") || draggedGroupId) {
      handleGroupDragOver(e, targetGroupId);
    } else {
      handleDragOver(e, targetGroupId);
    }
  };

  return {
    draggedBrotherId,
    draggedOverGroupId,
    draggedGroupId,
    groupDragOverId,
    isGroupDragOverTrash,
    handleBrotherDragStart,
    handleBrotherDragEnd,
    handleDragOver,
    setDraggedOverGroupId,
    handleDrop,
    handleGroupDragStart,
    handleGroupDragEnd,
    handleGroupDragOver,
    setGroupDragOverId,
    handleGroupDrop,
    handleTrashDragOver,
    handleTrashDragLeave,
    handleTrashDrop,
    handleGeneralDrop,
    handleGeneralDragOver,
  };
}
