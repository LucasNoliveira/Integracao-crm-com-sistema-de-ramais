const axios = require('axios');
const qs = require('qs');
const ipboxToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC92ZXJpeC5jb20uYnIiLCJhdWQiOiJodHRwOlwvXC9pcGJveC5jb20uYnIiLCJpYXQiOjE2OTk1NTE3NTIsIm5iZiI6MTY5OTU1MTc1NCwiZGF0YSI6eyJ1c3VhcmlvX2lkIjoiMSIsInRva2VuX2lkIjoiUmxyMUsyYnRXNUVsaHhrakQ2THcifX0.nwBsCiJuQc_kokGzBDWGvxtuCiIuHSXJb-_aMKeb4O8'

const beeApi = 'https://api.beeceptor.com/api/v1/endpoints/vittagroup/requests?mode=full';
const apiKey = 'e91c45cd55e0bf2df0a9a09cb6e963688b24cbc2lcO6vYMMSgcrK7V';

let arrayDeProcura = [];

async function adicionarNumerosAoArray() {
    try {
        const response = await axios.get(beeApi, {
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
        });

        const contatos = response.data.data;

        const formatarNumero = (telefone) => {
            return String(telefone).replace(/^\+55/, '').replace(/\(|\)/g, '').replace(/-/g, '').replace(/\s/g, '');
        };

        contatos.forEach((contato) => {
            const contatoObj = JSON.parse(contato.req.b);
            if (contatoObj && contatoObj.Telefone) {
                const numeroLimpo = formatarNumero(contatoObj.Telefone);
                const telefoneNumber = Number(numeroLimpo);
                arrayDeProcura.push(telefoneNumber);
            }
        });
    } catch (error) {
        console.error('Erro ao buscar dados do Beeceptor:', error);
    }
}

async function buscarNomeNoBeeceptor(numero) {
    try {
        const response = await axios.get(beeApi, {
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
        });

        const contatos = response.data.data;

        const formatarNumero = (telefone) => {
            return String(telefone).replace(/^\+55/, '').replace(/\(|\)/g, '').replace(/-/g, '').replace(/\s/g, '');
        };

        for (const contato of contatos) {
            if (contato.method === 'POST' && contato.path == '/fail'){

                const contatoObj = JSON.parse(contato.req.b);
                if (contatoObj && contatoObj.Telefone) {
                    const numeroLimpo = formatarNumero(contatoObj.Telefone);
                    const telefoneNumber = Number(numeroLimpo);
                    
                    if (telefoneNumber === numero) {
                        return contatoObj.Nome;
                    }
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar dados do Beeceptor:', error);
        return null;
    }
}

async function enviarProspect(numero, nomeEncontrado, tentativas = 3) {
    try {
        const data = qs.stringify({
            'lote': '4',
            'nome': nomeEncontrado,
            'fonecel': numero,
            'foneres': '',
            'fonecom': ''
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://plenafacefranchising.ipboxcloud.com.br:8607/ipbox/api/insertProspect',
            headers: {
                'Authorization': ipboxToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const response = await axios(config);
        console.log(JSON.stringify(response.data));
    } catch (error) {
        if (error.response && error.response.status === 409 && tentativas > 0) {
            console.log(`Conflict error, retrying after a delay. Remaining attempts: ${tentativas}`);
            await new Promise(resolve => setTimeout(resolve, 10000)); // Ajuste o atraso conforme necessário
            return enviarProspect(numero, nomeEncontrado, tentativas - 1); // Tentativa novamente com uma tentativa a menos
        } else {
            console.log('Error:', error);
        }
    }
}

async function main() {
    await adicionarNumerosAoArray();

    const data = qs.stringify({
        'lote': 'Google meu negócio'
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://plenafacefranchising.ipboxcloud.com.br:8607/ipbox/api/getProspectLote',
        headers: {
            'Authorization': ipboxToken,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    try {
        const response = await axios(config);
        const prospectData = response.data.data;
        const prospects = prospectData.prospects;

        const numerosUnicos = Array.from(new Set(arrayDeProcura));

        const encontrados = [];
        const naoEncontrados = [];

        await Promise.all(numerosUnicos.map(async (numeroProcurado) => {
            const encontrou = prospects.some((prospect) => {
                const numerosComDDD = prospect.numeros.map((numero) => `${numero.ddd}${numero.numero}`);
                return numerosComDDD.includes(String(numeroProcurado));
            });

            if (encontrou) {
                const prospectEncontrado = prospects.find((prospect) => {
                    const numerosComDDD = prospect.numeros.map((numero) => `${numero.ddd}${numero.numero}`);
                    return numerosComDDD.includes(String(numeroProcurado));
                });
                const nomeEncontrado = prospectEncontrado.nome;
                encontrados.push({ numero: numeroProcurado, nome: nomeEncontrado });
            } else {
                naoEncontrados.push(numeroProcurado);
            }
        }));

        await Promise.all(naoEncontrados.map(async (numero) => {
            const nomeEncontrado = await buscarNomeNoBeeceptor(numero);

            if (nomeEncontrado !== null) {
                console.log(`Número ${numero} - Nome: ${nomeEncontrado} - Não encontrado no IPBoX! Enviando...`);
                await enviarProspect(numero, nomeEncontrado);
            } else {
                console.log(`Número ${numero} não encontrado`);
            }
        }));
    } catch (error) {
        console.log(error);
    }
}

async function executeCode() {
    try {
        await main();
    } catch (error) {
        console.error('Erro durante a execução do código:', error);
    }
}

// Executar inicialmente e, em seguida, a cada 30 minutos
executeCode();
setInterval(executeCode, 1 * 60 * 1000); // 30 minutos em milissegundos
