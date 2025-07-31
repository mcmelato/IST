// Variáveis globais de estado do jogo
let playerGender = ''; // 'male' ou 'female'
let sexualHealthScore = 0; // Pontuação de Consciência Sexual
const lessonsLearned = new Set(); // Conjunto para armazenar lições únicas
let hasUsedCondomCorrectly = false; // Variável para rastrear uso de camisinha
let hasCommunicatedSTI = false; // Variável para rastrear comunicação de IST

const GENDER_DATA = {
    male: {
        characterName: 'Léo',
        pronounSubject: 'ele',
        pronounObject: 'o',
        pronounPossessive: 'dele',
        genderDescriptor: 'um jovem adulto',
        partnerName: 'Alana', // Parceira para Léo
        partnerPronounSubject: 'ela',
        partnerPronounObject: 'a',
        partnerGenderDescriptor: 'uma jovem adulta',
        empolgado: 'empolgado',
        levado: 'levado',
        paraCasaSozinho: 'sozinho',
        verboAcolherMedico: 'o acolhe',
        surpresoA: 'surpresa',
        reflexivoA: 'reflexivo',
        determinadoA: 'determinado',
        confianteA: 'confiante'
    },
    female: {
        characterName: 'Lia',
        pronounSubject: 'ela',
        pronounObject: 'a',
        pronounPossessive: 'dela',
        genderDescriptor: 'uma jovem adulta',
        partnerName: 'Alan', // Parceiro para Lia
        partnerPronounSubject: 'ele',
        partnerPronounObject: 'o',
        partnerGenderDescriptor: 'um jovem adulto',
        empolgado: 'empolgada',
        levado: 'levada',
        paraCasaSozinho: 'sozinha',
        verboAcolherMedico: 'a acolhe',
        surpresoA: 'surpreso',
        reflexivoA: 'reflexiva',
        determinadoA: 'determinada',
        confianteA: 'confiante'
    }
};

// Funções auxiliares para gerar texto dinâmico com base no gênero
function getPlayerName() { return GENDER_DATA[playerGender].characterName; }
function getPlayerPronounS() { return GENDER_DATA[playerGender].pronounSubject; }
function getPlayerPronounO() { return GENDER_DATA[playerGender].pronounObject; }
function getPlayerPronounP() { return GENDER_DATA[playerGender].pronounPossessive; } // Novo: Pronome possessivo

function getPartnerName() { return GENDER_DATA[playerGender].partnerName; }
function getPartnerPronounS() { return GENDER_DATA[playerGender].partnerPronounSubject; }
function getPartnerPronounO() { return GENDER_DATA[playerGender].partnerPronounObject; }
function getPartnerDescriptor() { return GENDER_DATA[playerGender].partnerGenderDescriptor; }

