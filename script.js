// Variáveis globais de estado do jogo
let playerGender = '';
let sexualHealthScore = 50; // Começa com uma pontuação base para maior dinamismo
let relationshipTrust = 50; // Confiança no relacionamento (0-100)
let emotionalWellbeing = 50; // Bem-estar emocional do protagonista (0-100)
const lessonsLearned = new Set(); // Conjunto para armazenar lições únicas
let currentSceneId = ''; // Para rastrear a cena atual

// Traços de personalidade do parceiro (poderiam ser aleatórios no início)
let partnerIsReserved = false; // Influencia como reagem a certas conversas
let partnerIsAnxious = false; // Influencia reações a ISTs

// Referências aos elementos HTML
const openingScreen = document.getElementById('opening-screen');
const startJourneyButton = document.getElementById('start-journey-button');
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

// Novos displays de status
const conscienceDisplay = document.getElementById('conscience-display');
const trustDisplay = document.getElementById('trust-display');
const wellbeingDisplay = document.getElementById('wellbeing-display');

const GENDER_DATA = {
    male: {
        characterName: 'Léo',
        pronounSubject: 'ele',
        pronounObject: 'o', // objeto direto (ex: "o trouxe")
        pronounPossessive: 'dele',
        genderDescriptor: 'um jovem adulto',
        partnerName: 'Alana', // Parceira para Léo
        partnerPronounSubject: 'ela',
        partnerPronounObject: 'a', // objeto direto (ex: "a acolhe")
        partnerPronounPersonal: 'ela', // para "com ela", "para ela"
        partnerGenderDescriptor: 'uma jovem adulta',
        // Adjetivos e verbos que concordam com o jogador (masculino)
        empolgado: 'empolgado',
        levado: 'levado',
        paraCasaSozinho: 'sozinho',
        reflexivoA: 'reflexivo',
        determinadoA: 'determinado',
        confianteA: 'confiante',
        abertoA: 'aberto',
        playerConfusoA: 'confuso', // para o jogador
        playerSentidoA: 'sentido', // para o jogador
        playerAliviadoA: 'aliviado', // para o jogador
        // Adjetivos e verbos que concordam com a parceira (feminino)
        verboAcolherMedico: 'o acolhe', // médico acolhe Léo
        surpresoA_partner: 'surpresa',
        receptivoA_partner: 'receptiva',
        certoA_partner: 'certa',
        apoiadorA_partner: 'apoiadora',
        cuidadosoA_partner: 'cuidadosa',
        // Artigos e preposições + artigos para o PARCEIRO
        artigoParceiro: 'a', // "a Alana"
        prepArtigoParceiro: 'da', // "da Alana"
        artigoIndefinidoParceiro: 'uma', // "uma apoiadora"
        // Concordância de verbos para o PARCEIRO
        parceiroConhece: 'conhece', // para "Alana conhece"
        parceiroSabe: 'sabe' // para "Alana sabe"
    },
    female: {
        characterName: 'Lia',
        pronounSubject: 'ela',
        pronounObject: 'a', // objeto direto (ex: "a trouxe")
        pronounPossessive: 'dela',
        genderDescriptor: 'uma jovem adulta',
        partnerName: 'Alan', // Parceiro para Lia
        partnerPronounSubject: 'ele',
        partnerPronounObject: 'o', // objeto direto (ex: "o acolhe")
        partnerPronounPersonal: 'ele', // para "com ele", "para ele"
        partnerGenderDescriptor: 'um jovem adulto',
        // Adjetivos e verbos que concordam com o jogador (feminino)
        empolgado: 'empolgada',
        levado: 'levada',
        paraCasaSozinho: 'sozinha',
        reflexivoA: 'reflexiva',
        determinadoA: 'determinada',
        confianteA: 'confiante',
        abertoA: 'aberta',
        playerConfusoA: 'confusa', // para o jogador
        playerSentidoA: 'sentida', // para o jogador
        playerAliviadoA: 'aliviada', // para o jogador
        // Adjetivos e verbos que concordam com o parceiro (masculino)
        verboAcolherMedico: 'a acolhe', // médico acolhe Lia
        surpresoA_partner: 'surpreso',
        receptivoA_partner: 'receptivo',
        certoA_partner: 'certo',
        apoiadorA_partner: 'apoiador',
        cuidadosoA_partner: 'cuidadoso',
        // Artigos e preposições + artigos para o PARCEIRO
        artigoParceiro: 'o', // "o Alan"
        prepArtigoParceiro: 'do', // "do Alan"
        artigoIndefinidoParceiro: 'um', // "um apoiador"
        // Concordância de verbos para o PARCEIRO
        parceiroConhece: 'conhece', // para "Alan conhece"
        parceiroSabe: 'sabe' // para "Alan sabe"
    }
};

