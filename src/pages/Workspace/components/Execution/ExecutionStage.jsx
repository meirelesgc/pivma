import { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';
import LabDashboard from './LabDashboard';
import TrialManagement from './TrialManagement';
import SampleReceipt from './SampleReceipt';
import MaterialReturn from './MaterialReturn';
import FinalConsolidation from './FinalConsolidation';
import {
  FiActivity,
  FiPackage,
  FiShield,
  FiBarChart2,
  FiAlertTriangle
} from 'react-icons/fi';
import './Execution.css';

const ExecutionStage = ({ process }) => {
  const { user } = useMockStore();
  const [activeSubModule, setActiveSubModule] = useState('dashboard');

  // Determine user role in this process
  const myParticipant = process.participants?.find(p => p.email === user.email);
  const isLeader = myParticipant?.role === 'LABORATORIO_LIDER' || myParticipant?.role === 'Gerente de Validação';
  const isParticipant = myParticipant?.role === 'LABORATORIO_PARTICIPANTE';

  // Navigation items based on role
  const navItems = [
    { id: 'receipt', label: 'Recebimento de Materiais', icon: <FiPackage />, roles: ['LABORATORIO_PARTICIPANTE', 'LABORATORIO_LIDER'] },
    { id: 'dashboard', label: 'Dashboard Experimental', icon: <FiActivity />, roles: ['ANY'] },
  ];

  if (isLeader) {
    navItems.push({ id: 'management', label: 'Gestão da Execução', icon: <FiShield />, roles: ['LABORATORIO_LIDER', 'Gerente de Validação'] });
    navItems.push({ id: 'consolidation', label: 'Consolidação Interlab', icon: <FiBarChart2 />, roles: ['LABORATORIO_LIDER', 'Gerente de Validação'] });
  }

  if (isParticipant || isLeader) {
    navItems.push({ id: 'returns', label: 'Devolução de Amostras', icon: <FiAlertTriangle />, roles: ['LABORATORIO_PARTICIPANTE', 'LABORATORIO_LIDER'] });
  }

  const renderSubModule = () => {
    switch (activeSubModule) {
      case 'dashboard':
        return <LabDashboard process={process} />;
      case 'management':
        return <TrialManagement process={process} />;
      case 'receipt':
        return <SampleReceipt process={process} />;
      case 'returns':
        return <MaterialReturn process={process} />;
      case 'consolidation':
        return <FinalConsolidation process={process} />;
      default:
        return <LabDashboard process={process} />;
    }
  };

  return (
    <div className="execution-stage-container">
      <header className="execution-header">
        <div className="execution-title-group">
          <span className="stage-badge execution">Etapa D/E</span>
          <h3 className="m-0">Execução e Monitoramento Experimental</h3>
        </div>
        <p className="text-secondary text-small">
          Fase de coleta de dados brutos e ensaios interlaboratoriais sob diretrizes BraCVAM/OCDE.
        </p>
      </header>

      <div className="execution-nav-tabs">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-tab-item ${activeSubModule === item.id ? 'active' : ''}`}
            onClick={() => setActiveSubModule(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="execution-module-content">
        {renderSubModule()}
      </div>

      <style>{`
        .execution-stage-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: fadeIn 0.3s ease-in-out;
        }

        .execution-nav-tabs {
          display: flex;
          gap: 4px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
          width: fit-content;
        }

        .nav-tab-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: none;
          background: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .nav-tab-item:hover {
          background: rgba(255,255,255,0.5);
          color: var(--primary-color);
        }

        .nav-tab-item.active {
          background: white;
          color: var(--primary-color);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .execution-module-content {
          margin-top: 10px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ExecutionStage;
