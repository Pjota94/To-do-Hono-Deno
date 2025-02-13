import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { createClient } from "@supabase/supabase-js";
import { TodoList } from "./components/TodoList.tsx";
import { useState } from "hono/jsx";

const app = new Hono();

const SUPABASE_URL = "https://xeoqsvidfwsudiwiliev.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlb3FzdmlkZndzdWRpd2lsaWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMTkzODIsImV4cCI6MjA1NDc5NTM4Mn0.UWLVcHtVoQJ50AdtAa2eeGfSE-Avf47Z5VKXeesr_5w";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.get("/", async (c) => {
  const { data, error } = await supabase.from("todos").select("*");

  if (error) {
    return c.json({ error });
  }

  const [todos, setTodos] = useState(data);

  // Gerando os itens da lista com o botão de exclusão
  const todosList = todos
    .map(
      (todo: { id: string, title: string }) => `
        <li class="bg-white p-4 rounded-lg shadow-md hover:bg-gray-100 flex justify-between items-center">
          <span class="text-xl text-gray-700">${todo.title}</span>
          <button class="ml-4 bg-red-500 text-white px-3 py-1 rounded-md" onclick="deleteTodo('${todo.id}')">Excluir</button>
        </li>`
    )
    .join("");

  return c.html(`
    <html>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-100 p-8">
        <h1 class="text-4xl font-bold text-center mb-6">Todo List</h1>
        
        <form id="todo-form" class="mb-6">
          <input type="text" id="title" name="title" placeholder="Novo Todo" required class="p-2 rounded-md border">
          <button type="submit" class="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md">Adicionar</button>
        </form>

        <ul class="max-w-md mx-auto space-y-4">
          ${todosList}
        </ul>

        <script>
          const form = document.getElementById('todo-form');
          form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const title = document.getElementById('title').value;

            if (title) {
              const response = await fetch('/add', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
              });

              if (response.ok) {
                // Atualiza a lista de todos sem recarregar a página
                const updatedTodos = await response.json();
                const todosList = updatedTodos
                  .map(todo => \`<li class="bg-white p-4 rounded-lg shadow-md hover:bg-gray-100 flex justify-between items-center">
                    <span class="text-xl text-gray-700">\${todo.title}</span>
                    <button class="ml-4 bg-red-500 text-white px-3 py-1 rounded-md" onclick="deleteTodo('\${todo.id}')">Excluir</button>
                  </li>\`)
                  .join('');
                document.querySelector('ul').innerHTML = todosList;
                document.getElementById('title').value = ''; // Limpa o campo de input
              }
            }
          });

          // Função de exclusão
          async function deleteTodo(id) {
            const response = await fetch('/delete/' + id, {
              method: 'DELETE',
            });

            if (response.ok) {
              const updatedTodos = await response.json();
              const todosList = updatedTodos
                .map(todo => \`<li class="bg-white p-4 rounded-lg shadow-md hover:bg-gray-100 flex justify-between items-center">
                  <span class="text-xl text-gray-700">\${todo.title}</span>
                  <button class="ml-4 bg-red-500 text-white px-3 py-1 rounded-md" onclick="deleteTodo('\${todo.id}')">Excluir</button>
                </li>\`)
                .join('');
              document.querySelector('ul').innerHTML = todosList;
            }
          }
        </script>
      </body>
    </html>
  `);
});

app.post("/add", async (c) => {
  const body = await c.req.json(); 
  const { title } = body;

  if (!title) {
    return c.text("Título é obrigatório!", 400);
  }

  const { error } = await supabase.from("todos").insert([{ title }]);

  if (error) {
    return c.text("Erro ao adicionar!", 500);
  }

  // Recuperando os dados atualizados
  const { data, error: fetchError } = await supabase.from("todos").select("*");
  
  if (fetchError) {
    return c.text("Erro ao obter dados!", 500);
  }

  return c.json(data); // Respondendo com os dados atualizados
});

// Rota para excluir o item
app.delete("/delete/:id", async (c) => {
  const id = c.req.param("id");

  // Deletando o item pelo id
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    return c.text("Erro ao excluir o item!", 500);
  }

  // Retornando os dados atualizados após exclusão
  const { data, error: fetchError } = await supabase.from("todos").select("*");
  
  if (fetchError) {
    return c.text("Erro ao obter dados após exclusão!", 500);
  }

  return c.json(data); // Respondendo com os dados atualizados após exclusão
});

Deno.serve(app.fetch);