// Função para preencher o texto da narrativa com base no gênero
function formatNarrative(text) {
    if (!playerGender || !GENDER_DATA[playerGender]) {
        // Para as telas iniciais antes da escolha de gênero
        return text
            .replace(/\[PERSONAGEM_NOME\]/g, 'um(a) personagem')
            .replace(/\[PLAYER_PRONOUN_S\]/g, 'ele/ela')
            .replace(/\[GENERO_DESCRITOR\]/g, 'um(a) jovem adulto(a)')
            .replace(/\[ARTIGO_PARCEIRO\]/g, 'o(a)')
            .replace(/\[PREP_ARTIGO_PARCEIRO\]/g, 'do(a)')
            .replace(/\[ARTIGO_INDEFINIDO_PARCEIRO\]/g, 'um(a)')
            .replace(/\[PLAYER_CONFUSOA\]/g, 'confuso(a)')
            .replace(/\[PLAYER_SENTIDOA\]/g, 'sentido(a)')
            .replace(/\[PLAYER_ALIVIADOA\]/g, 'aliviado(a)')
            .replace(/\[PARCEIRO_PRONOUN_PESSOAL\]/g, 'ele/ela');
    }

    let formattedText = text;
    const data = GENDER_DATA[playerGender];

    // --- Substituições de Nomes e Pronomes (Jogador e Parceiro) ---
    formattedText = formattedText.replace(/\[PERSONAGEM_NOME\]/g, data.characterName);
    formattedText = formattedText.replace(/\[PERSONAGEM_NOME_CURTO\]/g, data.characterName.split(' ')[0]);
    formattedText = formattedText.replace(/\[PLAYER_PRONOUN_S\]/g, data.pronounSubject);
    formattedText = formattedText.replace(/\[PLAYER_PRONOUN_S_CAPITAL\]/g, data.pronounSubject.charAt(0).toUpperCase() + data.pronounSubject.slice(1));
    // CORREÇÃO: Removido .Text daqui
    formattedText = formattedText.replace(/\[PLAYER_PRONOUN_O\]/g, data.pronounObject);
    formattedText = formattedText.replace(/\[PLAYER_PRONOUN_P\]/g, data.pronounPossessive);
    formattedText = formattedText.replace(/\[GENERO_DESCRITOR\]/g, data.genderDescriptor);

    formattedText = formattedText.replace(/\[PARCEIRO_NOME\]/g, data.partnerName);
    formattedText = formattedText.replace(/\[PARCEIRO_NOME_CURTO\]/g, data.partnerName.split(' ')[0]);
    formattedText = formattedText.replace(/\[PARCEIRO_GENERO_DESCRITOR\]/g, data.partnerGenderDescriptor);
    formattedText = formattedText.replace(/\[PARCEIRO_PRONOUN_S\]/g, data.partnerPronounSubject);
    formattedText = formattedText.replace(/\[PARCEIRO_PRONOUN_S_CAPITAL\]/g, data.partnerPronounSubject.charAt(0).toUpperCase() + data.partnerPronounSubject.slice(1));
    formattedText = formattedText.replace(/\[PARCEIRO_PRONOUN_O\]/g, data.partnerPronounObject);
    formattedText = formattedText.replace(/\[PARCEIRO_PRONOUN_PESSOAL\]/g, data.partnerPronounPersonal);

    // --- Substituições de Concordância (Adjetivos, Artigos, Preposições, Verbos) ---

    // Adjetivos do jogador
    formattedText = formattedText.replace(/\[FOI_UM_SER_HUMANO\]/g, playerGender === 'male' ? 'foi um ser humano' : 'foi uma ser humana');
    formattedText = formattedText.replace(/\[EMPOLGADO\]/g, data.empolgado);
    formattedText = formattedText.replace(/\[LEVADO\]/g, data.levado);
    formattedText = formattedText.replace(/\[PARA_CASA_SOZINHO\]/g, data.paraCasaSozinho);
    formattedText = formattedText.replace(/\[REFLEXIVOA\]/g, data.reflexivoA);
    formattedText = formattedText.replace(/\[DETERMINADOA\]/g, data.determinadoA);
    formattedText = formattedText.replace(/\[CONFIANTEA\]/g, data.confianteA);
    formattedText = formattedText.replace(/\[ABERTO_OU_ABERTA\]/g, data.abertoA);
    formattedText = formattedText.replace(/\[PLAYER_CONFUSOA\]/g, data.playerConfusoA);
    formattedText = formattedText.replace(/\[PLAYER_SENTIDOA\]/g, data.playerSentidoA);
    formattedText = formattedText.replace(/\[PLAYER_ALIVIADOA\]/g, data.playerAliviadoA);

    // Adjetivos e verbos do parceiro (ou que concordam com o parceiro)
    formattedText = formattedText.replace(/\[VERBO_ACOLHER_MEDICO\]/g, data.verboAcolherMedico); // Médico acolhe o jogador
    formattedText = formattedText.replace(/\[SURPRESO_A_PARCEIRO\]/g, data.surpresoA_partner);
    formattedText = formattedText.replace(/\[RECEPTIVO_OU_RECEPTIVA\]/g, data.receptivoA_partner);
    formattedText = formattedText.replace(/\[CERTO_OU_CERTA_PARCEIRO\]/g, data.certoA_partner);
    formattedText = formattedText.replace(/\[APOIADOR_A\]/g, data.apoiadorA_partner);
    formattedText = formattedText.replace(/\[CUIDADOSO_A\]/g, data.cuidadosoA_partner);
    formattedText = formattedText.replace(/\[PARECE_OU_PARECEM\]/g, 'parece'); // "Parece" não varia com gênero do sujeito

    formattedText = formattedText.replace(/\[PARCEIRO_CONHECE\]/g, data.parceiroConhece);
    formattedText = formattedText.replace(/\[PARCEIRO_SABE\]/g, data.parceiroSabe);


    // Artigos e preposições + artigos (para o parceiro ou em geral)
    // Ordem importa: substituir os mais longos/específicos primeiro
    formattedText = formattedText.replace(/\[PREP_ARTIGO_PARCEIRO\]/g, data.prepArtigoParceiro); // ex: da / do
    formattedText = formattedText.replace(/\[ARTIGO_PARCEIRO\]/g, data.artigoParceiro); // ex: a / o
    formattedText = formattedText.replace(/\[ARTIGO_INDEFINIDO_PARCEIRO\]/g, data.artigoIndefinidoParceiro); // ex: uma / um


    // Pronome possessivo do parceiro (dela/dele) - Esta regex está um pouco estranha, vou ajustar
    // Se a intenção era d[PLAYER_PRO_PARCEIRO]s para "dos/das" e [PLAYER_PRO_PARCEIRO] para "do/da"
    // Isso deve ser [PREP_ARTIGO_PARCEIRO] que já está sendo usado acima.
    // Vou comentar essas linhas, pois [PREP_ARTIGO_PARCEIRO] e [ARTIGO_PARCEIRO] já cobrem isso.
    // formattedText = formattedText.replace(/d\[PLAYER_PRO_PARCEIRO\]s/g, `d${data.proParceiro}s`);
    // formattedText = formattedText.replace(/\[PLAYER_PRO_PARCEIRO\]/g, data.proParceiro);


    // Regex para casos gerais com (a) ou (o) - capturam apenas o caractere final para substituição
    formattedText = formattedText.replace(/([oO])\(a\)/g, (match, p1) => {
        return playerGender === 'male' ? p1 : (p1 === 'o' ? 'a' : 'A');
    });
    formattedText = formattedText.replace(/([dD][oO])\(a\)/g, (match, p1) => {
        return playerGender === 'male' ? p1 : (p1 === 'do' ? 'da' : 'Da');
    });
    formattedText = formattedText.replace(/([aA][oO])\(à\)/g, (match, p1) => {
        return playerGender === 'male' ? p1 : (p1 === 'ao' ? 'à' : 'À');
    });
    formattedText = formattedText.replace(/([uU]m)\(a\)/g, (match, p1) => {
        return playerGender === 'male' ? p1 : (p1 === 'um' ? 'uma' : 'Uma');
    });

    // Regex para plurais (o(a)s, do(a)s, ao(a)s)
    formattedText = formattedText.replace(/([oO])\(a\)s/g, (match, p1) => {
        return playerGender === 'male' ? `${p1}s` : (p1 === 'o' ? 'as' : 'As');
    });
    formattedText = formattedText.replace(/([dD][oO])\(a\)s/g, (match, p1) => {
        return playerGender === 'male' ? `${p1}s` : (p1 === 'do' ? 'das' : 'Das');
    });
    formattedText = formattedText.replace(/([aA][oO])\(à\)s/g, (match, p1) => {
        return playerGender === 'male' ? `${p1}s` : (p1 === 'ao' ? 'às' : 'Às');
    });


    // Correção específica para "para que o" / "para que a"
    // CORREÇÃO: Removido .Text daqui
    formattedText = formattedText.replace(/([Pp]ara que )([oO])(\s+)/g, (match, p1, p2, p3) => {
        // Esta substituição estava usando 'data.proParceiro', que não existe.
        // O correto seria usar o artigo (o/a) dependendo do playerGender
        // ou, se a intenção é "para que o/a [PARCEIRO_NOME]", já está coberto
        // por [ARTIGO_PARCEIRO] ou [PREP_ARTIGO_PARCEIRO].
        // Se a intenção é simplesmente 'o' ou 'a', basta a regex anterior.
        // Vou assumir que essa regex específica pode ser simplificada ou removida se já coberta.
        // Para agora, vou usar 'data.partnerPronounObject' que é 'o' ou 'a'.
        return `${p1}${data.partnerPronounObject}${p3}`;
    });
    // E para "para [PARCEIRO_PRONOUN_PESSOAL]" (ex: "para ele", "para ela")
    formattedText = formattedText.replace(/para \[PARCEIRO_PRONOUN_PESSOAL\]/g, `para ${data.partnerPronounPersonal}`);


    return formattedText;
}

