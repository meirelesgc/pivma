---
name: update-db
description: Adicionar uma nova "tabela" (entidade).
---

Como implementar uma nova entidade (por exemplo,  tasks  / tarefas):

### Passo 1: Criar o arquivo JSON de dados iniciais (opcional)

Crie um arquivo contendo os dados iniciais em  src/data/mock/tasks.json :
  [
    { "id": 1, "userId": 1, "title": "Implementar Services", "completed": true },
  ]
    { "id": 2, "userId": 1, "title": "Estilizar Dashboard", "completed": false }

### Passo 2: Registrar a nova "tabela" no banco em memória

Edite o arquivo db.js para inicializar e exportar a nova entidade:
  import initialUsers from '../data/mock/users.json'
  import initialTasks from '../data/mock/tasks.json' // 1. Importa os dados iniciais

  let users = [...initialUsers]
  let tasks = [...initialTasks] // 2. Coloca em memória

  export const db = {
    // Usuários
    getUsers: () => users,
    getUserById: (id) => users.find(u => u.id === Number(id)),

    // Tarefas (Novas funções)
    getTasks: () => tasks,
    getTasksByUserId: (userId) => tasks.filter(t => t.userId === Number(userId)),
    addTask: (task) => {
      const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1
      const newTask = { id: newId, ...task }
      tasks.push(newTask)
      return newTask
    }
  }

### Passo 3: Criar a camada de Service da nova entidade

Crie o arquivo  src/services/tasks.js  para gerenciar as operações assíncronas (simulando latência de rede):

  import { db } from './db'

  export async function getTasks() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return db.getTasks()
  }

  export async function createTask(task) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return db.addTask(task)
  }

### Passo 4: Criar o Hook personalizado com TanStack Query

Crie o arquivo  src/hooks/useTasks.js  que integrará a chamada com a gerência de estado do TanStack:

  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  import { getTasks, createTask } from '../services/tasks'

  export function useTasks() {
    const queryClient = useQueryClient()

    const tasksQuery = useQuery({
      queryKey: ['tasks'],
      queryFn: getTasks
    })

    const createTaskMutation = useMutation({
      mutationFn: createTask,
      onSuccess: () => {
        // Invalida o cache e força a atualização da lista
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      }
    })

    return {
      tasks: tasksQuery.data || [],
      isLoading: tasksQuery.isLoading,
      createTask: createTaskMutation.mutate
    }
  }

### Passo 5: Utilizar na aplicação

No seu componente de tela, basta importar e consumir o hook normalmente:

  import { useTasks } from '../hooks/useTasks'

  export function TasksComponent() {
    const { tasks, isLoading, createTask } = useTasks()

    if (isLoading) return <p>Carregando...</p>

    return (
      <div>
        <ul>
          {tasks.map(task => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
        <button onClick={() => createTask({ userId: 1, title: 'Nova Tarefa', completed: false })}>
          Adicionar Tarefa
        </button>
      </div>
    )
  }
