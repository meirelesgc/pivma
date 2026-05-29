import React from 'react';

const ExecutionStepper = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="execution-stepper-container">
      <div className="execution-stepper">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLocked = index > currentStep && !steps[index-1]?.isCompleted; // Simple logic

          return (
            <div 
              key={step.id} 
              className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => !isLocked && onStepClick(index)}
            >
              <div className="stepper-dot">
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className="stepper-label">{step.label}</span>
              {index < steps.length - 1 && <div className="stepper-line" />}
            </div>
          );
        })}
      </div>
      <style>{`
        .execution-stepper-container {
          padding: 16px 0;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          overflow-x: auto;
        }
        .execution-stepper {
          display: flex;
          justify-content: space-between;
          min-width: 600px;
          padding: 0 20px;
        }
        .stepper-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
          cursor: pointer;
          transition: all 0.2s;
        }
        .stepper-item.locked {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .stepper-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-tertiary);
          z-index: 2;
          transition: all 0.2s;
        }
        .stepper-item.active .stepper-dot {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
          transform: scale(1.1);
        }
        .stepper-item.completed .stepper-dot {
          background: #009c3b;
          border-color: #009c3b;
          color: white;
        }
        .stepper-label {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }
        .stepper-item.active .stepper-label {
          color: var(--primary-color);
        }
        .stepper-line {
          position: absolute;
          top: 14px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--border-color);
          z-index: 1;
        }
        .stepper-item.completed .stepper-line {
          background: #009c3b;
        }
      `}</style>
    </div>
  );
};

export default ExecutionStepper;
