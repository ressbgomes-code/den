# Den

Tarefas como no Todoist, notas como no Bear, e #etiquetas ligando tudo.
App web instalável (PWA) que funciona offline e sincroniza pelo Supabase.

## O que tem
- Entrada, Hoje, Em breve, projetos e etiquetas
- Visões de Lista, Quadro (kanban), Calendário e Prioridades (matriz de Eisenhower)
- Data, hora, prazo e vários lembretes por tarefa
- Pomodoro por tarefa, com meta de sessões e mini cronômetro
- Ramble: fale várias tarefas de uma vez e o Den separa datas, horários, prazos e urgência
- Notas em Markdown com destaques, checklists e envio de itens para a Entrada
- Adicionar rápido em português: "ligar pro banco amanhã às 10 p2 #pessoal prazo sexta"

## Instalar no iPhone
1. Abra o endereço do app no Safari.
2. Toque em Compartilhar e em "Adicionar à Tela de Início".
3. Abra pelo ícone, entre na sua conta e ative as notificações em Ajustes.

## Estrutura
- `index.html`, `css/app.css`: interface
- `js/app.js`: telas e interações
- `js/parse.js`: leitura de datas e do Ramble (pt-BR e inglês)
- `js/store.js`: dados locais e sincronização com o Supabase
- `js/config.js`: endereço do Supabase e chave pública
- `sw.js`, `manifest.webmanifest`: funcionamento offline e instalação
- `supabase/schema.sql`: tabelas e regras de segurança
