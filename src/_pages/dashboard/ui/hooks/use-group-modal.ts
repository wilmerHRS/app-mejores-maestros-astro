import { useState } from "react";
import {
  createGroupClient,
  updateGroupClient,
  type Group,
} from "@/shared/api";
import { groupFormSchema } from "../../model/group";


interface UseGroupModalOptions {
  congregationId: string;
  groups: Group[];
  onGroupCreated: (newGroup: Group) => void;
  onGroupUpdated: (updatedGroup: Group) => void;
  onError: (message: string) => void;
}

export interface GroupModalState {
  isModalOpen: boolean;
  modalMode: "create" | "edit";
  editingGroup: Group | null;
  groupNameInput: string;
  isSubmitting: boolean;
  modalError: string;
  setGroupNameInput: (name: string) => void;
  openCreateModal: () => void;
  openEditModal: (group: Group, e: React.MouseEvent) => void;
  closeModal: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useGroupModal({
  congregationId,
  groups,
  onGroupCreated,
  onGroupUpdated,
  onError,
}: UseGroupModalOptions): GroupModalState {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const openCreateModal = () => {
    setModalMode("create");
    setEditingGroup(null);
    setGroupNameInput("");
    setModalError("");
    onError("");
    setIsModalOpen(true);
  };

  const openEditModal = (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode("edit");
    setEditingGroup(group);
    setGroupNameInput(group.name);
    setModalError("");
    onError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = groupFormSchema.safeParse({ name: groupNameInput });
    if (!validation.success) {
      setModalError(validation.error.issues[0].message);
      return;
    }


    setIsSubmitting(true);
    setModalError("");

    try {
      if (modalMode === "create") {
        const newGroup = await createGroupClient({
          name: groupNameInput.trim(),
          congregationId,
          sortOrder: groups.length,
        });
        onGroupCreated(newGroup);
      } else if (modalMode === "edit" && editingGroup) {
        await updateGroupClient(editingGroup.id, {
          name: groupNameInput.trim(),
          congregationId,
          sortOrder: editingGroup.sortOrder,
        });
        onGroupUpdated({ ...editingGroup, name: groupNameInput.trim() });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || "Error al guardar el grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isModalOpen,
    modalMode,
    editingGroup,
    groupNameInput,
    isSubmitting,
    modalError,
    setGroupNameInput,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
  };
}
