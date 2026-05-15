import React, { useState } from 'react';
import useFormBuilderStore from '../../modules/formBuilder/store/formBuilderStore';
import TemplateList from './components/TemplateList';
import SectionEditor from './components/SectionEditor';
import FormPreview from './components/FormPreview';
import './FormBuilderPage.css';

const FormBuilderPage = () => {
  const { templates, selectedTemplateId, setSelectedTemplate } = useFormBuilderStore();
  const [activeTab, setActiveTab] = useState('structure'); // structure, rules, ai
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const togglePreview = () => setIsPreviewOpen(!isPreviewOpen);

  return (
    <div className={`form-builder-page ${isPreviewOpen ? 'preview-open' : ''}`}>
      <header className="builder-header">
        <div className="header-info">
          <h1>Configurador de Submissão</h1>
          <p>Gestão técnica de templates e critérios de inteligência artificial</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={togglePreview}>
            {isPreviewOpen ? 'Ocultar Preview' : 'Visualizar Preview'}
          </button>
        </div>
      </header>

      <div className="builder-layout">
        {/* LEFT BLOCK: Configuração (Now the dominant workspace) */}
        <div className="builder-config-container">
          {/* 1. Template Selection (Now more integrated and compact) */}
          <section className="config-section template-selector-compact">
            <TemplateList 
              templates={templates} 
              selectedId={selectedTemplateId} 
              onSelect={setSelectedTemplate} 
            />
          </section>

          {selectedTemplate ? (
            <div className="editor-workspace">
              {/* 2. Main Navigation Tabs (Structure, Rules, IA) */}
              <nav className="config-tabs">
                <button 
                  className={`config-tab-btn ${activeTab === 'structure' ? 'active' : ''}`}
                  onClick={() => setActiveTab('structure')}
                >
                  1. Estrutura
                </button>
                <button 
                  className={`config-tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rules')}
                >
                  2. Regras & Campos
                </button>
                <button 
                  className={`config-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ai')}
                >
                  3. Inteligência Artificial
                </button>
              </nav>

              {/* 3. Dominant Editor Content */}
              <main className="builder-content-dominant">
                {activeTab === 'structure' && <SectionEditor template={selectedTemplate} mode="structure" />}
                {activeTab === 'rules' && <SectionEditor template={selectedTemplate} mode="rules" />}
                {activeTab === 'ai' && <SectionEditor template={selectedTemplate} mode="ai" />}
              </main>
            </div>
          ) : (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '16px', opacity: 0.3 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Selecione um template para iniciar a configuração.
            </div>
          )}
        </div>

        {/* RIGHT BLOCK: Collapsible Preview Drawer */}
        <aside className={`builder-preview-drawer ${isPreviewOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <h3>Preview em Tempo Real</h3>
            <button className="btn-close-drawer" onClick={() => setIsPreviewOpen(false)}>×</button>
          </div>
          <div className="drawer-content">
            <FormPreview template={selectedTemplate} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FormBuilderPage;