// --- Definição das Cenas do Jogo ---
const scenes = {
    char_intro: {
        narrative: "Você é [PERSONAGEM_NOME], [GENERO_DESCRITOR] que busca encontrar o equilíbrio entre a espontaneidade da juventude e a responsabilidade das escolhas que moldam sua vida adulta. [PLAYER_PRONOUN_S_CAPITAL] sempre [FOI_UM_SER_HUMANO] que valoriza conexões autênticas. Em sua vida social, [PLAYER_PRONOUN_S] tem sido muito [ABERTO_OU_ABERTA] a novas experiências, e isso [PLAYER_PRONOUN_O] trouxe a conhecer [PARCEIRO_NOME]. A atração entre vocês é palpável, um misto de curiosidade e desejo. Hoje, o encontro d[PREP_ARTIGO_PARCEIRO] [PARCEIRO_NOME] no café foi perfeito, risadas soltas e olhares que se cruzam. A ideia de estender a noite para a casa d[ARTIGO_PARCEIRO] [PARCEIRO_NOME] surge naturalmente, carregada de expectativa e uma leve ansiedade. Você sente o coração acelerar.",
        choices: [
            { text: "Sentir a adrenalina e aceitar o convite na hora. 'Com certeza! Vamos lá!'", nextScene: "cena_casa_sem_dialogo", scoreImpact: { hs: -15, rt: -10, ew: 5 }, lesson: "Agir impulsivamente pode trazer riscos. A segurança deve vir antes da pressa." },
            { text: "Respirar fundo e sugerir uma conversa honesta. 'Adoraria, mas antes, podemos conversar sobre nossas expectativas e segurança?'", nextScene: "cena_dialogo_previo", scoreImpact: { hs: 20, rt: 15, ew: 10 }, lesson: "O diálogo aberto é a base de relacionamentos saudáveis e seguros, fortalecendo a confiança." }
        ],
        feedback: null
    },
    cena_casa_sem_dialogo: {
        narrative: "No calor do momento e [LEVADO] pela emoção, você e [PARCEIRO_NOME] chegam em casa. O desejo é intenso, as palavras parecem desnecessárias. A conversa sobre métodos contraceptivos ou proteção é evitada, ou simplesmente não ocorre no turbilhão da paixão. A noite avança sem o uso de preservativo, sob a justificativa silenciosa de que 'está tudo bem' ou 'não vai acontecer nada'. Você sente um leve receio, mas a paixão prevalece.",
        choices: [
            { text: "Próximos dias...", nextScene: "cena_pos_sem_protecao" }
        ],
        feedback: {
            type: "warning",
            message: "A espontaneidade na intimidade é natural, mas negligenciar a proteção é um risco considerável. Muitas ISTs são assintomáticas, e confiar apenas na 'aparência' de saúde ou na sorte pode ter consequências sérias e duradouras para a saúde de ambos. A paixão não anula a responsabilidade."
        },
        scoreImpact: { hs: -20, rt: -15, ew: -10 },
        lesson: "Relações desprotegidas aumentam significativamente os riscos de infecções sexualmente transmissíveis (ISTs)."
    },
    cena_dialogo_previo: {
        narrative: "Você decide que sua saúde e seus princípios são inegociáveis. Com um tom calmo, mas firme, você aborda [PARCEIRO_NOME]: '[PARCEIRO_NOME_CURTO], gostei muito da nossa conexão, e estou super à vontade com você. Mas acho importante a gente conversar sobre proteção e sobre o que cada um espera dessa noite, para que seja bom e seguro para os dois.' [PARCEIRO_NOME] [PARECE_OU_PARECEM] um pouco [SURPRESO_A_PARCEIRO] pela sua franqueza, mas demonstra estar [RECEPTIVO_OU_RECEPTIVA] e [REFLEXIVOA].",
        choices: [
            { text: "[PARCEIRO_NOME_CURTO] fala: 'Uau, [PERSONAGEM_NOME_CURTO], adorei sua atitude! Você está cert[CERTO_OU_CERTA_PARCEIRO]. Tenho preservativos aqui, ou podemos buscar se precisar.'", nextScene: "cena_com_protecao", scoreImpact: { hs: 25, rt: 20, ew: 15 }, lesson: "Parceiros(as) maduros(as) e respeitosos(as) valorizam a comunicação aberta e a segurança sexual mútua." },
            { text: "[PARCEIRO_NOME_CURTO] fala: 'Ah, [PERSONAGEM_NOME_CURTO], mas não precisa disso, né? A gente se cuidava... Não se preocupe tanto.'", nextScene: "cena_resistencia_dialogo", scoreImpact: { hs: -10, rt: -10, ew: -5 }, lesson: "A pressão para ignorar a proteção é um sinal de alerta sobre a responsabilidade d[PREP_ARTIGO_PARCEIRO] parceiro(a)." }
        ],
        feedback: {
            type: "info",
            message: "Sua iniciativa de conversar abertamente sobre sexo, proteção e consentimento é um sinal de maturidade, respeito e autocuidado. Isso não só protege sua saúde, mas também fortalece a confiança e o respeito mútuo, construindo uma base sólida para qualquer relacionamento."
        }
    },
    cena_pos_sem_protecao: {
        narrative: "Uma semana depois, a ansiedade se torna realidade. Você começa a sentir um desconforto persistente: ardência ao urinar e percebe um corrimento discreto. A preocupação e o arrependimento surgem com força, lembrando da noite com [PARCEIRO_NOME] sem proteção. O medo de ter contraído uma IST toma conta. Você se sente [PLAYER_CONFUSOA] e vulnerável. O que você faz agora, diante desses sintomas claros e alarmantes?",
        choices: [
            { text: "Entrar em pânico e tentar ignorar. 'Talvez desapareça sozinho. Não quero que ninguém saiba.'", nextScene: "final_complicacao_grave", scoreImpact: { hs: -30, rt: -10, ew: -20 }, lesson: "Ignorar sintomas de ISTs pode levar a sérias complicações de saúde a longo prazo e aumentar o sofrimento." },
            { text: "Agir imediatamente: agendar uma consulta médica e fazer os exames necessários. 'Minha saúde é prioridade.'", nextScene: "cena_diagnostico_precoce", scoreImpact: { hs: 25, rt: 5, ew: 15 }, lesson: "Buscar ajuda médica rápida é crucial para o diagnóstico e tratamento eficaz de ISTs, evitando complicações." }
        ],
        feedback: {
            type: "warning",
            message: "Sintomas após uma relação desprotegida são um alerta urgente. Nunca os ignore! O diagnóstico e tratamento precoces são fundamentais para evitar complicações maiores, proteger sua saúde a longo prazo e interromper a cadeia de transmissão."
        }
    },
    cena_com_protecao: {
        narrative: "Com a comunicação estabelecida e o compromisso mútuo com a segurança, vocês prosseguem. O uso do preservativo é feito de forma correta e consciente, garantindo uma noite prazerosa e, acima de tudo, segura. Você se sente bem por ter garantido sua saúde e a d[PREP_ARTIGO_PARCEIRO] [PARCEIRO_NOME], e a confiança entre vocês cresce exponencialmente. Alguns meses se passam, e você reflete sobre a continuidade do autocuidado e a prevenção.",
        choices: [
            { text: "Mesmo sem sintomas, decidir fazer exames de rotina para ter certeza absoluta da sua saúde sexual. 'É melhor prevenir do que remediar.'", nextScene: "cena_exames_rotina_pos_segura", scoreImpact: { hs: 15, rt: 5, ew: 10 }, lesson: "A testagem regular complementa o uso de preservativos, oferecendo uma camada extra de segurança e paz de espírito inestimáveis." },
            { text: "Continuar a vida, afinal, usaram preservativo e não houve sintomas. 'Não há necessidade de mais preocupação, estamos bem.'", nextScene: "final_saude_aparentemente_segura", scoreImpact: { hs: 0, rt: 0, ew: -5 }, lesson: "Preservativos são altamente eficazes, mas a proteção não é absoluta para todas as ISTs. A testagem é um pilar fundamental da prevenção." }
        ],
        feedback: {
            type: "success",
            message: "Sua decisão de dialogar e usar o preservativo corretamente é um exemplo de responsabilidade sexual e autocuidado. Você priorizou a segurança e o consentimento, construindo uma base sólida para relações íntimas saudáveis e recíprocas."
        }
    },
    cena_resistencia_dialogo: {
        narrative: "A resistência d[PREP_ARTIGO_PARCEIRO] [PARCEIRO_NOME] em relação à proteção te deixa [REFLEXIVOA] e com um nó na garganta. [PARCEIRO_PRONOUN_S_CAPITAL] tenta te convencer de que não é necessário, usando argumentos como 'A gente se cuidava...' ou 'Não sinto nada.' Você sente uma pressão sutil, mas a sua intuição grita 'cuidado'. A confiança em [PARCEIRO_NOME] é abalada. O que você faz, diante de um possível desrespeito aos seus limites e à sua saúde?",
        choices: [
            { text: "Com firmeza, mas educação, decidir não prosseguir com o encontro íntimo e ir para casa. 'Minha saúde e meus limites vêm antes de tudo.'", nextScene: "final_decisao_consciente", scoreImpact: { hs: 30, rt: -5, ew: 20 }, lesson: "Impor limites e priorizar sua saúde em face da pressão é um ato de grande auto-respeito e inteligência emocional." },
            { text: "Ceder à pressão, diminuir a preocupação e ir para casa com [PARCEIRO_NOME] sem proteção, na esperança de que [PARCEIRO_PRONOUN_S] esteja cert[CERTO_OU_CERTA_PARCEIRO].", nextScene: "cena_casa_sem_dialogo_ceder_pressao", scoreImpact: { hs: -25, rt: -20, ew: -15 }, lesson: "Ceder à pressão para sexo desprotegido coloca sua saúde em risco e compromete seus valores pessoais." }
        ],
        feedback: {
            type: "info",
            message: "É crucial reconhecer e respeitar seus próprios limites e priorizar sua saúde em todas as interações. Um(a) parceiro(a) que verdadeiramente se importa com você respeitará suas decisões e sua segurança, sem pressão ou julgamento. Não se sinta [PLAYER_SENTIDOA] por se proteger."
        }
    },
    // Nova cena para o caminho de ceder à pressão
    cena_casa_sem_dialogo_ceder_pressao: {
        narrative: "Você cedeu à pressão, e a ansiedade sobre as consequências [PLAYER_PRONOUN_O] acompanha, mesmo no calor do momento. A noite avança sem preservativo. Uma parte de você lamenta não ter sido mais [DETERMINADOA] em seus limites. Você sabe que se colocou em uma situação de risco desnecessário.",
        choices: [
            { text: "Próximos dias...", nextScene: "cena_pos_sem_protecao" }
        ],
        feedback: {
            type: "danger",
            message: "Ceder à pressão em assuntos de saúde sexual é um risco que pode ter graves consequências. É um lembrete doloroso da importância de manter-se firme em suas convicções e limites pessoais, não importa a situação."
        },
        scoreImpact: { hs: -10, rt: -10, ew: -10 }, // Reduz adicionalmente por ceder à pressão
        lesson: "Sua saúde e seu bem-estar não devem ser negociados. Sempre priorize seus limites."
    },
    cena_diagnostico_precoce: {
        narrative: "Sua atitude proativa foi a melhor escolha! Na consulta, o médico [VERBO_ACOLHER_MEDICO] com empatia e profissionalismo. Após exames, confirma o diagnóstico de Clamídia, uma IST comum e tratável. A boa notícia é que, por ter procurado ajuda cedo, o tratamento é simples, com antibióticos, e eficaz. O médico [PLAYER_PRONOUN_O] orienta detalhadamente sobre a importância crucial de comunicar [PARCEIRO_NOME] para que [PARCEIRO_PRONOUN_S] também se teste e trate, interrompendo a cadeia de transmissão e garantindo a saúde d[ARTIGO_PARCEIRO]s envolvidos. Você sente um alívio misturado com a responsabilidade de agir.",
        choices: [
            { text: "Assumir a responsabilidade: comunicar [PARCEIRO_NOME] sobre o diagnóstico, explicando a importância do teste e tratamento para ambos, com calma e clareza.", nextScene: "final_comunicacao_responsavel", scoreImpact: { hs: 20, rt: 15, ew: 10 }, lesson: "Comunicar parceiros(as) sobre ISTs é um ato de responsabilidade, cuidado e saúde pública essencial." },
            { text: "Preferir não comunicar [PARCEIRO_NOME] para evitar constrangimento, conflito ou 'problemas'. 'Já estou me tratando, então está resolvido para mim.'", nextScene: "final_falta_comunicacao", scoreImpact: { hs: -20, rt: -20, ew: -10 }, lesson: "A omissão na comunicação de ISTs é irresponsável e perigosa para a saúde coletiva e individual." }
        ],
        feedback: {
            type: "success",
            message: "Sua proatividade foi a chave para um tratamento eficaz! A detecção precoce de ISTs, mesmo com sintomas leves, é fundamental para sua cura e para evitar complicações maiores. Não hesite em buscar ajuda médica ao menor sinal de preocupação."
        }
    },
    cena_exames_rotina_pos_segura: {
        narrative: "Mesmo após uma relação com proteção e sem sintomas aparentes, você teve a **sabedoria e responsabilidade** de fazer exames de rotina para ISTs. Essa atitude proativa é um pilar fundamental da saúde sexual consciente. Os resultados mostram que está tudo bem, reforçando a paz de espírito e a importância de monitorar sua saúde continuamente. Você se sente [CONFIANTEA] e seguro(a) em suas decisões e na sua abordagem à sexualidade. Uma sensação de dever cumprido.",
        choices: [
            { text: "Fim da Aventura", nextScene: "final_saude_assegurada_total" }
        ],
        feedback: {
            type: "success",
            message: "A testagem regular para ISTs é recomendada para todas as pessoas sexualmente ativas, independentemente de sintomas ou do uso de preservativo. É a única forma de ter certeza do seu status, identificar infecções assintomáticas e buscar tratamento precoce, protegendo a si e [PREP_ARTIGO_PARCEIRO]s parceiros(as). Você é um exemplo de cuidado completo!"
        },
        scoreImpact: { hs: 15, rt: 5, ew: 10 },
        lesson: "A testagem regular é um pilar essencial da prevenção e controle de ISTs, complementando o uso de preservativos e promovendo paz de espírito."
    },
    final_complicacao_grave: {
        narrative: "Você ignorou os sintomas, mas a dor e o desconforto só pioraram drasticamente, evoluindo para dor pélvica crônica e febre alta. A infecção se espalhou, causando complicações sérias, como Doença Inflamatória Pélvica (DIP) ou danos aos órgãos reprodutivos. Você enfrenta um tratamento longo, doloroso e complexo, com risco de sequelas permanentes, como infertilidade. A negligência com a saúde sexual não é brincadeira e pode trazer consequências devastadoras e duradouras para sua qualidade de vida, bem-estar emocional e futuro.",
        choices: [],
        feedback: {
            type: "danger",
            message: "Ignorar sintomas de ISTs é extremamente perigoso e pode levar a complicações de saúde irreversíveis. Sempre procure um médico imediatamente ao menor sinal ou após qualquer relação desprotegida. Sua saúde é seu bem mais precioso e deve ser prioridade máxima, sem hesitação."
        },
        scoreImpact: { hs: -50, rt: -20, ew: -30 }
    },
    final_saude_aparentemente_segura: {
        narrative: "Você continuou sua vida sem preocupações adicionais, confiando apenas no uso do preservativo daquela vez. No entanto, é importante lembrar que, embora altamente eficaz, nenhum método é 100% à prova de falhas. Além disso, algumas ISTs como HPV (que pode causar verrugas e levar a câncer) e Herpes (que causa feridas recorrentes) podem ser transmitidas por contato de pele a pele em áreas não cobertas pelo preservativo. Sem exames de rotina, você vive com uma 'segurança aparente', sem certeza absoluta do seu status de saúde sexual. Essa incerteza, mesmo que inconsciente, pode gerar uma leve ansiedade a longo prazo.",
        choices: [],
        feedback: {
            type: "info",
            message: "Preservativos são excelentes, mas a proteção não é absoluta para todas as ISTs. A testagem regular e a comunicação contínua com parceiros(as) são fundamentais para manter a saúde sexual em dia e ter total tranquilidade, cobrindo as lacunas que o preservativo, sozinho, não pode preencher. A paz de espírito vem da certeza, não da ausência de sintomas."
        },
        scoreImpact: { hs: -5, rt: 0, ew: -5 }
    },
    final_comunicacao_responsavel: {
        narrative: "Você teve a coragem e a maturidade de ter a difícil, mas crucial, conversa com [PARCEIRO_NOME]. [PARCEIRO_PRONOUN_S_CAPITAL] ficou [SURPRESO_A_PARCEIRO], mas, após [PLAYER_PRONOUN_P] explicações claras, calmas e empáticas, [PARCEIRO_PRONOUN_S] reconheceu a importância da sua atitude e se comprometeu a fazer os exames e iniciar o tratamento. Sua atitude responsável não só protegeu sua saúde, mas ajudou a quebrar a cadeia de transmissão e promoveu a conscientização e o cuidado d[PREP_ARTIGO_PARCEIRO] [PARCEIRO_NOME]. Sua confiança no relacionamento se fortalece, e você sente um grande orgulho de sua honestidade e proatividade. [PARCEIRO_NOME] demonstra ser [ARTIGO_INDEFINIDO_PARCEIRO] [APOIADOR_A] e [CUIDADOSO_A] parceiro(a).",
        choices: [],
        feedback: {
            type: "success",
            message: "Comunicar parceiros(as) sexuais sobre ISTs é um ato de responsabilidade, cuidado e saúde pública essencial. Você contribuiu para a saúde d[PREP_ARTIGO_PARCEIRO] [PARCEIRO_NOME] e para a saúde coletiva, evitando a disseminação e promovendo o tratamento precoce. Isso é saúde sexual em comunidade! Sua honestidade e coragem são inspiradoras."
        },
        scoreImpact: { hs: 25, rt: 20, ew: 15 }
    },
    final_falta_comunicacao: {
        narrative: "Você optou por não comunicar [PARCEIRO_NOME], com medo do constrangimento, de uma reação negativa ou de 'estragar' o relacionamento. Assim, [PARCEIRO_PRONOUN_S] continua vivendo sem saber que pode ter uma IST. Isso não só é uma irresponsabilidade grave com a saúde d[PREP_ARTIGO_PARCEIRO] [PARCEIRO_NOME], que pode desenvolver complicações sérias e permanentes, mas também permite que [PARCEIRO_PRONOUN_S] possa, sem saber, transmitir a infecção para outras pessoas, criando um ciclo de risco e irresponsabilidade que afeta toda a comunidade. Você pode se sentir [PLAYER_ALIVIADOA] momentaneamente, mas a culpa e a ansiedade silenciosas [PLAYER_PRONOUN_O] acompanharão. Sua escolha priorizou o conforto imediato em detrimento da saúde e da responsabilidade.",
        choices: [],
        feedback: {
            type: "danger",
            message: "Não comunicar parceiros(as) sexuais sobre uma IST é uma falha grave na responsabilidade individual e de saúde pública. Isso impede que recebam tratamento, o que pode levar a complicações sérias para [PARCEIRO_PRONOUN_O] [PARCEIRO_NOME] e a disseminação da infecção para terceiros. A confidencialidade é importante, mas a responsabilidade com a saúde de outros é primordial e um dever cívico. O custo emocional de guardar segredos pode ser alto."
        },
        scoreImpact: { hs: -40, rt: -25, ew: -20 }
    },
    final_saude_assegurada_total: {
        narrative: "Sua jornada através de 'Entre Nós' demonstra um **alto nível de Consciência Sexual e responsabilidade exemplar**. Você priorizou o diálogo honesto, a prevenção proativa (com uso de preservativo e testagem regular) e agiu com responsabilidade e empatia em todas as etapas, garantindo uma vida sexual segura, informada, saudável e plena. Sua história é um exemplo inspirador de autocuidado, respeito mútuo e proatividade na promoção da saúde sexual, influenciando positivamente a si e [PREP_ARTIGO_PARCEIRO]s que [PLAYER_PRONOUN_S] se relaciona. Você alcança um estado de bem-estar e confiança plenos.",
        choices: [],
        feedback: {
            type: "success",
            message: "Parabéns! Você alcançou o nível mais alto de Consciência Sexual. Continue praticando o diálogo, a prevenção e a testagem regular para manter sua saúde sexual sempre em dia. Seja um agente de mudança e inspire outros a seguir seu exemplo! Sua jornada reflete uma vida sexual consciente e feliz."
        },
        scoreImpact: { hs: 0, rt: 0, ew: 0 } // Pontos já foram somados ao longo do caminho
    },
    final_decisao_consciente: {
        narrative: "Você decide que sua saúde, seus princípios e seu bem-estar não são negociáveis. Com firmeza, mas respeito, você explica a [PARCEIRO_NOME] que só prosseguiria se houvesse um acordo claro sobre o uso de proteção e consentimento mútuo. Sem essa concordância, você opta por ir para casa [PARA_CASA_SOZINHO]. Pode ter sido um momento de tensão ou frustração para [PARCEIRO_NOME], mas você se sente em paz com sua decisão, sabendo que se protegeu de um risco desnecessário e defendeu seus valores de autocuidado e respeito. Você demonstrou uma grande força interior e integridade, garantindo seu bem-estar emocional e físico.",
        choices: [],
        feedback: {
            type: "success",
            message: "Ter limites claros e se recusar a ceder à pressão é um ato de coragem e amor-próprio imenso. Sua saúde sexual é sua responsabilidade principal. Não se coloque em risco por ninguém! Você demonstrou maturidade, inteligência emocional e um forte senso de autovalorização. Esse é o verdadeiro empoderamento na saúde sexual."
        },
        scoreImpact: { hs: 0, rt: 0, ew: 0 } // Pontos já foram somados
    }
};

