# Integração RD Station CRM com sistema de ramais (IPBoX)

## Descrição
Este projeto consiste em uma integração entre o RD Station CRM e o IPBox, proporcionando uma solução eficiente para a troca de dados entre essas plataformas. A integração visa facilitar o fluxo de informações entre sistemas, proporcionando uma experiência mais fluida para os usuários.
A ideia deste projeto era integrar a API do RD CRM Com a API do IPBoX, um sistema que realiza ligações para clientes. A princípio, era uma tarefa manual, mover os dados de leads de etapa no CRM, extrair informações como nome, cidade e telefone do lead e cadastrar no IPBox para que fosse colocado em uma fila de ligações.

## Funcionalidades
- Importação de Leads: Importa automaticamente leads do RD Station CRM para o IPBox, utilizando das automações do RD CRM com o Pluga Webhooks.
- Extração de Dados: O Pluga Webhooks extrai os dados dos leads toda vez que uma negociação é movida de etapa e envia para o Beeceptor, para executar a etapa de mock e extrair as informações enviadas pelos Webhooks
- Conexão da API do Beeceptor e importação de Dados no IPBoX: A partir desta etapa, iremos extrair os dados que chegaram ao Beeceptor por meio da API que será checada de 1 em 1 minuto aproximadamente
- Tratamento de dados e remoção de duplicatas: Os dados são todos devidamente tratados antes de enviar para o Beeceptor. Eliminamos o código de país (+55), caracteres especiais, espaços e tratamos possíveis duplicatas
- Envio para a API do IPBoX: Enviamos os dados recebidos para o IPBoX por meio da API
- Classificação e remoção de leads que já são clientes: Dependendo do resultado da ligação, classificamos e removemos leads que já são clientes ao movimentar para determinada etapa no CRM.

## Pré-requisitos
- Conta ativa no RD Station CRM e no IPBox.
- Conta ativa na Pluga e criação de integração.
- Conta ativa no Beeceptor com plano Team ativo.
- Credenciais de API configuradas para ambos os sistemas.

## Tecnologias
<div>
  <img height="30em" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img height="30em" src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img height="30em" src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white" />
</div>
