import React, { useState, useEffect } from "react";
import { useGroupData } from "./hooks/use-group-data";
import { useGroupModal } from "./hooks/use-group-modal";
import { useGroupDragDrop } from "./hooks/use-group-drag-drop";
import { GroupSidebar } from "./GroupSidebar";
import { GroupMembersPanel } from "./GroupMembersPanel";
import { GroupFormModal } from "./GroupFormModal";

interface GroupsTabProps {
  congregationId: string;
}

export function GroupsTab({ congregationId }: GroupsTabProps) {
  const {
    groups,
    brothers,
    isLoading,
    generalError,
    setGroups,
    setBrothers,
    setGeneralError,
    reload,
  } = useGroupData({ congregationId });

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Auto-select first group on initial load
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups]);

  const modal = useGroupModal({
    congregationId,
    groups,
    onGroupCreated: (newGroup) => {
      setGroups((prev) => [...prev, newGroup]);
      setSelectedGroupId(newGroup.id);
    },
    onGroupUpdated: (updated) => {
      setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    },
    onError: setGeneralError,
  });

  const dragDrop = useGroupDragDrop({
    congregationId,
    groups,
    brothers,
    setGroups,
    setBrothers,
    selectedGroupId,
    setSelectedGroupId,
    onError: setGeneralError,
    reload,
  });

  const activeGroup = groups.find((g) => g.id === selectedGroupId);
  const activeGroupMembers = selectedGroupId
    ? brothers.filter((b) => b.groupId === selectedGroupId)
    : [];
  const unassignedBrothers = brothers.filter((b) => !b.groupId);

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#4a6da7]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-medium text-sm">Cargando grupos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Grupos de la Congregación</h3>
          <p className="text-slate-500 text-xs mt-1 font-semibold">
            Gestiona los grupos. Arrastra los grupos para reordenarlos, arrastra a la papelera para eliminarlos y arrastra hermanos para asignarlos.
          </p>
        </div>
        <button
          onClick={modal.openCreateModal}
          className="py-2.5 px-4 bg-gradient-to-r from-[#4a6da7] to-[#3a588b] hover:from-[#354f7a] hover:to-[#2b4164] active:scale-[0.97] text-white font-bold rounded-xl text-xs transition-all duration-300 shadow-lg shadow-[#4a6da7]/20 hover:shadow-xl hover:shadow-[#4a6da7]/30 flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer border border-[#4a6da7]/30 hover:border-[#354f7a]/40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Crear Grupo</span>
        </button>
      </div>

      {generalError && !modal.isModalOpen && (
        <div className="p-4 rounded-xl text-sm border bg-red-50 border-red-200/60 text-red-600">
          <span>{generalError}</span>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mx-auto text-slate-300 mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <p className="font-semibold text-base text-slate-700">No hay grupos registrados</p>
          <p className="text-xs text-slate-400 mt-1">Comienza agregando el primer grupo de la congregación.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GroupSidebar
            groups={groups}
            brothers={brothers}
            unassignedBrothers={unassignedBrothers}
            selectedGroupId={selectedGroupId}
            dragState={dragDrop}
            setGroups={setGroups}
            setBrothers={setBrothers}
            setSelectedGroupId={setSelectedGroupId}
            onError={setGeneralError}
            onEditGroup={modal.openEditModal}
          />

          <GroupMembersPanel
            activeGroupName={activeGroup?.name}
            members={activeGroupMembers}
            isDragTarget={!!selectedGroupId && dragDrop.draggedOverGroupId === selectedGroupId}
            onDragOver={(e) => selectedGroupId && dragDrop.handleDragOver(e, selectedGroupId)}
            onDragLeave={() => dragDrop.setDraggedOverGroupId(null)}
            onDrop={(e) => selectedGroupId && dragDrop.handleDrop(e, selectedGroupId)}
            onMemberDragStart={dragDrop.handleBrotherDragStart}
            onMemberDragEnd={dragDrop.handleBrotherDragEnd}
          />
        </div>
      )}

      <GroupFormModal
        isOpen={modal.isModalOpen}
        mode={modal.modalMode}
        groupName={modal.groupNameInput}
        error={modal.modalError}
        isSubmitting={modal.isSubmitting}
        onGroupNameChange={modal.setGroupNameInput}
        onSubmit={modal.handleSubmit}
        onClose={modal.closeModal}
      />
    </div>
  );
}
