import React from "react";
import { type Group, type Brother, deleteGroupClient } from "@/shared/api";
import { GroupListItem } from "./GroupListItem";
import { UnassignedBrothersPanel } from "./UnassignedBrothersPanel";
import { type GroupDragDropState } from "./hooks/use-group-drag-drop";

interface GroupSidebarProps {
  groups: Group[];
  brothers: Brother[];
  unassignedBrothers: Brother[];
  selectedGroupId: string | null;
  dragState: GroupDragDropState;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  setBrothers: React.Dispatch<React.SetStateAction<Brother[]>>;
  setSelectedGroupId: (id: string | null) => void;
  onError: (message: string) => void;
  onEditGroup: (group: Group, e: React.MouseEvent) => void;
}

export function GroupSidebar({
  groups,
  brothers,
  unassignedBrothers,
  selectedGroupId,
  dragState,
  setGroups,
  setBrothers,
  setSelectedGroupId,
  onError,
  onEditGroup,
}: GroupSidebarProps) {
  const handleDeleteGroupClick = async (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    const members = brothers.filter((b) => b.groupId === group.id);
    const confirmMessage =
      members.length > 0
        ? `El grupo "${group.name}" tiene ${members.length} hermano(s) asignado(s). Si lo eliminas, quedarán sin grupo. ¿Estás seguro?`
        : `¿Estás seguro de que deseas eliminar el grupo "${group.name}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      onError("");
      await deleteGroupClient(group.id);
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      setBrothers((prev) =>
        prev.map((b) => (b.groupId === group.id ? { ...b, groupId: null } : b)),
      );
      if (selectedGroupId === group.id) setSelectedGroupId(null);
    } catch (err: any) {
      onError(err.message || "Error al eliminar el grupo");
    }
  };

  return (
    <div className="space-y-6 lg:col-span-1 flex flex-col">
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
          Listado de Grupos
        </h4>
        <div className="space-y-2">
          {groups.map((group) => (
            <GroupListItem
              key={group.id}
              group={group}
              membersCount={brothers.filter((b) => b.groupId === group.id).length}
              isSelected={selectedGroupId === group.id}
              isDraggedOver={dragState.draggedOverGroupId === group.id}
              isGroupDragOver={dragState.groupDragOverId === group.id}
              isBeingDragged={dragState.draggedGroupId === group.id}
              onSelect={() => setSelectedGroupId(group.id)}
              onEdit={(e) => onEditGroup(group, e)}
              onDelete={(e) => handleDeleteGroupClick(group, e)}
              onDragStart={(e) => dragState.handleGroupDragStart(e, group.id)}
              onDragEnd={dragState.handleGroupDragEnd}
              onDragOver={(e) => dragState.handleGeneralDragOver(e, group.id)}
              onDragLeave={() => {
                dragState.setDraggedOverGroupId(null);
                dragState.setGroupDragOverId(null);
              }}
              onDrop={(e) => dragState.handleGeneralDrop(e, group.id)}
            />
          ))}
        </div>

        {/* Trash drop zone — only visible while dragging a group */}
        {dragState.draggedGroupId && (
          <div
            onDragOver={dragState.handleTrashDragOver}
            onDragLeave={dragState.handleTrashDragLeave}
            onDrop={dragState.handleTrashDrop}
            className={`mt-4 border-2 border-dashed rounded-xl p-4 transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer ${
              dragState.isGroupDragOverTrash
                ? "border-red-500 bg-red-50 text-red-600 scale-[1.02] shadow-md ring-4 ring-red-100"
                : "border-red-200 bg-red-50/30 text-red-400 hover:border-red-350 hover:bg-red-50/40"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              Arrastra aquí para eliminar grupo
            </span>
          </div>
        )}
      </div>

      <UnassignedBrothersPanel
        unassignedBrothers={unassignedBrothers}
        isDragTarget={dragState.draggedOverGroupId === "unassigned"}
        onDragOver={(e) => dragState.handleDragOver(e, "unassigned")}
        onDragLeave={() => dragState.setDraggedOverGroupId(null)}
        onDrop={(e) => dragState.handleDrop(e, null)}
        onBrotherDragStart={dragState.handleBrotherDragStart}
        onBrotherDragEnd={dragState.handleBrotherDragEnd}
      />
    </div>
  );
}
