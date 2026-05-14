export const METHOD_TYPES = {
  NEW_PENDING: {
    id: 'NEW_PENDING',
    label: 'Método novo — validação pendente',
    description: 'Protocolo estabelecido, estudo interlaboratorial ainda por executar.'
  },
  VALIDATED_NEW_APP: {
    id: 'VALIDATED_NEW_APP',
    label: 'Método validado — nova aplicação',
    description: 'Método já validado sendo proposto para uma nova finalidade.'
  },
  VALIDATED_NEW_SYSTEM: {
    id: 'VALIDATED_NEW_SYSTEM',
    label: 'Método validado — novo sistema teste',
    description: 'Método já validado sendo aplicado a um novo sistema teste.'
  },
  NEW_COMPLETE: {
    id: 'NEW_COMPLETE',
    label: 'Método novo — dossiê completo',
    description: 'Protocolo estabelecido e toda a validação já concluída, dossiê pronto para revisão.'
  },
  IDEA: {
    id: 'IDEA',
    label: 'Ideia de método',
    description: 'Conceito ainda a ser desenvolvido, sem protocolo estabelecido.'
  }
};

export const MOCK_TEMPLATES = [
  {
    id: 'tpl-new-pending',
    name: 'Template: Validação Pendente',
    methodType: 'NEW_PENDING',
    description: 'Fluxo completo para métodos novos com protocolo definido.',
    status: 'active',
    sections: [
      {
        id: 'sec-gen-info',
        name: 'Informações Gerais',
        description: 'Dados básicos do proponente e do método.',
        order: 1,
        isRequired: true,
        isVisible: true,
        fields: [
          { id: 'f-name', label: 'Nome do Método', type: 'text', isRequired: true },
          { id: 'f-area', label: 'Área Científica', type: 'select', options: ['Toxicologia', 'Ecotoxicologia', 'Farmacologia'], isRequired: true }
        ],
        aiPromptConfig: {
          enabled: true,
          prompt: 'Verifique se o nome do método é técnico e se a área científica corresponde à descrição.',
          responseSchema: [
            { key: 'technical_quality', label: 'Qualidade Técnica', type: 'score', isRequired: true },
            { key: 'feedback', label: 'Parecer', type: 'text', isRequired: true }
          ],
          mockPreviewResponse: '{"technical_quality": 95, "feedback": "Nome apropriado e área bem definida."}'
        }
      },
      {
        id: 'sec-sci-basis',
        name: 'Fundamentação Científica',
        description: 'Justificativa e base teórica do método.',
        order: 2,
        isRequired: true,
        isVisible: true,
        fields: [
          { id: 'f-hypo', label: 'Hipótese Científica', type: 'textarea', isRequired: true },
          { id: 'f-rel', label: 'Relevância Regulatória', type: 'textarea', isRequired: true }
        ],
        aiPromptConfig: {
          enabled: true,
          prompt: 'Analise a robustez da fundamentação científica baseada em evidências.',
          responseSchema: [
            { key: 'robustness', label: 'Robustez', type: 'score', isRequired: true },
            { key: 'gaps', label: 'Lacunas identificadas', type: 'list', isRequired: true }
          ],
          mockPreviewResponse: '{"robustness": 80, "gaps": ["Falta citação de estudos de 2025", "Mecanismo de ação pouco detalhado"]}'
        }
      },
      {
        id: 'sec-protocol',
        name: 'Protocolo Experimental',
        description: 'Procedimento detalhado do teste.',
        order: 3,
        isRequired: true,
        isVisible: true,
        fields: [
          { id: 'f-steps', label: 'Passo-a-passo', type: 'textarea', isRequired: true },
          { id: 'f-materials', label: 'Materiais e Reagentes', type: 'textarea', isRequired: true }
        ]
      }
    ]
  },
  {
    id: 'tpl-validated-new-app',
    name: 'Template: Nova Aplicação',
    methodType: 'VALIDATED_NEW_APP',
    description: 'Focado em justificar a extensão do uso de um método já aceito.',
    status: 'active',
    sections: [
      {
        id: 'sec-gen-info-2',
        name: 'Informações Gerais',
        order: 1,
        isVisible: true,
        fields: [
          { id: 'f-name-2', label: 'Nome do Método', type: 'text', isRequired: true }
        ]
      },
      {
        id: 'sec-reg-doc',
        name: 'Documentação Regulatória Original',
        description: 'Dados do método já validado.',
        order: 2,
        isVisible: true,
        fields: [
          { id: 'f-orig-id', label: 'ID do Método Original (OECD/ISO)', type: 'text', isRequired: true },
          { id: 'f-orig-doc', label: 'Anexo do Certificado', type: 'file', isRequired: true }
        ]
      }
    ]
  },
  {
    id: 'tpl-idea',
    name: 'Template: Ideia Conceitual',
    methodType: 'IDEA',
    description: 'Captação inicial de conceitos para futura orientação.',
    status: 'active',
    sections: [
      {
        id: 'sec-concept',
        name: 'Descrição Conceitual',
        order: 1,
        isVisible: true,
        fields: [
          { id: 'f-concept-desc', label: 'O que o método propõe?', type: 'textarea', isRequired: true }
        ]
      }
    ]
  }
];
