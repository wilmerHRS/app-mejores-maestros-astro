import React, { useState, useEffect } from 'react';
import { fetchBrothersClient, deleteBrotherClient, fetchGroupsClient, type Brother, type Group } from '@/shared/api';
import { CreateBrotherModal } from './CreateBrotherModal';
import { EditBrotherModal } from './EditBrotherModal';
import { EditSpiritualModal } from './EditSpiritualModal';
import { BrotherSearchFilters } from './BrotherSearchFilters';
import { BrotherTable } from './BrotherTable';

interface BrothersTabProps {
  congregationId: string;
}

export function BrothersTab({ congregationId }: BrothersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSpiritualModalOpen, setIsSpiritualModalOpen] = useState(false);
  const [editingBrother, setEditingBrother] = useState<Brother | null>(null);

  useEffect(() => {
    if (congregationId) {
      fetchBrothers();
      fetchGroups();
    } else {
      setIsLoading(false);
    }
  }, [congregationId]);

  const fetchGroups = async () => {
    try {
      const data = await fetchGroupsClient(congregationId);
      const sorted = [...data].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setGroups(sorted);
    } catch (err: any) {
      console.error('Error al obtener la lista de grupos:', err);
    }
  };

  const fetchBrothers = async () => {
    try {
      setIsLoading(true);
      setGeneralError('');
      const data = await fetchBrothersClient(congregationId);
      setBrothers(data);
    } catch (err: any) {
      setGeneralError(err.message || 'Error al obtener la lista de hermanos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (newBrother: Brother) => {
    setBrothers((prev) => [newBrother, ...prev]);
  };

  const handleEditClick = (brother: Brother) => {
    setEditingBrother(brother);
    setIsEditModalOpen(true);
  };

  const handleSpiritualClick = (brother: Brother) => {
    setEditingBrother(brother);
    setIsSpiritualModalOpen(true);
  };

  const handleEditSuccess = (updatedBrother: Brother) => {
    setBrothers((prev) => prev.map((b) => b.id === updatedBrother.id ? updatedBrother : b));
  };

  const handleDeleteClick = async (brother: Brother) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar a ${brother.names} ${brother.paternalLastname}?`);
    if (!confirmDelete) return;

    try {
      setGeneralError('');
      await deleteBrotherClient(brother.id);
      setBrothers((prev) => prev.filter((b) => b.id !== brother.id));
    } catch (err: any) {
      setGeneralError(err.message || 'Error al eliminar el hermano');
    }
  };

  const filteredBrothers = brothers.filter((brother) => {
    const fullName = `${brother.names} ${brother.paternalLastname} ${brother.maternalLastname || ''}`.toLowerCase();
    const phone = brother.phone.toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(query) || phone.includes(query);
    const matchesGroup = selectedGroupId ? brother.groupId === selectedGroupId : true;
    return matchesSearch && matchesGroup;
  });

  const menCount = brothers.filter(h => h.gender === 'M').length;
  const womenCount = brothers.filter(h => h.gender === 'F').length;

  return (
    <div className="space-y-6">
      {/* Tab Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Listado de Hermanos</h3>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 bg-gradient-to-r from-[#4a6da7] to-[#3a588b] hover:from-[#354f7a] hover:to-[#2b4164] active:scale-[0.97] text-white font-bold rounded-xl text-xs transition-all duration-300 shadow-lg shadow-[#4a6da7]/20 hover:shadow-xl hover:shadow-[#4a6da7]/30 flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer border border-[#4a6da7]/30 hover:border-[#354f7a]/40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Agregar Hermano</span>
        </button>
      </div>

      {generalError && (
        <div className="p-4 rounded-xl text-sm border bg-red-50 border-red-200/60 text-red-600">
          <span>{generalError}</span>
        </div>
      )}

      {/* Filter and Search controls */}
      <BrotherSearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={brothers.length}
        menCount={menCount}
        womenCount={womenCount}
        groups={groups}
        selectedGroupId={selectedGroupId}
        onGroupChange={setSelectedGroupId}
      />

      {/* Brothers Table Card */}
      <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
        <BrotherTable
          isLoading={isLoading}
          brothers={filteredBrothers}
          groups={groups}
          onSpiritualClick={handleSpiritualClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </div>

      {/* Registration Modal */}
      <CreateBrotherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        congregationId={congregationId}
        groups={groups}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <EditBrotherModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBrother(null);
        }}
        brother={editingBrother}
        groups={groups}
        onSuccess={handleEditSuccess}
      />

      {/* Edit Spiritual Info Modal */}
      <EditSpiritualModal
        isOpen={isSpiritualModalOpen}
        onClose={() => {
          setIsSpiritualModalOpen(false);
          setEditingBrother(null);
        }}
        brother={editingBrother}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
