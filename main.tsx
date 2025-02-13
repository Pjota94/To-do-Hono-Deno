import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { createClient } from "@supabase/supabase-js";
import { TodoList } from "./components/TodoList.tsx";

const app = new Hono();

const SUPABASE_URL = "https://xeoqsvidfwsudiwiliev.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlb3FzdmlkZndzdWRpd2lsaWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMTkzODIsImV4cCI6MjA1NDc5NTM4Mn0.UWLVcHtVoQJ50AdtAa2eeGfSE-Avf47Z5VKXeesr_5w";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.get("/", async (c) => {
  // Pegando dados da tabela 'todos' no Supabase
  const { data, error } = await supabase.from("todos").select("*");

  if (error) {
    return c.json({ error });
  }

  // Criando a lista de todos em HTML com Tailwind
  const todosList = data
  .map(
    (todo: { id: number; title: string }) => `
      <li class="bg-white p-4 rounded-lg shadow-md hover:bg-gray-100 flex justify-between items-center">
        <span class="text-xl text-gray-700">${todo.title}</span>
        <form action="/delete" method="POST">
          <input type="hidden" name="id" value="${todo.id}">
          <button type="submit" class="ml-2 bg-red-500 text-white px-4 py-2 rounded-md">Deletar</button>
        </form>
      </li>`
  )
  .join("");

  // Retornando o HTML com a lista de todos
  return c.html(`
    <html>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-100 p-8">
        <h1 class="text-4xl font-bold text-center mb-6">Todo List</h1>
        
        <form action="/add" method="post" class="mb-6">
          <input type="text" name="title" placeholder="Novo Todo" required class="p-2 rounded-md border">
          <button type="submit" class="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md">Adicionar</button>
        </form>

        <ul class="max-w-md mx-auto space-y-4">
          ${todosList}
        </ul>
      </body>
    </html>
  `);
});

// Criar novo todo (rota POST)
app.post("/add", async (c) => {
  const body = await c.req.parseBody();
  const title = body["title"];

  console.log("Título recebido:", title);  // Adicionando log para depuração

  if (!title) {
    return c.text("Título é obrigatório!", 400);
  }

  const { error } = await supabase.from("todos").insert([{ title }]);

  if (error) {
    console.error("Erro ao adicionar:", error.message);  // Log do erro
    return c.text("Erro ao adicionar!", 500);
  }

  return c.redirect("/");
});

//Deletar Todo

app.post("/delete", async (c) => {
  const body = await c.req.parseBody();
  const id = body["id"];

  if (!id) {
    return c.text("ID é obrigatório para deletar!", 400);
  }

  // Deletando o todo com o id fornecido
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir:", error.message); // Log do erro
    return c.text("Erro ao excluir!", 500);
  }

  return c.redirect("/"); // Redireciona para a página principal após a exclusão
});
Deno.serve(app.fetch);