const scenes = {
    // Nova cena de introdução após a escolha de gênero, antes da "ação"
    char_intro: {
        narrative: "Você é [PERSONAGEM_NOME], [GENERO_DESCRITOR] que busca encontrar o equilíbrio entre a espontaneidade da juventude e a responsabilidade das escolhas que moldam sua vida adulta. [PLAYER_PRONOUN_S_CAPITAL] sempre [FOI_UM_SER_HUMANO] que valoriza conexões. Em sua vida social, [PLAYER_PRONOUN_S] tem sido muito [ABERTO_OU_ABERTA] a novas experiências, e isso [PLAYER_PRONOUN_O] trouxe a conhecer [PARCEIRO_NOME]. A atração entre vocês é palpável. Hoje, o encontro d[PLAYER_PRO_PARCEIRO]s [PARCEIRO_NOME] no café foi perfeito, e a ideia de estender a noite para a casa de um de vocês surge naturalmente, carregada de expectativa.",
        choices: [
            { text: "Sentir a adrenalina e aceitar o convite na hora. 'Com certeza! Vamos lá!'", nextScene: "cena_casa_sem_dialogo", scoreImpact: -15, lesson: "Agir impulsivamente sem considerar a segurança pode levar a riscos não intencionais." },
            { text: "Respirar fundo e sugerir uma conversa honesta. 'Adoraria, mas antes, podemos conversar sobre nossas expectativas e segurança?'", nextScene: "cena_dialogo_previo", scoreImpact: 20, lesson: "A comunicação clara e o estabelecimento de limites são pilares da saúde sexual." }
        ],
        feedback: null
    },
    cena_casa_sem_dialogo: {
        narrative: "No calor do momento e [LEVADO] pela emoção, você e [PARCEIRO_NOME] chegam em casa. O desejo é intenso. A conversa sobre métodos contraceptivos ou proteção é evitada, ou simplesmente não ocorre no turbilhão da paixão. A noite avança sem o uso de preservativo, sob a justificativa silenciosa da paixão.",
        choices: [
            { text: "Próximos dias...", nextScene: "cena_pos_sem_protecao" }
        ],
        feedback: {
            type: "warning",
            message: "A intimidade é poderosa, mas negligenciar a proteção é um risco considerável. Muitas ISTs não apresentam sintomas visíveis imediatamente, e confiar apenas na 'sensação' de segurança pode ter consequências sérias para a saúde de ambos."
        },
        scoreImpact: -15,
        lesson: "Relações desprotegidas aumentam significativamente os riscos de infecções sexualmente transmissíveis (ISTs)."
    },
    cena_dialogo_previo: {
        narrative: "Você decide que sua saúde e seus princípios são inegociáveis. Com um tom calmo, mas firme, você aborda [PARCEIRO_NOME]: '[PARCEIRO_NOME_CURTO], gostei muito da nossa conexão, e estou super à vontade com você. Mas acho importante a gente conversar sobre proteção e sobre o que cada um espera dessa noite, para que seja bom e seguro para os dois.' [PARCEIRO_NOME] [PARECE_OU_PARECEM] um pouco [SURPRESO_A] pela sua franqueza, mas [RECEPTIVO_OU_RECEPTIVA] e reflexiv[REFLEXIVOA].",
        choices: [
            { text: "Alana/Alan [FALAR]: 'Uau, [PERSONAGEM_NOME_CURTO], adorei sua atitude! Você está cert[CERTO_OU_CERTA]. Tenho preservativos aqui, ou podemos buscar se precisar.'", nextScene: "cena_com_protecao", scoreImpact: 25, lesson: "Parceiros(as) maduros(as) e respeitosos(as) valorizam a comunicação e a segurança sexual." },
            { text: "Alana/Alan [FALAR]: 'Ah, [PERSONAGEM_NOME_CURTO], mas não precisa disso, né? A gente se cuidava... Não se preocupe tanto.'", nextScene: "cena_resistencia_dialogo", scoreImpact: -10, lesson: "A pressão para ignorar a proteção é um sinal de alerta de falta de responsabilidade mútua." }
        ],
        feedback: {
            type: "info",
            message: "Sua iniciativa de conversar abertamente sobre sexo, proteção e consentimento é um sinal de maturidade, respeito e autocuidado. É a base para construir relacionamentos mais saudáveis e experiências mais seguras."
        }
    },
    cena_pos_sem_protecao: {
        narrative: "Uma semana depois, você começa a sentir um desconforto persistente e preocupante: uma ardência incômoda ao urinar e percebe um corrimento discreto. A ansiedade toma conta. Você se lembra que a relação com [PARCEIRO_NOME] foi sem proteção. A preocupação transforma-se em um medo palpável. O que você faz agora, diante desses sintomas claros?",
        choices: [
            { text: "Entrar em pânico e tentar ignorar. 'Talvez desapareça sozinho. Não quero que ninguém saiba.'", nextScene: "final_complicacao_grave", scoreImpact: -25, lesson: "Negligenciar sintomas de ISTs pode levar a sérias complicações de saúde a longo prazo." },
            { text: "Agir imediatamente: agendar uma consulta médica e fazer os exames necessários. 'Minha saúde é prioridade.'", nextScene: "cena_diagnostico_precoce", scoreImpact: 20, lesson: "Buscar ajuda médica rápida é crucial para o diagnóstico e tratamento eficaz de ISTs." }
        ],
        feedback: {
            type: "warning",
            message: "Sintomas após uma relação desprotegida são um alerta urgente e indicam a necessidade imediata de atenção médica. Ações rápidas são cruciais para o diagnóstico e tratamento eficazes das ISTs, evitando complicações futuras."
        }
    },
    cena_com_protecao: {
        narrative: "Com a comunicação estabelecida e o compromisso mútuo com a segurança, vocês prosseguem. O uso do preservativo é feito de forma correta e consciente, garantindo uma noite prazerosa e, acima de tudo, segura. Você se sente bem por ter garantido sua saúde e a d[PLAYER_PRO_PARCEIRO] [PARCEIRO_NOME], e a confiança entre vocês cresce. Alguns meses se passam, e você reflete sobre o autocuidado contínuo.",
        choices: [
            { text: "Mesmo sem sintomas, decidir fazer exames de rotina para ter certeza absoluta da sua saúde sexual.", nextScene: "cena_exames_rotina_pos_segura", scoreImpact: 10, lesson: "A testagem regular complementa o uso de preservativos, oferecendo uma camada extra de segurança e paz de espírito." },
            { text: "Continuar a vida, afinal, usaram preservativo e não houve sintomas. Não há necessidade de mais preocupação.", nextScene: "final_saude_aparentemente_segura", scoreImpact: 0, lesson: "Preservativos são altamente eficazes, mas a proteção não é absoluta para todas as ISTs, e a testagem é um pilar fundamental da prevenção." }
        ],
        feedback: {
            type: "success",
            message: "Sua decisão de dialogar e usar o preservativo corretamente é um exemplo de responsabilidade sexual. Você priorizou a segurança e o consentimento, construindo uma base sólida para relações íntimas saudáveis."
        }
    },
    cena_resistencia_dialogo: {
        narrative: "A resistência d[PLAYER_PRO_PARCEIRO] [PARCEIRO_NOME] em relação à proteção te deixa [REFLEXIVOA] e com um nó na garganta. [PARCEIRO_PRONOUN_S_CAPITAL] tenta te convencer de que não é necessário, usando argumentos como 'A gente se cuidava' ou 'Não sinto nada'. Você sente uma pressão sutil, mas a sua intuição grita 'cuidado'. O que você faz, diante de um possível desrespeito aos seus limites e à sua saúde?",
        choices: [
            { text: "Com firmeza, mas educação, decidir não prosseguir com o encontro íntimo e ir para casa. Sua saúde e seus limites vêm antes de tudo.", nextScene: "final_decisao_consciente", scoreImpact: 25, lesson: "Impor limites e priorizar sua saúde em face da pressão é um ato de grande auto-respeito." },
            { text: "Ceder à pressão, diminuir a preocupação e ir para casa com [PARCEIRO_NOME] sem proteção, na esperança de que [PARCEIRO_PRONOUN_S] esteja [CERTO_OU_CERTA].", nextScene: "cena_casa_sem_dialogo", scoreImpact: -20, lesson: "Ceder à pressão para sexo desprotegido coloca sua saúde em risco e compromete seus valores." }
        ],
        feedback: {
            type: "info",
            message: "É crucial reconhecer e respeitar seus próprios limites e priorizar sua saúde em todas as interações. Um(a) parceiro(a) que verdadeiramente se importa com você respeitará suas decisões e sua segurança, sem pressão ou julgamento."
        }
    },
    cena_diagnostico_precoce: {
        narrative: "Sua atitude proativa foi a melhor escolha! Na consulta, o médico [VERBO_ACOLHER_MEDICO] com empatia e, após exames, confirma o diagnóstico de Clamídia. A boa notícia é que, por ter procurado ajuda cedo, o tratamento é simples, com antibióticos, e eficaz. O médico te orienta detalhadamente sobre a importância crucial de comunicar [PARCEIRO_NOME] para que [PARCEIRO_PRONOUN_S] também se teste e trate, interrompendo a cadeia de transmissão e garantindo a saúde d[PLAYER_PRO_PARCEIRO]s envolvidos.",
        choices: [
            { text: "Assumir a responsabilidade: comunicar [PARCEIRO_NOME] sobre o diagnóstico, explicando a importância do teste e tratamento para ambos. 'É o certo a fazer.'", nextScene: "final_comunicacao_responsavel", scoreImpact: 20, lesson: "Comunicar parceiros(as) sobre ISTs é um ato de responsabilidade, cuidado e saúde pública." },
            { text: "Preferir não comunicar [PARCEIRO_NOME] para evitar constrangimento, conflito ou 'problemas'. 'Já estou me tratando, então está resolvido para mim.'", nextScene: "final_falta_comunicacao", scoreImpact: -15, lesson: "A omissão na comunicação de ISTs é irresponsável e perigosa para a saúde coletiva." }
        ],
        feedback: {
            type: "success",
            message: "Sua proatividade foi a chave para um tratamento eficaz! A detecção precoce de ISTs, mesmo com sintomas leves, é fundamental para sua cura e para evitar complicações maiores. Não hesite em buscar ajuda médica ao menor sinal."
        }
    },
    cena_exames_rotina_pos_segura: {
        narrative: "Mesmo após uma relação com proteção e sem sintomas, você teve a **sabedoria e responsabilidade** de fazer exames de rotina para ISTs. Essa atitude proativa é um pilar fundamental da saúde sexual. Os resultados mostram que está tudo bem, reforçando a paz de espírito e a importância de monitorar sua saúde continuamente. Você se sente [CONFIANTEA] e seguro(a) em suas decisões.",
        choices: [
            { text: "Fim da Aventura", nextScene: "final_saude_assegurada_total" }
        ],
        feedback: {
            type: "success",
            message: "A testagem regular para ISTs é recomendada para todas as pessoas sexualmente ativas, independentemente de sintomas ou do uso de preservativo. É a única forma de ter certeza do seu status, identificar infecções assintomáticas e buscar tratamento precoce, protegendo a si e a [PLAYER_PRO_PARCEIRO]s parceiros(as)."
        },
        scoreImpact: 15,
        lesson: "A testagem regular é um pilar essencial da prevenção e controle de ISTs, complementando o uso de preservativos."
    },
    final_complicacao_grave: {
        narrative: "Você ignorou os sintomas, e eles pioraram drasticamente, evoluindo para dor pélvica crônica e febre. A infecção se espalhou, causando complicações sérias que exigem um tratamento longo e complexo, com risco de sequelas permanentes, como infertilidade ou danos a outros órgãos. A negligência com a saúde sexual não é brincadeira e pode trazer consequências devastadoras e duradouras para sua qualidade de vida e bem-estar geral.",
        choices: [], // Final sem mais escolhas
        feedback: {
            type: "danger",
            message: "Ignorar sintomas de ISTs é extremamente perigoso e pode levar a complicações de saúde irreversíveis. Sempre procure um médico imediatamente ao menor sinal ou após qualquer relação desprotegida. Sua saúde é seu bem mais precioso e deve ser prioridade máxima."
        },
        scoreImpact: -40
    },
    final_saude_aparentemente_segura: {
        narrative: "Você continuou sua vida sem preocupações adicionais, confiando apenas no uso do preservativo naquela ocasião. No entanto, é importante lembrar que, embora altamente eficaz, nenhum método é 100% à prova de falhas. Além disso, algumas ISTs como HPV (que causa verrugas e pode levar a câncer) e Herpes (que causa feridas recorrentes) podem ser transmitidas por contato de pele a pele em áreas não cobertas pelo preservativo. Sem exames de rotina, você vive com uma 'segurança aparente', sem certeza absoluta do seu status de saúde sexual.",
        choices: [], // Final sem mais escolhas
        feedback: {
            type: "info",
            message: "Preservativos são excelentes, mas a proteção não é absoluta para todas as ISTs. A testagem regular e a comunicação contínua com parceiros(as) são fundamentais para manter a saúde sexual em dia e ter total tranquilidade, cobrindo as lacunas que o preservativo, sozinho, não pode preencher."
        },
        scoreImpact: -5
    },
    final_comunicacao_responsavel: {
        narrative: "Você teve a coragem e a maturidade de ter a difícil, mas crucial, conversa com [PARCEIRO_NOME]. [PARCEIRO_PRONOUN_S_CAPITAL] ficou [SURPRESO_A], mas, após [PLAYER_PRONOUN_P] explicações claras e empáticas, [PARCEIRO_PRONOUN_S] reconheceu a importância da sua atitude e se comprometeu a fazer os exames e iniciar o tratamento. Sua atitude responsável não só protegeu sua saúde, mas ajudou a quebrar a cadeia de transmissão e promoveu a conscientização e o cuidado d[PLAYER_PRO_PARCEIRO] [PARCEIRO_NOME]. Um verdadeiro ato de cidadania e respeito.",
        choices: [], // Final sem mais escolhas
        feedback: {
            type: "success",
            message: "Comunicar parceiros(as) sexuais sobre ISTs é um ato de responsabilidade, cuidado e saúde pública essencial. Você contribuiu para a saúde de [PARCEIRO_PRONOUN_O] [PARCEIRO_NOME] e para a saúde coletiva, evitando a disseminação e promovendo o tratamento precoce. Isso é saúde sexual em comunidade!"
        },
        scoreImpact: 20
    },
    final_falta_comunicacao: {
        narrative: "Você optou por não comunicar [PARCEIRO_NOME], com medo do constrangimento, de uma reação negativa ou de 'estragar' o relacionamento. Assim, [PARCEIRO_PRONOUN_S] continua vivendo sem saber que pode ter uma IST. Isso não só é uma irresponsabilidade grave com a saúde d[PLAYER_PRO_PARCEIRO] [PARCEIRO_NOME], que pode desenvolver complicações sérias e permanentes, mas também permite que [PARCEIRO_PRONOUN_S] possa, sem saber, transmitir a infecção para outras pessoas, criando um ciclo de risco e irresponsabilidade que afeta toda a comunidade. Sua escolha priorizou o conforto imediato em detrimento da saúde e da responsabilidade.",
        choices: [], // Final sem mais escolhas
        feedback: {
            type: "danger",
            message: "Não comunicar parceiros(as) sexuais sobre uma IST é uma falha grave na responsabilidade individual e de saúde pública. Isso impede que recebam tratamento, o que pode levar a complicações sérias para [PARCEIRO_PRONOUN_O] [PARCEIRO_NOME] e a disseminação da infecção para terceiros. A confidencialidade é importante, mas a responsabilidade com a saúde de outros é primordial e um dever cívico."
        },
        scoreImpact: -30
    },
    final_saude_assegurada_total: {
        narrative: "Sua jornada através de 'Entre Nós' demonstra um **alto nível de Consciência Sexual e responsabilidade exemplar**. Você priorizou o diálogo honesto, a prevenção proativa (com uso de preservativo e testagem regular) e agiu com responsabilidade e empatia em todas as etapas, garantindo uma vida sexual segura, informada, saudável e plena. Sua história é um exemplo inspirador de autocuidado, respeito mútuo e proatividade na promoção da saúde sexual, influenciando positivamente a si e a [PLAYER_PRO_PARCEIRO]s que [PLAYER_PRONOUN_S] se relaciona.",
        choices: [], // Final sem mais escolhas
        feedback: {
            type: "success",
            message: "Parabéns! Você alcançou o nível mais alto de Consciência Sexual. Continue praticando o diálogo, a prevenção e a testagem regular para manter sua saúde sexual sempre em dia. Seja um agente de mudança e inspire outros a seguir seu exemplo!"
        },
        scoreImpact: 0 // Pontos já foram somados ao longo do caminho
    },
    final_decisao_consciente: {
        narrative: "Você decide que sua saúde, seus princípios e seu bem-estar não são negociáveis. Com firmeza, mas respeito, você explica a [PARCEIRO_NOME] que só prosseguiria se houvesse um acordo claro sobre o uso de proteção e consentimento mútuo. Sem essa concordância, você opta por ir para casa [PARA_CASA_SOZINHO]. Pode ter sido um momento de tensão ou frustração, mas você se sente em paz com sua decisão, sabendo que se protegeu de um risco desnecessário e defendeu seus valores de autocuidado e respeito. Você demonstrou uma grande força interior.",
        choices: [], // Final sem mais escolhas
        feedback: {
            type: "success",
            message: "Ter limites claros e se recusar a ceder à pressão é um ato de coragem e amor-próprio imenso. Sua saúde sexual é sua responsabilidade principal. Não se coloque em risco por ninguém! Você demonstrou maturidade, inteligência emocional e um forte senso de autovalorização."
        },
        scoreImpact: 0 // Pontos já foram somados
    }
};

