import React from 'react';
import { useLifeMinistryData } from './hooks/useLifeMinistryData';
import { GuideListPanel } from './life-ministry/GuideListPanel';
import { WeekCarousel } from './life-ministry/WeekCarousel';
import { WeekBannerHero } from './life-ministry/WeekBannerHero';
import { AssignmentSection } from './life-ministry/AssignmentSection';
import { HallTabSelector } from './life-ministry/HallTabSelector';
import { AssignmentActionBar } from './life-ministry/AssignmentActionBar';
import { ExportPdfModal } from './life-ministry/ExportPdfModal';
import { ProgramSongRow } from './ProgramSongRow';
import { ProgramDurationRow } from './ProgramDurationRow';
import { ProgramSingleAssignmentCard } from './life-ministry/ProgramSingleAssignmentCard';

interface LifeMinistryTabProps {
  congregationId: string;
  currentUserUid?: string;
  initialGuideId?: string;
  initialWeekId?: string;
  hasAuxiliaryRoom?: boolean;
  allowMinorsAsAssistants?: boolean;
  allowSameWeekRepetition?: boolean;
}

export function LifeMinistryTab({
  congregationId,
  initialGuideId,
  initialWeekId,
  hasAuxiliaryRoom: hasAuxiliaryRoomProp,
  allowMinorsAsAssistants = false,
  allowSameWeekRepetition = false
}: LifeMinistryTabProps) {
  const hasAuxiliaryRoom = hasAuxiliaryRoomProp !== false;
  const {
    isLoadingGuides,
    isLoadingWeeks,
    isSaving,
    guides,
    selectedGuide,
    weeks,
    brothers,
    activeAssignment,
    recentAssigneeIds,
    recentHelperIds,
    lastWeekHelperIds,
    lastWeekAssigneeIds,
    activeWeekIndex,
    activeHall,
    isEditingAssignments,
    successMsg,
    errorMsg,
    selectGuide,
    selectWeek,
    setActiveHall,
    startEditing,
    cancelEditing,
    saveAssignments,
    updateAssignmentField
  } = useLifeMinistryData({ congregationId, initialGuideId, initialWeekId });

  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);

  if (isLoadingGuides) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#4a6da7]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-medium text-sm">Cargando guías mensuales...</span>
      </div>
    );
  }

  const activeWeek = weeks[activeWeekIndex];

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-slate-900">Reunión Vida y Ministerio</h3>
        <p className="text-xs text-slate-500 font-medium">
          Asigna y gestiona los participantes para cada parte de las reuniones de entre semana.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-100 animate-fade-in-down animate-duration-300">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold border border-red-100">
          {errorMsg}
        </div>
      )}

      {/* Main Flex Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Left Column: Activity Guides List */}
        <GuideListPanel
          guides={guides}
          selectedGuide={selectedGuide}
          onSelectGuide={selectGuide}
        />

        {/* Right Column: Weeks Carousel + Assignments Details */}
        <div className="w-full lg:w-4/5 lg:flex-grow min-w-0 space-y-6 lm-right-col">
          {!selectedGuide ? (
            <div className="bg-white/80 border border-slate-200/60 rounded-2xl p-16 text-center text-slate-500 shadow-sm">
              <h4 className="font-bold text-slate-700 text-base">Selecciona una guía mensual</h4>
              <p className="text-sm text-slate-400 mt-1.5 max-w-sm mx-auto">
                Elige una guía en el panel izquierdo para ver sus semanas y programar las asignaciones.
              </p>
            </div>
          ) : (
            <div className="space-y-6 w-full">
              {/* Weeks Horizontal Carousel & Action Button container */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
                {/* Left side: Weeks Carousel */}
                <div className="flex-1 min-w-0 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Semanas disponibles
                  </h4>
                  <WeekCarousel
                    isLoadingWeeks={isLoadingWeeks}
                    weeks={weeks}
                    activeWeekIndex={activeWeekIndex}
                    onSelectWeek={selectWeek}
                  />
                </div>
              </div>

              {/* Assignments Editor Section (Under carousel) */}
              {weeks.length > 0 && activeWeek && (
                <div className="space-y-6 w-full">
                  {/* Week Info Banner (Cabecera premium) */}
                  <WeekBannerHero week={activeWeek} />

                  {/* Actions buttons directly under header banner */}
                  <div className="flex justify-end w-full">
                    <AssignmentActionBar
                      isEditingAssignments={isEditingAssignments}
                      isSaving={isSaving}
                      onStartEdit={startEditing}
                      onSave={async () => {
                        await saveAssignments();
                        cancelEditing();
                      }}
                      onCancel={cancelEditing}
                      onExportPdf={() => setIsExportModalOpen(true)}
                    />
                  </div>

                  {/* Program sections */}
                  <div className="space-y-6 w-full">
                    {/* Inicio de la reunión */}
                    <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-6 shadow-sm w-full space-y-4">
                      {/* President */}
                      <ProgramSingleAssignmentCard
                        isEditing={isEditingAssignments}
                        section="president"
                        title="Presidente"
                        description="Presidente de la reunión"
                        assignment={activeAssignment?.president}
                        brothers={brothers}
                        onUpdateField={updateAssignmentField}
                        recentAssigneeIds={recentAssigneeIds}
                        recentHelperIds={recentHelperIds}
                        lastWeekHelperIds={lastWeekHelperIds}
                        lastWeekAssigneeIds={lastWeekAssigneeIds}
                        activeAssignment={activeAssignment}
                        allowMinorsAsAssistants={allowMinorsAsAssistants}
                        allowSameWeekRepetition={allowSameWeekRepetition}
                      />

                      {/* Aux Counselor */}
                      {hasAuxiliaryRoom && (
                        <ProgramSingleAssignmentCard
                          isEditing={isEditingAssignments}
                          section="auxCounselor"
                          title="Consejero de la sala auxiliar"
                          description="Consejero de la sala auxiliar de la reunión"
                          assignment={activeAssignment?.auxCounselor}
                          brothers={brothers}
                          onUpdateField={updateAssignmentField}
                          recentAssigneeIds={recentAssigneeIds}
                          recentHelperIds={recentHelperIds}
                          lastWeekHelperIds={lastWeekHelperIds}
                          lastWeekAssigneeIds={lastWeekAssigneeIds}
                          activeAssignment={activeAssignment}
                          allowMinorsAsAssistants={allowMinorsAsAssistants}
                          allowSameWeekRepetition={allowSameWeekRepetition}
                        />
                      )}

                      {/* Song First */}
                      <ProgramSongRow
                        isEditing={false}
                        subtitle="Número o título de la canción inicial"
                        value={activeWeek.songFirst || ""}
                        onChange={() => {}}
                        flat={true}
                      />

                      {/* Initial Prayer */}
                      <ProgramSingleAssignmentCard
                        isEditing={isEditingAssignments}
                        section="prayerFirst"
                        title="Oración"
                        description="Oración inicial de la reunión"
                        assignment={activeAssignment?.prayerFirst}
                        brothers={brothers}
                        onUpdateField={updateAssignmentField}
                        recentAssigneeIds={recentAssigneeIds}
                        recentHelperIds={recentHelperIds}
                        lastWeekHelperIds={lastWeekHelperIds}
                        lastWeekAssigneeIds={lastWeekAssigneeIds}
                        activeAssignment={activeAssignment}
                        allowMinorsAsAssistants={allowMinorsAsAssistants}
                        allowSameWeekRepetition={allowSameWeekRepetition}
                      />

                      {/* Intro Duration */}
                      <ProgramDurationRow
                        isEditing={false}
                        title="Palabras de introducción"
                        subtitle="Duración de la introducción"
                        value={activeWeek.introDuration || ""}
                        onChange={() => {}}
                        flat={true}
                      />
                    </div>

                    {/* Section 1: Treasures */}
                    {activeWeek.treasures && activeWeek.treasures.length > 0 && (
                      <AssignmentSection
                        section="treasures"
                        title="Tesoros de la Biblia"
                        colorClass="bg-[#3c7f8b]"
                        parts={activeWeek.treasures}
                        assignments={activeAssignment?.treasures}
                        auxAssignments={activeAssignment?.treasuresAux}
                        isEditing={isEditingAssignments}
                        brothers={brothers}
                        onUpdateField={updateAssignmentField}
                        recentAssigneeIds={recentAssigneeIds}
                        recentHelperIds={recentHelperIds}
                        lastWeekHelperIds={lastWeekHelperIds}
                        lastWeekAssigneeIds={lastWeekAssigneeIds}
                        activeAssignment={activeAssignment}
                        hasAuxiliaryRoom={hasAuxiliaryRoom}
                        allowMinorsAsAssistants={allowMinorsAsAssistants}
                        allowSameWeekRepetition={allowSameWeekRepetition}
                      />
                    )}

                    {/* Section 2: Field Ministry */}
                    {activeWeek.fieldMinistry && activeWeek.fieldMinistry.length > 0 && (
                      <AssignmentSection
                        section={activeHall === 'main' ? 'fieldMinistry' : 'fieldMinistryAux'}
                        title="Seamos Mejores Maestros"
                        colorClass="bg-[#be8900]"
                        parts={activeWeek.fieldMinistry}
                        assignments={
                          activeHall === 'main'
                            ? activeAssignment?.fieldMinistry
                            : activeAssignment?.fieldMinistryAux
                        }
                        isEditing={isEditingAssignments}
                        brothers={brothers}
                        onUpdateField={updateAssignmentField}
                        activeHall={activeHall}
                        recentAssigneeIds={recentAssigneeIds}
                        recentHelperIds={recentHelperIds}
                        lastWeekHelperIds={lastWeekHelperIds}
                        lastWeekAssigneeIds={lastWeekAssigneeIds}
                        activeAssignment={activeAssignment}
                        hasAuxiliaryRoom={hasAuxiliaryRoom}
                        allowMinorsAsAssistants={allowMinorsAsAssistants}
                        allowSameWeekRepetition={allowSameWeekRepetition}
                        headerRight={
                          hasAuxiliaryRoom ? (
                            <HallTabSelector
                              activeHall={activeHall}
                              onChangeHall={setActiveHall}
                            />
                          ) : undefined
                        }
                      />
                    )}

                    {/* Song Second */}
                    <ProgramSongRow
                      isEditing={false}
                      subtitle="Número o título de la canción intermedia"
                      value={activeWeek.songSecond || ""}
                      onChange={() => {}}
                    />

                    {/* Section 3: Christian Life */}
                    {activeWeek.christianLife && activeWeek.christianLife.length > 0 && (
                      <AssignmentSection
                        section="christianLife"
                        title="Nuestra Vida Cristiana"
                        colorClass="bg-[#bf2f13]"
                        parts={activeWeek.christianLife}
                        assignments={activeAssignment?.christianLife}
                        isEditing={isEditingAssignments}
                        brothers={brothers}
                        onUpdateField={updateAssignmentField}
                        recentAssigneeIds={recentAssigneeIds}
                        recentHelperIds={recentHelperIds}
                        lastWeekHelperIds={lastWeekHelperIds}
                        lastWeekAssigneeIds={lastWeekAssigneeIds}
                        activeAssignment={activeAssignment}
                        allowMinorsAsAssistants={allowMinorsAsAssistants}
                        allowSameWeekRepetition={allowSameWeekRepetition}
                      />
                    )}

                    {/* Conclusión de la reunión */}
                    <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-6 shadow-sm w-full space-y-4">
                      {/* Concl Duration */}
                      <ProgramDurationRow
                        isEditing={false}
                        title="Palabras de conclusión"
                        subtitle="Duración de la conclusión"
                        value={activeWeek.conclDuration || ""}
                        onChange={() => {}}
                        flat={true}
                      />

                      {/* Song Third */}
                      <ProgramSongRow
                        isEditing={false}
                        subtitle="Número o título de la canción final"
                        value={activeWeek.songThird || ""}
                        onChange={() => {}}
                        flat={true}
                      />

                      {/* Final Prayer */}
                      <ProgramSingleAssignmentCard
                        isEditing={isEditingAssignments}
                        section="prayerLast"
                        title="Oración"
                        description="Oración final de la reunión"
                        assignment={activeAssignment?.prayerLast}
                        brothers={brothers}
                        onUpdateField={updateAssignmentField}
                        recentAssigneeIds={recentAssigneeIds}
                        recentHelperIds={recentHelperIds}
                        lastWeekHelperIds={lastWeekHelperIds}
                        lastWeekAssigneeIds={lastWeekAssigneeIds}
                        activeAssignment={activeAssignment}
                        allowMinorsAsAssistants={allowMinorsAsAssistants}
                        allowSameWeekRepetition={allowSameWeekRepetition}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isExportModalOpen && selectedGuide && (
        <ExportPdfModal
          guide={selectedGuide}
          guides={guides}
          weeks={weeks}
          congregationId={congregationId}
          brothers={brothers}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}

function activeWeekItemHasContent(weeks: any[], activeWeekIndex: number): boolean {
  return !!weeks[activeWeekIndex];
}
