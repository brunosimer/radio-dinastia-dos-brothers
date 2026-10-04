# Rádio e Central Dinastia dos Brothers

Site: https://radio-dinastia-dos-brothers.web.app
Central: https://radio-dinastia-dos-brothers.web.app/central.html

## Dados
A central consulta a API pública do Sleeper ao abrir e a cada cinco minutos enquanto está aberta. Apenas leitura. Usa league-data.json como cópia de segurança, com data exibida se a API falhar. Pontos individuais e totais seguem o Sleeper; seeding de divisões não é reproduzido. Mercado consulta a semana atual e anterior, filtra transações concluídas, e não reconstrói alterações de titulares sem snapshots históricos.

Para atualizar a cópia: python3 sync-league.py
Para publicar: firebase deploy --only hosting
Autentique a CLI na sua conta Google antes de publicar. Não há segredos nestes arquivos.

Episódios: dois áudios persistidos no site. Administração, comentários e automação de boletins são etapas posteriores.