// Referências aos elementos HTML
const openingScreen = document.getElementById('opening-screen'); // Nova tela de abertura
const startJourneyButton = document.getElementById('start-journey-button'); // Botão para iniciar
const genderSelectionScreen = document.getElementById('gender-selection-screen');
const gameMain = document.getElementById('game-main');
const resultsScreen = document.getElementById('results-screen');

const genderMaleButton = document.getElementById('gender-male');
const genderFemaleButton = document.getElementById('gender-female');
const storyTextElement = document.getElementById('story-text');
const choiceButtonsContainer = document.getElementById('choice-buttons-container');
const feedbackMessageElement = document.getElementById('feedback-message');
const restartGameButton = document.getElementById('restart-game-button');
const finalScoreElement = document.getElementById('final-score');
const resultMessageElement = document.getElementById('result-message');
const lessonsLearnedList = document.getElementById('lessons-learned');


// Função para preencher o texto da narrativa com base no gênero
function formatNarrative(text) {
    if (!playerGender || !GENDER_DATA[playerGender]) {
        // Se o gênero ainda não foi escolhido, apenas preenche o que pode
        let tempText = text;
        tempText = tempText.replace(/\[PERSONAGEM_NOME\]/g, 'um(a) personagem'); // Genérico para a tela de gênero
        // Remover outros placeholders que dependem do gênero para a tela de introdução
        // ou garantir que o HTML inicial seja genérico.
        return tempText;
    }

    let formattedText = text;
    const data = GENDER_DATA[playerGender];

    // Substituições de nomes e pronomes
    formattedText = formattedText.replace(/\[PERSONAGEM_NOME\]/g, data.characterName);
    formattedText = formattedText.replace(/\[PLAYER_PRONOUN_S\]/g, data.pronounSubject);
    formattedText = formattedText.replace(/\[PLAYER_PRONOUN_S_CAPITAL\]/g, data.pronounSubject.charAt(0).toUpperCase() + data.pronounSubject.slice(1));
    formattedText = formattedText.replace(/\[PLAYER_PRONOUN_O\]/g, data.pronounObject);
    formattedText = formattedText.replace(/\[PLAYER_PRONOUN_P\]/g, data.pronounPossessive);
    formattedText = formattedText.replace(/\[GENERO_DESCRITOR\]/g, data.genderDescriptor);
    formattedText = formattedText.replace(/\[FOI_UM_SER_HUMANO\]/g, playerGender === 'male' ? 'foi um ser humano' : 'foi uma ser humana'); // Ajuste para gênero

    formattedText = formattedText.replace(/\[PARCEIRO_NOME\]/g, data.partnerName);
    formattedText = formattedText.replace(/\[PARCEIRO_GENERO_DESCRITOR\]/g, data.partnerGenderDescriptor);
    formattedText = formattedText.replace(/\[PARCEIRO_PRONOUN_S\]/g, data.partnerPronounSubject);
    formattedText = formattedText.replace(/\[PARCEIRO_PRONOUN_S_CAPITAL\]/g, data.partnerPronounSubject.charAt(0).toUpperCase() + data.partnerPronounSubject.slice(1));
    formattedText = formattedText.replace(/\[PARCEIRO_PRONOUN_O\]/g, data.partnerPronounObject);

    // Substituições de concordância verbal e adjetivos
    formattedText = formattedText.replace(/\[EMPOLGADO\]/g, data.empolgado);
    formattedText = formattedText.replace(/\[LEVADO\]/g, data.levado);
    formattedText = formattedText.replace(/\[PARA_CASA_SOZINHO\]/g, data.paraCasaSozinho);
    formattedText = formattedText.replace(/\[VERBO_ACOLHER_MEDICO\]/g, data.verboAcolherMedico);
    formattedText = formattedText.replace(/\[SURPRESO_A\]/g, data.surpresoA);
    formattedText = formattedText.replace(/\[PLAYER_PRO_PARCEIRO\]/g, playerGender === 'male' ? 'a' : 'o'); // "a" parceira ou "o" parceiro
    formattedText = formattedText.replace(/\[PARECE_OU_PARECEM\]/g, data.partnerName.includes('a') ? 'parece' : 'parece');
    formattedText = formattedText.replace(/\[RECEPTIVO_OU_RECEPTIVA\]/g, data.partnerName.includes('a') ? 'receptiva' : 'receptivo');
    formattedText = formattedText.replace(/\[REFLEXIVOA\]/g, data.reflexivoA);
    formattedText = formattedText.replace(/\[FALAR\]/g, 'fala');
    formattedText = formattedText.replace(/\[CERTO_OU_CERTA\]/g, data.partnerName.includes('a') ? 'certa' : 'certo');
    formattedText = formattedText.replace(/\[PERSONAGEM_NOME_CURTO\]/g, data.characterName.split(' ')[0]); // Pega só o primeiro nome
    formattedText = formattedText.replace(/\[ABERTO_OU_ABERTA\]/g, playerGender === 'male' ? 'aberto' : 'aberta');
    formattedText = formattedText.replace(/\[CONFIANTEA\]/g, data.confianteA);


    return formattedText;
}

