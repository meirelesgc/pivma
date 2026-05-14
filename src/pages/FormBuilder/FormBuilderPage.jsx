import React, { useState } from 'react';
import useFormBuilderStore from '../../modules/formBuilder/store/formBuilderStore';
import TemplateList from './components/TemplateList';
import SectionEditor from './components/SectionEditor';
import FormPreview from './components/FormPreview';
import './FormBuilderPage.css';

const FormBuilderPage = () => {
  const { templates, selectedTemplateId, setSelectedTemplate } = useFormBuilderStore();
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="form-builder-page">
      <header className="builder-header">
        <div className="header-info">
          <h1>Configurador de Submissão</h1>
          <p>Gerencie templates e critérios de IA para a macroetapa de Triagem</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">Histórico de Alterações</button>
          <button className="btn-primary">Novo Template</button>
        </div>
      </header>

      <div className="builder-layout">
        <aside className="builder-sidebar">
          <TemplateList 
            templates={templates} 
            selectedId={selectedTemplateId} 
            onSelect={setSelectedTemplate} 
          />
        </aside>

        <main className="builder-content">
          {selectedTemplate ? (
            <SectionEditor template={selectedTemplate} />
          ) : (
            <div className="empty-state">Selecione um template para editar</div>
          )}
        </main>

        <aside className="builder-preview">
          <FormPreview template={selectedTemplate} />
        </aside>
      </div>
    </div>
  );
};

export default FormBuilderPage;
