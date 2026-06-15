```markdown
---
name: ui
description: Consulta as regras de estilo, estrutura de componentes e padrões visuais do projeto.
---

## 1. Estrutura de Componentes

Antes de criar componentes, consulte a árvore de diretórios para identificar componentes existentes e evitar duplicidade de código:

```bash
tree src/components

```

## 2. Padrões de Estilização

* **Classes CSS:** Evite propriedades `style` em linha. Utilize classes CSS definidas no escopo do projeto.
* **Componentes de Layout:** Utilize componentes de estrutura da biblioteca (ex: `Flex`, `Row`, `Col` do Ant Design) em vez de escrever regras de posicionamento no CSS.
* **Temas Globais (Ant Design):** Não aplique tokens de cores, espaçamentos ou bordas em propriedades de componentes. A customização de design system deve ser implementada via `ThemeProvider`.

---

## 3. Exemplos de Estilização

**Incorreto:**

```jsx
export function SecaoPerfil() {
  return (
    <div style={{ padding: "16px", background: "#fff" }}>
      Texto
    </div>
  );
}

```

**Correto:**

```jsx
export function SecaoPerfil() {
  return (
    <div className="card-container">
      Texto
    </div>
  );
}

```

**Incorreto:**

```jsx
<Button style={{ backgroundColor: '#1890ff', borderRadius: '8px' }}>
  Enviar
</Button>

```

**Correto:**

```jsx
<Button type="primary">
  Enviar
</Button>

```

## 4. Lógica de Composição e Refatoração

* **Separação de Responsabilidades:** Divida funções com mais de uma responsabilidade. Um componente deve gerenciar um bloco da interface de cada vez.
* **Extração de Iterações:** Crie componentes isolados para renderizar listas ou blocos contendo métodos como `.map()`.
* **Extração de Condicionais:** Isole lógicas de `if/else`, operadores ternários e renderizações condicionais (`&&`) em funções ou arquivos de componentes separados.
* **Separação de Estado e Apresentação:** Mantenha a chamada de hooks (ex: `useAuth`, `useLocation`) no componente pai. Repasse os dados obtidos para os componentes filhos via propriedades (`props`).
* **Passagem de Children:** Utilize a propriedade `children` para compor estruturas de invólucro (layouts, modais, painéis), delegando o conteúdo interno para o componente pai.

---

## 5. Exemplos de Composição

**Incorreto:**

```jsx
export function PaginaPerfil() {
  return (
    <div className="layout-container">
      <div className="sidebar">
        <nav>Menu</nav>
      </div>
      <div className="conteudo">
        <div className="card-container">
          <h2>Perfil do Usuário</h2>
          <p>Dados</p>
        </div>
      </div>
    </div>
  );
}

```

**Correto:**

```jsx
export function LayoutPrincipal({ children }) {
  return (
    <div className="layout-container">
      <div className="sidebar">
        <nav>Menu</nav>
      </div>
      <div className="conteudo">
        {children}
      </div>
    </div>
  );
}

export function CardPerfil({ children }) {
  return (
    <div className="card-container">
      <h2>Perfil do Usuário</h2>
      {children}
    </div>
  );
}

export function PaginaPerfil() {
  return (
    <LayoutPrincipal>
      <CardPerfil>
        <p>Dados</p>
      </CardPerfil>
    </LayoutPrincipal>
  );
}

```