function loadScene(sceneId) {
    // Esconde todas as telas e limpa feedback
    openingScreen.classList.add('hidden');
    genderSelectionScreen.classList.add('hidden');
    gameMain.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    feedbackMessageElement.classList.add('hidden');
    feedbackMessageElement.textContent = '';

    const scene = scenes[sceneId];

    // Se a cena não existe (erro ou final inválido), vai para o resultado ou intro
    if (!scene) {
        console.error("Cena não encontrada:", sceneId);
        showResults(); // Ou loadScene('intro'); para reiniciar
        return;
    }

    currentSceneId = sceneId;

    // Adiciona o impacto na pontuação de saúde sexual
    if (scene.scoreImpact !== undefined) {
        sexualHealthScore += scene.scoreImpact;
    }
    // Adiciona a lição aprendida (se houver e não for duplicada)
    if (scene.lesson) {
        lessonsLearned.add(scene.lesson);
    }

    // Atualiza o texto da narrativa
    storyTextElement.textContent = formatNarrative(scene.narrative);

    // Limpa e cria os botões de escolha
    choiceButtonsContainer.innerHTML = '';
    if (scene.choices && scene.choices.length > 0) {
        gameMain.classList.remove('hidden'); // Mostra a tela principal do jogo
        scene.choices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = formatNarrative(choice.text);
            button.addEventListener('click', () => loadScene(choice.nextScene));
            choiceButtonsContainer.appendChild(button);
        });
    } else {
        // Se não houver escolhas, é um final da história, mostra os resultados
        showResults();
    }

    // Adiciona o feedback se existir
    if (scene.feedback) {
        feedbackMessageElement.textContent = scene.feedback.message;
        feedbackMessageElement.className = `feedback-info feedback-${scene.feedback.type}`;
        feedbackMessageElement.classList.remove('hidden');
    }
}