// --- Funções Principais do Jogo ---

// Função para atualizar os displays de status
function updateStatusDisplays() {
    conscienceDisplay.textContent = sexualHealthScore;
    trustDisplay.textContent = relationshipTrust;
    wellbeingDisplay.textContent = emotionalWellbeing;
}

// Função para carregar uma cena
function loadScene(sceneId) {
    // Esconde todas as telas e limpa feedback
    openingScreen.classList.add('hidden');
    genderSelectionScreen.classList.add('hidden');
    gameMain.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    feedbackMessageElement.classList.add('hidden');
    feedbackMessageElement.textContent = '';

    const scene = scenes[sceneId];

    // Verifica se a cena existe
    if (!scene) {
        console.error("Erro: Cena não encontrada:", sceneId);
        showResults("Erro na Aventura: Cena Inválida"); // Finaliza o jogo com mensagem de erro
        return;
    }

    currentSceneId = sceneId;

    // Aplica o impacto nas pontuações de estado, garantindo que fiquem entre 0 e 100
    if (scene.scoreImpact) {
        sexualHealthScore = Math.max(0, Math.min(100, sexualHealthScore + (scene.scoreImpact.hs || 0)));
        relationshipTrust = Math.max(0, Math.min(100, relationshipTrust + (scene.scoreImpact.rt || 0)));
        emotionalWellbeing = Math.max(0, Math.min(100, emotionalWellbeing + (scene.scoreImpact.ew || 0)));
    }

    // Adiciona a lição aprendida (se houver e não for duplicada)
    if (scene.lesson) {
        lessonsLearned.add(scene.lesson);
    }

    // Atualiza os displays de status na interface
    updateStatusDisplays();

    // Atualiza o texto da narrativa
    storyTextElement.textContent = formatNarrative(scene.narrative);

    // Limpa e cria os botões de escolha
    choiceButtonsContainer.innerHTML = '';
    if (scene.choices && scene.choices.length > 0) {
        gameMain.classList.remove('hidden'); // Mostra a tela principal do jogo
        scene.choices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = formatNarrative(choice.text); // Garante que o texto do botão seja formatado
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

// Função para exibir os resultados finais
function showResults(errorMessage = null) {
    gameMain.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    if (errorMessage) {
        finalScoreElement.textContent = errorMessage;
        resultMessageElement.textContent = "Houve um erro na jornada. Por favor, tente novamente.";
        lessonsLearnedList.innerHTML = '<li>O jogo encontrou um problema. Reinicie para uma nova aventura.</li>';
        return;
    }

    finalScoreElement.textContent = `Sua Pontuação Final:\nConsciência Sexual: ${sexualHealthScore} | Confiança: ${relationshipTrust} | Bem-Estar: ${emotionalWellbeing}`;

    let resultMsg = '';
    if (sexualHealthScore >= 80 && relationshipTrust >= 70 && emotionalWellbeing >= 70) {
        resultMsg = "Você demonstrou uma **Consciência Sexual excepcional**! Suas escolhas refletem maturidade, empatia e proatividade. Você construiu relacionamentos baseados em confiança e manteve seu bem-estar emocional. Parabéns por ser um modelo de saúde sexual integral!";
    } else if (sexualHealthScore >= 50 && relationshipTrust >= 40 && emotionalWellbeing >= 40) {
        resultMsg = "Sua **Consciência Sexual está no caminho certo**, mas há espaço para aprimoramento. Você fez boas escolhas, mas também enfrentou desafios que testaram sua comunicação e resiliência. Continue explorando o diálogo e o autocuidado. A jornada continua!";
    } else {
        resultMsg = "Sua **Consciência Sexual precisa de mais atenção**. Suas escolhas apresentaram riscos significantes, afetando sua saúde, seus relacionamentos e seu bem-estar emocional. É fundamental refletir sobre a importância da prevenção, testagem, comunicação e limites. Sua saúde é um tesouro que merece ser cuidado!";
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
        li.textContent = "Nenhuma lição específica registrada nesta jornada. O aprendizado é contínuo, e cada escolha é uma oportunidade!";
        lessonsLearnedList.appendChild(li);
    }
}

// Funções para lidar com as transições de tela e escolha de gênero
function startJourney() {
    openingScreen.classList.add('hidden');
    genderSelectionScreen.classList.remove('hidden');

    // Preenche o texto da tela de seleção de gênero com um nome genérico antes da escolha
    // CORREÇÃO: Também removido .innerHTML extra aqui para evitar re-processamento
    document.querySelector('#gender-selection-screen .narrative-paragraph').textContent = formatNarrative("Assuma o papel de [PERSONAGEM_NOME] e viva os desafios e aprendizados de uma vida sexual ativa e consciente.");
}

function selectGender(gender) {
    playerGender = gender;
    // Resetar pontuação e lições ao iniciar um novo jogo
    sexualHealthScore = 50; // Reinicia com valor base
    relationshipTrust = 50; // Reinicia com valor base
    emotionalWellbeing = 50; // Reinicia com valor base
    lessonsLearned.clear();

    // Poderíamos aleatorizar traços do parceiro aqui para maior rejogabilidade
    partnerIsReserved = Math.random() < 0.5;
    partnerIsAnxious = Math.random() < 0.5;

    genderSelectionScreen.classList.add('hidden');
    loadScene('char_intro'); // Inicia a história com a nova cena de introdução do personagem
}

// --- Event Listeners ---
startJourneyButton.addEventListener('click', startJourney);
genderMaleButton.addEventListener('click', () => selectGender('male'));
genderFemaleButton.addEventListener('click', () => selectGender('female'));

restartGameButton.addEventListener('click', () => {
    // Reseta o jogo para a tela de abertura inicial
    gameMain.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    openingScreen.classList.remove('hidden');
    currentSceneId = ''; // Reseta a cena atual para garantir um novo início
});

// Iniciar o jogo mostrando a tela de abertura ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    openingScreen.classList.remove('hidden');
    updateStatusDisplays(); // Inicializa os displays com valores base
});