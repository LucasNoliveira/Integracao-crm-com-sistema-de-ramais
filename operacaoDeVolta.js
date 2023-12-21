const beeApi = 'https://api.beeceptor.com/api/v1/endpoints/vittagroup/requests?mode=full';
const apiKey = 'e91c45cd55e0bf2df0a9a09cb6e963688b24cbc2lcO6vYMMSgcrK7V';
const tokenIpbox = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC92ZXJpeC5jb20uYnIiLCJhdWQiOiJodHRwOlwvXC9pcGJveC5jb20uYnIiLCJpYXQiOjE2OTk1NTE3NTIsIm5iZiI6MTY5OTU1MTc1NCwiZGF0YSI6eyJ1c3VhcmlvX2lkIjoiMSIsInRva2VuX2lkIjoiUmxyMUsyYnRXNUVsaHhrakQ2THcifX0.nwBsCiJuQc_kokGzBDWGvxtuCiIuHSXJb-_aMKeb4O8'

// Crie uma variável vazia para armazenar os telefones formatados

async function conectarIpbox() {
    let telefonesFormatados = [];

    try {
        const responseBee = await fetch(beeApi, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!responseBee.ok) {
            throw new Error(`Erro HTTP! Status: ${responseBee.status}`);
        }

        const respostaBee = await responseBee.json();
        const contatos = respostaBee.data;

        for (contato of contatos) {
            if (contato.method === 'POST' && contato.path == '/success') {
                const contatoObj = JSON.parse(contato.req.b);
                let telefone = contatoObj.Telefone;

                // Remover possível código de país (+55 ou 55), aceitando qualquer quantidade de caracteres não numéricos antes
                telefone = telefone.replace(/^.*?(\+?55|55)/, '');

                // Remover parênteses, hífens e espaços
                const telefoneFormatado = telefone.replace(/[\s\(\)\-]/g, '');

                // Adicione o telefoneFormatado à array telefonesFormatados
                telefonesFormatados.push(telefoneFormatado);
            }
        }

        // Agora a variável telefonesFormatados contém todos os telefones formatados
        console.log('Telefones Formatados:', telefonesFormatados);

        // Agora vamos buscar os prospects com números correspondentes
        var axios = require('axios');
        var qs = require('qs');
        var data = qs.stringify({
            'lote': 'seulote'
        });
        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://plenafacefranchising.ipboxcloud.com.br:8607/ipbox/api/getProspectLote',
            headers: {
                'Authorization': tokenIpbox,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const response = await axios(config);

        // Supondo que você já tenha a resposta da segunda API armazenada na variável 'response'
        const prospectData = response.data.data.prospects;

        // Filtrar prospects que têm números correspondentes aos telefones formatados
        const prospectsEncontrados = prospectData.filter(prospect => {
            // Extrair números do prospect
            const numerosProspect = prospect.numeros.map(numero => numero.ddd + numero.numero);

            // Remover código de país (+55) dos númerosProspect
            const numerosProspectSemPais = numerosProspect.map(numero => numero.replace(/^\+55/, ''));

            // Verificar se algum dos números do prospect está na lista de telefones formatados
            return numerosProspectSemPais.some(numero => telefonesFormatados.includes(numero));
        });

        // Agora 'prospectsEncontrados' contém os prospects que têm números correspondentes aos telefones formatados
        // console.log('Prospects Encontrados:', prospectsEncontrados);

        // Extrair números e ID dos prospects encontrados
        prospectsEncontrados.forEach(prospectEncontrado => {
            const id = prospectEncontrado.id;
            const nome = prospectEncontrado.nome;
            const situacao = prospectEncontrado.situacao;


            if (situacao === 'CLIENTE') {
                console.log(`ID: ${id}, Nome: ${nome}, Situação: ${situacao} - Cliente, Nenhuma ação necessária`);
                return;
            }
            // Extrair números do prospect
            const numerosProspect = prospectEncontrado.numeros.map(numero => numero.ddd + numero.numero);

            console.log(`ID: ${id}, Nome: ${nome}, Situação: ${situacao}, Números: ${numerosProspect.join(', ')}`);

            function excluiId(ids = id) {
                // console.log('chegamos aqui')
                console.log(`O ID ${ids} será excluído da fila`);

                var axios = require('axios');
                var qs = require('qs');
                var data = qs.stringify({
                    'prospectId': ids,
                    'resultadoLigacaoId': '18', // resultado para cliente, verificar documentação para classificar com outro resultado
                });
                var config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'https://plenafacefranchising.ipboxcloud.com.br:8607/ipbox/api/classificarProspect',
                    headers: {
                        'Authorization': tokenIpbox,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: data
                };

                axios(config)
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            } excluiId();

        });

    } catch (error) {
        console.error('Erro ao buscar dados do Beeceptor ou da segunda API:', error);
    }
} conectarIpbox()

setInterval(conectarIpbox, 1 * 60 * 1000);
