# Rádio e Central Dinastia dos Brothers

Site: https://radio-dinastia-dos-brothers.web.app
Central: https://radio-dinastia-dos-brothers.web.app/central.html

## Dados
A central consulta a API pública do Sleeper ao abrir e a cada cinco minutos enquanto está aberta. Apenas leitura. Usa league-data.json como cópia de segurança, com data exibida se a API falhar. Pontos individuais e totais seguem o Sleeper; seeding de divisões não é reproduzido. Mercado consulta a semana atual e anterior, filtra transações concluídas, e não reconstrói alterações de titulares sem snapshots históricos.

Para atualizar a cópia: python3 sync-league.py
Para publicar: firebase deploy --only hosting
Autentique a CLI na sua conta Google antes de publicar. Não há segredos nestes arquivos.

Episódios: quatro áudios persistidos no site. Administração, comentários e automação de boletins são etapas posteriores.

Edição 06/10/2026: fechamento da semana 4 e prévia da 5, áudio 24:19, página esportiva, seis placares, doze análises e relatório em boletim-semana-4.txt. Pontos e campanhas calculadas sujeitos a correções; não é seeding oficial.

Edição 13/10/2026: semana 5, campanhas oficiais após cinco rodadas, 37 operações concluídas e quatro waivers falhados na janela desde 06/10. Templyss em destaque. A trade Barkley/Jefferson por Puka/primeira de 2027 é pendente na apuração. Página anterior preservada em semana-4.html; relatório em boletim-semana-5.txt.

Podcast semana 5: Defesa mantém Templyss como único invicto, 12:53, português BR. Edição preservada em semana-5.html.
