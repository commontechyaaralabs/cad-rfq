"use client";

interface PipelineStage {
  id: number;
  name: string;
  description: string;
}

interface PipelineProps {
  stages: PipelineStage[];
  activeStage: number;
  setActiveStage: (stage: number) => void;
}

export const Pipeline = ({ stages, activeStage, setActiveStage }: PipelineProps) => {
  const getStageStatus = (stageId: number) => {
    if (stageId < activeStage) return "completed";
    if (stageId === activeStage) return "active";
    return "pending";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Inbound Pipeline</h2>
      <div className="flex items-start gap-4 flex-1">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const isCompleted = status === "completed";
          const isActive = status === "active";
          const nextStatus = index < stages.length - 1 ? getStageStatus(stages[index + 1].id) : "pending";
          const nextIsCompleted = nextStatus === "completed";
          const nextIsActive = nextStatus === "active";
          
          return (
            <div key={stage.id} className="contents">
              <button
                onClick={() => setActiveStage(stage.id)}
                className={`flex flex-col items-center gap-2 flex-shrink-0 min-w-0 transition-all ${
                  isCompleted ? 'text-[#5332FF]' : 
                  isActive ? 'text-[#5332FF]' : 
                  'text-gray-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 transition-all ${
                  isCompleted ? 'bg-[#5332FF] text-white' : 
                  isActive ? 'bg-[#5332FF] text-white' : 
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stage.id
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className={`font-medium text-sm ${
                    isCompleted ? 'text-[#5332FF]' : 
                    isActive ? 'text-[#5332FF]' : 
                    'text-gray-400'
                  }`}>
                    {stage.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{stage.description}</span>
                </div>
              </button>
              {index < stages.length - 1 && (
                <div className={`h-1 flex-1 mt-5 transition-colors ${
                  (isCompleted || nextIsCompleted || isActive || nextIsActive) ? 'bg-[#5332FF]' : 
                  'bg-gray-200'
                }`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