function showResults() {
    gameMain.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    finalScoreElement.textContent = `Sua Pontuação de Consciência Sexual: ${sexualHealthScore} pontos.`;

    let resultMsg = '';
    if (sexualHealthScore >= 60) {
        resultMsg = "Você demonstrou uma **excelente Consciência Sexual**! Suas escolhas refletem responsabilidade, comunicação e proatividade na prevenção de ISTs e na gestão de relacionamentos. Parabéns por ser um exemplo de autocuidado e respeito mútuo!";
    } else if (sexualHealthScore >= 20) {
        resultMsg = "Sua **Consciência Sexual está em desenvolvimento**. Houve momentos de acerto, mas também oportunidades de aprimoramento. Lembre-se que a saúde sexual é uma jornada contínua de aprendizado e responsabilidade. Continue buscando informações e priorizando seu bem-estar!";
    } else {
        resultMsg = "Sua **Consciência Sexual precisa de mais atenção**. Suas escolhas apresentaram riscos significativos e falta de comunicação em momentos cruciais. É fundamental refletir sobre a importância da prevenção, testagem e diálogo aberto. Sua saúde é valiosa!";
    }
    resultMessageElement.innerHTML = resultMsg;

    lessonsLearnedList.innerHTML = '';
    if (lessonsLearned.size > 0) {
        lessonsLearned.forEach(lesson => {
            const li = document.createElement('li');
            li.textContent = lesson;
            lessonsLearnedList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = "Nenhuma lição específica registrada nesta jornada, mas o aprendizado é contínuo!";
        lessonsLearnedList.appendChild(li);
    }
}

// Funções para lidar com as transições de tela e escolha de gênero
function startJourney() {
    openingScreen.classList.add('hidden');
    genderSelectionScreen.classList.remove('hidden');

    // Preenche o texto da tela de seleção de gênero com um nome genérico antes da escolha
    document.querySelector('#gender-selection-screen .narrative-paragraph').innerHTML = formatNarrative(document.querySelector('#gender-selection-screen .narrative-paragraph').innerHTML);
}

function selectGender(gender) {
    playerGender = gender;
    // Resetar pontuação e lições ao iniciar um novo jogo
    sexualHealthScore = 0;
    lessonsLearned.clear();
    hasUsedCondomCorrectly = false;
    hasCommunicatedSTI = false;

    genderSelectionScreen.classList.add('hidden'); // Esconde a tela de seleção de gênero
    loadScene('char_intro'); // Inicia a história com a nova cena de introdução do personagem
}

// Event Listeners
startJourneyButton.addEventListener('click', startJourney);
genderMaleButton.addEventListener('click', () => selectGender('male'));
genderFemaleButton.addEventListener('click', () => selectGender('female'));

restartGameButton.addEventListener('click', () => {
    // Reseta o jogo para a tela de abertura inicial
    gameMain.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    openingScreen.classList.remove('hidden');
    currentSceneId = ''; // Reseta a cena atual
    // A função selectGender() cuidará de resetar as variáveis do jogo ao recomeçar a jornada
});

// Iniciar o jogo mostrando a tela de abertura
document.addEventListener('DOMContentLoaded', () => {
    openingScreen.classList.remove('hidden');
});