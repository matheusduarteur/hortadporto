Você está trabalhando no projeto Roça App usando o Claude Code.

Já existe um arquivo CLAUDE.md na raiz do projeto com o contexto completo do sistema (domínio rural, tabelas do Supabase, módulos de galinhas, vacas, tilápia, horta, vendas e despesas).
Leia e respeite o CLAUDE.md como fonte principal de verdade sobre o projeto.

Abaixo estão instruções adicionais específicas para esta tarefa.

1. Stack e estado atual do projeto
Projeto: roca-app
Framework: Next.js (App Router)
Linguagem: TypeScript
Estilos: Tailwind CSS
Banco: Supabase, com tabelas já criadas (descritas no CLAUDE.md)
Cliente Supabase: lib/supabaseClient.ts já configurado (não recriar)
.env.local já está configurado com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
Não modifique o schema do banco, apenas consuma os dados das tabelas existentes.

2. Objetivo desta rodada
Quero que você monte a estrutura completa do front-end do Roça App, dando foco em:

Layout bonito e organizado, com cara de aplicativo (não cara de painel cinza sem graça).
Navegação clara entre módulos (galinhas, vacas, tilápia, horta, vendas, despesas, relatórios).
Visual pensado para celular primeiro, mas funcionando bem em desktop (design responsivo).
Base pronta para comportamento tipo PWA:
Não precisa configurar service worker ou manifest agora,
Mas pense em layout e navegação que façam sentido como um “app instalado” na tela inicial do celular.
Uso moderado de ícones/emojis para dar identidade visual, mas sem virar carnaval.
3. Layout e navegação
Monte um layout principal em app/layout.tsx com:

Um header simples com o nome do app: “Roça App”.
Um menu de navegação que funcione bem em:
Celular: menu “sandwich/hamburger” ou barra embaixo.
Desktop: pode ser uma sidebar ou topbar com links.
Links para as rotas:
/ – Dashboard
/galinhas – Galinhas / Ovos
/vacas – Vacas / Leite
/tilapia – Tilápia
/horta – Horta
/vendas – Vendas
/despesas – Despesas
/relatorios – Relatórios
Estilo visual:

Cores base:
Verde escuro (#14532d ou similar)
Marrom/terra (#78350f ou similar)
Tons claros de bege/areia (#f5f5dc, #faf5e4, etc.)
Tipografia simples, legível.
Ícones/emojis sugeridos nos menus, por exemplo:
🐔 Galinhas
🐄 Vacas
🐟 Tilápia
🥬 Horta
🛒 Vendas
💸 Despesas
📊 Relatórios
🏡 Dashboard
Use Tailwind para tudo isso.
4. Páginas e comportamento (resumo)
Os detalhes de campos e tabelas estão no CLAUDE.md. Aqui é só o que você deve implementar em cada rota, de forma prática:

4.1. / – Dashboard
Usar Supabase para buscar, no mês atual:
Total de ovos (somar quantity de egg_records)
Total de litros de leite (somar liters de milk_records)
Total de vendas (sum(total) de sales)
Total de despesas (sum(amount) de expenses)
Exibir cards bonitos, com ícones e números grandes:
“Ovos (mês)” 🐔
“Leite (mês)” 🐄
“Receita (mês)” 🛒
“Despesas (mês)” 💸
“Resultado (mês)” 📊 (receita – despesas)
Layout responsivo em grid simples.
4.2. Páginas de módulo (CRUD simples)
Para cada módulo: /galinhas, /vacas, /tilapia, /horta, /vendas, /despesas:

Um título com ícone.
Um formulário no topo, com:
todos os campos principais descritos no CLAUDE.md para aquela tabela,
validação mínima (ex: campos obrigatórios).
Ao enviar:
Inserir registro via Supabase.
Mostrar mensagem simples de sucesso ou erro.
Atualizar a lista abaixo sem precisar recarregar a página inteira (component client-side).
Uma tabela/listagem logo abaixo:
Exibir últimos registros (por exemplo, 30 mais recentes).
Ordenar por data descrescente.
Mostrar colunas mais importantes.
Botão “Excluir” que apaga o registro no Supabase, com confirmação.
Estilo dos formulários:
Inputs com borda arredondada, espaçamento confortável, labels claras.
Botões com cores alinhadas ao tema (verde para salvar, vermelho para deletar, etc.).
Use para cada uma as tabelas corretas do Supabase:

/galinhas → egg_records
/vacas → milk_records
/tilapia → fish_records
/horta → garden_records
/vendas → sales
/despesas → expenses
5. /relatorios – Relatórios
Criar uma página de relatórios simples, já com cara de área importante do sistema.
Primeiro passo:
Filtro fixo em “mês atual” (por enquanto não precisa de seletor de período).
Mostrar:
Receita total do mês (vendas).
Despesas totais do mês.
Resultado (lucro/prejuízo).
Opcional, mas desejável:
Tabela com despesas agrupadas por categoria (category de expenses), mostrando total por categoria.
Layout limpo, bem organizado, com ícones como:
Receita: 🛒
Despesas: 💸
Resultado: 📊
6. PWA / Experiência de App
Não precisa montar o PWA inteiro agora (manifest, service worker etc.), mas:

Estruture o layout e a navegação pensando que o usuário:
vai abrir isso no celular,
vai usar como “app”, possivelmente via atalho na tela inicial.
Ou seja:
Menu fácil de acessar com o polegar (header simples ou bottom nav),
Botões grandes o suficiente,
Nada muito poluído.
Se for simples implementar, você pode:

Criar um manifest.json básico e linkar no layout,
Adicionar metas de PWA mínimas,
mas trate isso como “nice to have”, não como bloqueador. O mais importante é o layout e as páginas funcionarem.

7. Padrões de código que quero
Tudo em TypeScript.
Usar async/await com Supabase.
Separar componentes quando começar a repetir coisas (ex: tabela padrão, card de dashboard, formulário padrão).
Tratar erros com mensagens amigáveis, mas logar detalhes no console.
Não fazer over-engineering (nada de arquitetura super complexa).
Pensa em “projeto real de produtor rural”, simples e objetivo.
8. Entrega esperada
Ao final desta rodada, espero que:

O projeto roca-app rode sem erros com:
   npm run dev
As rotas existam e funcionem:
/
/galinhas
/vacas
/tilapia
/horta
/vendas
/despesas
/relatorios
Todas elas:
usem o cliente supabase de lib/supabaseClient.ts;
tenham layout consistente com o tema rural;
tenham formulários e listagens funcionando (CRUD básico).
Use o conteúdo do CLAUDE.md como referência oficial para nomes de tabelas, campos e visão geral do Roça App.