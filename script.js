// --- Elementos HTML ---
const characterCreationScreen = document.getElementById('character-creation-screen');
const gameContent = document.getElementById('game-content');
const playerNameInput = document.getElementById('player-name');
const genderChoiceButtons = document.querySelectorAll('.character-creation-screen .choice-grid button[data-gender]');
const interestChoiceButtons = document.querySelectorAll('.character-creation-screen .choice-grid button[data-interest]');
const startGameButton = document.getElementById('start-game-button');

const narrativeTextElement = document.getElementById('narrative-text');
const educationalMessageElement = document.getElementById('educational-message');
const eventMessageElement = document.getElementById('event-message');
const choicesContainer = document.getElementById('choices-container');
const continueButton = document.getElementById('continue-button');
const restartButton = document.getElementById('restart-button');

// --- Elementos da barra de status ---
const statusSaude = document.getElementById('status-saude');
const statusConhecimento = document.getElementById('status-conhecimento');
const statusRelacao = document.getElementById('status-relacao');
const statusAutonomia = document.getElementById('status-autonomia');
const progressSaude = document.getElementById('progress-saude');
const progressConhecimento = document.getElementById('progress-conhecimento');
const progressRelacao = document.getElementById('progress-relacao');
const progressAutonomia = document.getElementById('progress-autonomia');

// --- Variáveis de Jogo ---
let playerState = {
    name: 'Jovem Estudante', // Nome padrão
    gender: null, // 'female', 'male', 'non-binary'
    interest: null, // 'long-term', 'casual', 'explore'
    saude: 100,
    conhecimento: 0,
    relacao: 50,
    autonomia: 50,
    // Variáveis para rastrear o estado do jogo e escolhas anteriores
    usouCamisinhaNaPrimeiraVez: false,
    fezTesteNaPrimeiraVez: false,
    teveSintomas: false,
    istDiagnosticada: null, // Pode ser 'nenhuma', 'clamidia', 'herpes', etc.
    // Variáveis adicionais para eventos futuros
    alexConversouPais: false, // Alex conversou com os pais sobre o relacionamento
    revelouISTParaAmigo: false, // Revelou diagnóstico para Rafa
    alexReagiuBemDiagnostico: true // Se Alex aceitou bem o diagnóstico
};

let currentSceneId = 'intro';
let isTyping = false;

// --- Configurações do Jogo ---
const TYPING_SPEED = 30; // ms por caractere
const EVENT_CHANCE = 0.25; // 25% de chance de um evento aleatório ocorrer
const EDUCATIONAL_BREAK_CHANCE = 0.3; // 30% de chance de uma "pausa educativa"

// --- Funções Auxiliares de UI ---
function updateStatusBar() {
    statusSaude.textContent = playerState.saude;
    statusConhecimento.textContent = playerState.conhecimento;
    statusRelacao.textContent = playerState.relacao;
    statusAutonomia.textContent = playerState.autonomia;

    progressSaude.style.width = playerState.saude + '%';
    progressConhecimento.style.width = playerState.conhecimento + '%';
    progressRelacao.style.width = playerState.relacao + '%';
    progressAutonomia.style.width = playerState.autonomia + '%';

    statusSaude.className = 'status-value ' + (playerState.saude > 70 ? 'good' : playerState.saude > 30 ? 'medium' : 'bad');
    statusConhecimento.className = 'status-value ' + (playerState.conhecimento > 70 ? 'good' : playerState.conhecimento > 30 ? 'medium' : 'bad');
    statusRelacao.className = 'status-value ' + (playerState.relacao > 70 ? 'good' : playerState.relacao > 30 ? 'medium' : 'bad');
    statusAutonomia.className = 'status-value ' + (playerState.autonomia > 70 ? 'good' : playerState.autonomia > 30 ? 'medium' : 'bad');
}

async function typeWriter(text, element) {
    isTyping = true;
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
        element.textContent += text.charAt(i);
        await new Promise(resolve => setTimeout(resolve, TYPING_SPEED));
    }
    isTyping = false;
}

function showMessage(element, message, className = '') {
    element.textContent = message;
    element.className = className; // Aplica classe para estilo (ex: 'event-message', 'educational-message')
    element.style.display = 'block';
}

function hideMessage(element) {
    element.style.display = 'none';
    element.textContent = '';
    element.className = ''; // Limpa classes
}

function displayChoices(choices) {
    choicesContainer.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice-button');
        button.textContent = choice.text;
        // Condição para desabilitar botões
        if (choice.requiresAutonomia && playerState.autonomia < choice.requiresAutonomia) {
            button.disabled = true;
            button.title = `Sua autonomia (${playerState.autonomia}%) não é suficiente para esta escolha (requer ${choice.requiresAutonomia}%).`;
            button.style.opacity = 0.5;
            button.style.cursor = 'not-allowed';
        }
         if (choice.requiresRelacao && playerState.relacao < choice.requiresRelacao) {
            button.disabled = true;
            button.title = `Sua relação (${playerState.relacao}%) não é suficiente para esta escolha (requer ${choice.requiresRelacao}%).`;
            button.style.opacity = 0.5;
            button.style.cursor = 'not-allowed';
        }
        button.addEventListener('click', () => makeChoice(choice));
        choicesContainer.appendChild(button);
    });
    choicesContainer.style.display = 'flex';
    continueButton.style.display = 'none';
}

// --- Lógica do Jogo ---

async function makeChoice(choice) {
    if (isTyping) return;

    if (choice.preAction) {
        choice.preAction(); // Ações antes de aplicar os efeitos
    }

    if (choice.effects) {
        playerState.saude = Math.max(0, Math.min(100, playerState.saude + (choice.effects.saude || 0)));
        playerState.conhecimento = Math.max(0, Math.min(100, playerState.conhecimento + (choice.effects.conhecimento || 0)));
        playerState.relacao = Math.max(0, Math.min(100, playerState.relacao + (choice.effects.relacao || 0)));
        playerState.autonomia = Math.max(0, Math.min(100, playerState.autonomia + (choice.effects.autonomia || 0)));
    }
    updateStatusBar();

    await typeWriter(`"${choice.text}" - Uma decisão importante. Veja as consequências...`, narrativeTextElement);
    await new Promise(resolve => setTimeout(resolve, 1500));

    currentSceneId = choice.nextScene;
    loadScene(currentSceneId);
}

// Função para substituir placeholders na string de texto da cena
function formatText(text) {
    let formattedText = text;
    formattedText = formattedText.replace(/\${playerName}/g, playerState.name || 'Jovem Estudante');
    formattedText = formattedText.replace(/\${playerGenderPronoun}/g, playerState.gender === 'female' ? 'ela' : playerState.gender === 'male' ? 'ele' : 'elx');
    formattedText = formattedText.replace(/\${playerGenderSuffix}/g, playerState.gender === 'female' ? 'a' : playerState.gender === 'male' ? 'o' : 'x');
    formattedText = formattedText.replace(/\${istDiagnosticada}/g, playerState.istDiagnosticada ? (playerState.istDiagnosticada === 'clamidia' ? 'Clamídia' : playerState.istDiagnosticada === 'herpes' ? 'Herpes Genital' : playerState.istDiagnosticada === 'gonorreia' ? 'Gonorreia' : playerState.istDiagnosticada === 'hpv' ? 'HPV' : playerState.istDiagnosticada === 'sifilis' ? 'Sífilis' : 'HIV') : 'uma IST');
    return formattedText;
}


async function loadScene(sceneId) {
    const scene = gameScenes[sceneId];
    if (!scene) {
        console.error('Cena não encontrada:', sceneId);
        return;
    }

    narrativeTextElement.textContent = '';
    hideMessage(educationalMessageElement);
    hideMessage(eventMessageElement);
    choicesContainer.innerHTML = '';
    choicesContainer.style.display = 'none';
    continueButton.style.display = 'none';
    restartButton.style.display = 'none';

    // Formata o texto da cena antes de digitar
    const sceneText = formatText(scene.text);
    await typeWriter(sceneText, narrativeTextElement);

    if (scene.educationalInfo) {
        showMessage(educationalMessageElement, formatText(scene.educationalInfo), 'educational-message');
    }

    if (scene.type === 'narrative') {
        continueButton.style.display = 'block';
    } else if (scene.type === 'choice') {
        const formattedChoices = scene.choices.map(choice => ({
            ...choice,
            text: formatText(choice.text) // Formata o texto das escolhas também
        }));
        displayChoices(formattedChoices);
    } else if (scene.type === 'end') {
        restartButton.style.display = 'block';
    }

    // Gerar evento aleatório OU pausa educativa (apenas se a cena permitir e não for final)
    if (scene.allowRandomEvent && scene.type !== 'end') {
        if (Math.random() < EVENT_CHANCE) {
            await triggerRandomEvent();
        } else if (Math.random() < EDUCATIONAL_BREAK_CHANCE) {
            await triggerEducationalBreak();
        }
    }
}

// --- Eventos Aleatórios ---
const randomEvents = [
    {
        name: "Artigo de Notícia Preocupante",
        text: "Você lê uma notícia alarmante sobre o aumento de casos de ISTs na sua região, causando um momento de reflexão.",
        effects: { conhecimento: 10, saude: -5 },
        educationalInfo: "Manter-se informado(a) é essencial, mas filtre fontes confiáveis. Notícias podem ser alarmantes, mas a prevenção é a melhor resposta.",
        choices: null
    },
    {
        name: "Conversa no Grupo de Amigos",
        text: "Durante uma conversa com amigos, o assunto sobre saúde sexual surge. Um amigo faz um comentário preconceituoso sobre ISTs. Sua autonomia e conhecimento podem ser testados aqui.",
        choices: [
            { text: "Corrigir a informação e educar o amigo sobre o estigma.", effects: { conhecimento: 10, relacao: 5, autonomia: 15 }, nextScene: 'current', requiresAutonomia: 30 },
            { text: "Ficar em silêncio para evitar conflito.", effects: { relacao: -5, autonomia: -10 }, nextScene: 'current' }
        ]
    },
    {
        name: "Propaganda sobre Testagem Gratuita",
        text: "Você vê uma propaganda sobre locais que oferecem testagem gratuita e sigilosa para ISTs na sua universidade.",
        effects: { conhecimento: 5 },
        educationalInfo: "Muitas universidades e centros de saúde oferecem testagem gratuita e confidencial. Não há desculpas para não se cuidar!",
        choices: [
            { text: "Anotar o local e considerar ir.", effects: { conhecimento: 10, autonomia: 5 }, nextScene: 'current' },
            { text: "Ignorar a propaganda.", effects: { conhecimento: -5 }, nextScene: 'current' }
        ]
    },
    {
        name: "Momento de Dúvida",
        text: "Enquanto navega nas redes sociais, você se depara com um post que causa insegurança sobre sua vida sexual ou seu relacionamento. Isso afeta sua saúde mental.",
        effects: { saude: -5, autonomia: -5 },
        educationalInfo: "A pressão social e a informação (ou desinformação) online podem impactar sua saúde mental. Busque sempre fontes confiáveis e converse com quem confia.",
        choices: [
            { text: "Buscar mais informações em fontes seguras.", effects: { conhecimento: 10, autonomia: 5 }, nextScene: 'current' },
            { text: "Tentar ignorar, mas a dúvida persiste.", effects: { saude: -10 }, nextScene: 'current' }
        ]
    }
];

async function triggerRandomEvent() {
    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    showMessage(eventMessageElement, `[EVENTO INESPERADO] ${event.name}: ${formatText(event.text)}`, 'event-message');
    if (event.educationalInfo) {
        showMessage(educationalMessageElement, formatText(event.educationalInfo), 'educational-message');
    }

    if (event.effects) {
        playerState.saude = Math.max(0, Math.min(100, playerState.saude + (event.effects.saude || 0)));
        playerState.conhecimento = Math.max(0, Math.min(100, playerState.conhecimento + (event.effects.conhecimento || 0)));
        playerState.relacao = Math.max(0, Math.min(100, playerState.relacao + (event.effects.relacao || 0)));
        playerState.autonomia = Math.max(0, Math.min(100, playerState.autonomia + (event.effects.autonomia || 0)));
    }
    updateStatusBar();

    await new Promise(resolve => setTimeout(resolve, 3000));

    if (event.choices) {
        choicesContainer.innerHTML = '';
        event.choices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = formatText(choice.text);
            button.addEventListener('click', async () => {
                if (choice.effects) {
                    playerState.saude = Math.max(0, Math.min(100, playerState.saude + (choice.effects.saude || 0)));
                    playerState.conhecimento = Math.max(0, Math.min(100, playerState.conhecimento + (choice.effects.conhecimento || 0)));
                    playerState.relacao = Math.max(0, Math.min(100, playerState.relacao + (choice.effects.relacao || 0)));
                    playerState.autonomia = Math.max(0, Math.min(100, playerState.autonomia + (choice.effects.autonomia || 0)));
                }
                updateStatusBar();
                hideMessage(eventMessageElement);
                hideMessage(educationalMessageElement);
                loadScene(currentSceneId);
            });
            choicesContainer.appendChild(button);
        });
        choicesContainer.style.display = 'flex';
        continueButton.style.display = 'none';
    } else {
        continueButton.style.display = 'block';
        continueButton.onclick = () => {
            hideMessage(eventMessageElement);
            hideMessage(educationalMessageElement);
            loadScene(currentSceneId);
            continueButton.onclick = defaultContinueHandler;
        };
    }
}

// --- Pausas Educacionais Estruturadas ---
const educationalBreaks = [
    {
        title: "Artigo: Mitos e Fatos sobre ISTs",
        content: "Um artigo explica que ISTs não são 'castigo' e podem afetar qualquer pessoa. A chave é a informação e a prevenção. Desmistifica preconceitos comuns.",
        effects: { conhecimento: 15, autonomia: 5 }
    },
    {
        title: "Entrevista: A Importância do Diálogo com o Parceiro(a)",
        content: "Você lê uma entrevista com um psicólogo(a) focando em como a comunicação aberta sobre sexo seguro e testagem fortalece os relacionamentos e a confiança mútua.",
        effects: { conhecimento: 10, relacao: 5 }
    },
    {
        title: "Infográfico: Métodos de Prevenção Além da Camisinha",
        content: "Um infográfico detalha outras formas de prevenção, como a PrEP (Profilaxia Pré-Exposição), a PEP (Profilaxia Pós-Exposição) e a testagem regular.",
        effects: { conhecimento: 20, saude: 5 }
    },
    {
        title: "Webinar: Saúde Mental e Relacionamentos",
        content: "Um especialista aborda a interconexão entre bem-estar psicológico e a qualidade das relações. Estresse e ansiedade afetam a capacidade de comunicação e confiança, impactando até mesmo a saúde sexual. Cuidar da mente é cuidar do todo.",
        effects: { conhecimento: 10, saude: 5, autonomia: 5 }
    }
];

async function triggerEducationalBreak() {
    const breakInfo = educationalBreaks[Math.floor(Math.random() * educationalBreaks.length)];
    showMessage(educationalMessageElement, `--- PAUSA EDUCACIONAL: ${breakInfo.title} --- \n${formatText(breakInfo.content)}`, 'educational-message');

    if (breakInfo.effects) {
        playerState.saude = Math.max(0, Math.min(100, playerState.saude + (breakInfo.effects.saude || 0)));
        playerState.conhecimento = Math.max(0, Math.min(100, playerState.conhecimento + (breakInfo.effects.conhecimento || 0)));
        playerState.relacao = Math.max(0, Math.min(100, playerState.relacao + (breakInfo.effects.relacao || 0)));
        playerState.autonomia = Math.max(0, Math.min(100, playerState.autonomia + (breakInfo.effects.autonomia || 0)));
    }
    updateStatusBar();

    continueButton.style.display = 'block';
    continueButton.onclick = () => {
        hideMessage(educationalMessageElement);
        loadScene(currentSceneId);
        continueButton.onclick = defaultContinueHandler;
    };
}


const defaultContinueHandler = () => {
    if (isTyping) return;
    const scene = gameScenes[currentSceneId];
    if (scene.nextScene) {
        loadScene(scene.nextScene);
    }
};
continueButton.addEventListener('click', defaultContinueHandler);

restartButton.addEventListener('click', () => {
    if (isTyping) return;

    // Redefine o estado inicial e mostra a tela de criação novamente
    playerState = {
        name: 'Jovem Estudante',
        gender: null,
        interest: null,
        saude: 100,
        conhecimento: 0,
        relacao: 50,
        autonomia: 50,
        usouCamisinhaNaPrimeiraVez: false,
        fezTesteNaPrimeiraVez: false,
        teveSintomas: false,
        istDiagnosticada: null,
        alexConversouPais: false,
        revelouISTParaAmigo: false,
        alexReagiuBemDiagnostico: true
    };
    updateStatusBar();
    currentSceneId = 'intro';

    // Reinicia a tela de criação de personagem
    characterCreationScreen.style.display = 'flex';
    gameContent.style.display = 'none';
    // Limpa seleções anteriores
    genderChoiceButtons.forEach(btn => btn.classList.remove('selected'));
    interestChoiceButtons.forEach(btn => btn.classList.remove('selected'));
    playerNameInput.value = '';
});

// --- Lógica de Criação de Personagem ---
let selectedGender = null;
let selectedInterest = null;

genderChoiceButtons.forEach(button => {
    button.addEventListener('click', () => {
        genderChoiceButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedGender = button.dataset.gender;
    });
});

interestChoiceButtons.forEach(button => {
    button.addEventListener('click', () => {
        interestChoiceButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedInterest = button.dataset.interest;
    });
});

startGameButton.addEventListener('click', () => {
    if (!selectedGender || !selectedInterest) {
        alert("Por favor, selecione seu gênero e seu interesse em um relacionamento para começar!");
        return;
    }

    playerState.name = playerNameInput.value.trim() || 'Jovem Estudante';
    playerState.gender = selectedGender;
    playerState.interest = selectedInterest;

    characterCreationScreen.style.display = 'none';
    gameContent.style.display = 'block';
    updateStatusBar();
    loadScene(currentSceneId);
});


// --- Cenários do Jogo (Adaptados e Expandidos) ---
const gameScenes = {
    'intro': {
        text: `Olá, ${playerState.name || 'Jovem Estudante'}! Bem-vind${playerState.gender === 'female' ? 'a' : playerState.gender === 'male' ? 'o' : 'x'} ao jogo 'Consciência e Escolhas'. Você é um${playerState.gender === 'female' ? 'a' : playerState.gender === 'male' ? 'o' : 'x'} estudante universitári${playerState.gender === 'female' ? 'a' : playerState.gender === 'male' ? 'o' : 'x'} com a vida cheia de planos e um novo relacionamento começando. **Seu parceiro(a), Alex**, é uma pessoa que você realmente gosta. Suas decisões terão um grande impacto no seu futuro, saúde e na relação de vocês.`,
        type: 'narrative',
        nextScene: 'cenario1_encontro',
        allowRandomEvent: false
    },
    'cenario1_encontro': {
        text: "--- Cenário 1: O Início do Relacionamento ---\nVocês estão cada vez mais próximos. A intimidade está crescendo. Uma noite, em um momento de paixão, Alex hesita por um instante e diz: 'Estamos indo rápido demais? Deveríamos conversar sobre isso...'",
        type: 'choice',
        allowRandomEvent: false,
        choices: [
            {
                text: "Responder: 'Sim, você tem razão. É importante que a gente se proteja e converse abertamente.'",
                nextScene: 'consequencia_comunicacao',
                effects: { saude: 0, conhecimento: 20, relacao: 15, autonomia: 10 },
                preAction: () => { playerState.usouCamisinhaNaPrimeiraVez = true; }
            },
            {
                text: "Dizer: 'Relaxa, o momento é agora! Depois a gente pensa nisso.'",
                nextScene: 'consequencia_risco_inicial',
                effects: { saude: -10, conhecimento: 5, relacao: -10, autonomia: -5 },
                preAction: () => { playerState.usouCamisinhaNaPrimeiraVez = false; }
            },
            {
                text: "Ficar calad${playerGenderSuffix} e tentar mudar de assunto, visivelmente desconfortável.",
                nextScene: 'consequencia_risco_grave',
                effects: { saude: -25, conhecimento: -5, relacao: -15, autonomia: -10 },
                preAction: () => { playerState.usouCamisinhaNaPrimeiraVez = false; }
            }
        ]
    },
    'consequencia_comunicacao': {
        text: "Alex sorri, aliviado(a). 'Fico feliz que você pense assim. Minha saúde é importante pra mim, e a sua também.' Vocês conversam abertamente sobre sexo seguro, histórico e decidem usar camisinha. Isso demonstra respeito mútuo e cuidado. Uma base sólida para um relacionamento ${playerState.interest === 'long-term' ? 'duradouro' : playerState.interest === 'casual' ? 'honesto' : 'com liberdade e segurança'}.",
        educationalInfo: "A comunicação é a base de qualquer relacionamento saudável, especialmente em questões íntimas. Diálogo aberto sobre sexo seguro, histórico sexual e testagem reforça a confiança e a segurança de ambos.",
        type: 'narrative',
        nextScene: 'cenario2_testes',
        allowRandomEvent: true
    },
    'consequencia_risco_inicial': {
        text: "Alex parece um pouco desapontado(a), mas a paixão do momento toma conta e a proteção acaba sendo deixada de lado. A falta de iniciativa em abordar um tema tão sério pode trazer incertezas para ambos. Seu interesse em um relacionamento ${playerState.interest === 'casual' ? 'casual pode ter influenciado essa imprudência, mas as consequências ainda são reais.' : 'sério está em risco se não houver mais responsabilidade.'}",
        educationalInfo: "A falta de diálogo sobre sexo seguro pode expor ambos a riscos desnecessários. A responsabilidade é compartilhada, e a omissão pode criar brechas para desconfiança e problemas de saúde.",
        type: 'narrative',
        nextScene: 'cenario2b_duvidas',
        allowRandomEvent: true
    },
    'consequencia_risco_grave': {
        text: "Alex fica em silêncio, o clima tenso por um momento antes de seguir em frente. Você optou por ignorar a questão da proteção. Ter relações sexuais sem proteção é um risco direto e alto à saúde. Alex parece menos conectad${playerGenderSuffix} depois disso. Seu interesse em ${playerState.interest === 'long-term' ? 'algo sério pode ter sido seriamente comprometido.' : 'explorar sem rótulos acabou se tornando uma irresponsabilidade grave.'}",
        educationalInfo: "Relações sexuais desprotegidas são a principal forma de transmissão de ISTs. A prevenção é a melhor forma de se cuidar, e a negligência aumenta drasticamente o risco para você e seu(s) parceiro(s).",
        type: 'narrative',
        nextScene: 'cenario3_sintomas',
        allowRandomEvent: true
    },
    'cenario2_testes': {
        text: "--- Cenário 2: Prevenção e Cuidado Contínuo ---\nAlguns meses se passaram. Vocês continuam se protegendo. Alex comenta: 'Sabe, eu estava pensando... Talvez fosse bom a gente fazer alguns exames de rotina para ISTs, só pra garantir que está tudo bem. O que você acha?' Sua proatividade agora determinará o próximo passo.",
        type: 'choice',
        allowRandomEvent: true,
        choices: [
            {
                text: "Concordar prontamente: 'É uma ótima ideia! Saúde em primeiro lugar. Vamos agendar juntos.'",
                nextScene: 'consequencia_testes_positivos_negativos',
                effects: { saude: 5, conhecimento: 20, relacao: 15, autonomia: 10 },
                preAction: () => { playerState.fezTesteNaPrimeiraVez = true; }
            },
            {
                text: "Relutar: 'Ah, mas a gente sempre usou camisinha, não é necessário...' (Essa atitude afeta a confiança de Alex, especialmente se seu interesse era em um relacionamento ${playerState.interest === 'long-term' ? 'sério.' : 'com alguma responsabilidade.'})",
                nextScene: 'final_alerta_testes',
                effects: { saude: -5, conhecimento: -10, relacao: -5, autonomia: -5 },
                preAction: () => { playerState.fezTesteNaPrimeiraVez = false; }
            }
        ]
    },
    'cenario2b_duvidas': {
        text: "--- Cenário 2.5: A Pulga Atrás da Orelha ---\nCom o tempo, a ausência de proteção inicial pesa. Você começa a pesquisar sobre ISTs, e a ansiedade aumenta. Alex percebe sua preocupação e pergunta: 'Está tudo bem? Você parece distante...'. Seu interesse em um relacionamento ${playerState.interest === 'long-term' ? 'sério te impulsiona a resolver isso, mas o medo é grande.' : 'sem rótulos te deixa mais hesitante em se abrir.'} O que você faz?",
        type: 'choice',
        allowRandomEvent: true,
        choices: [
            {
                text: "Finalmente, desabafar com Alex sobre sua preocupação e a necessidade de fazer testes.",
                nextScene: 'consequencia_dialogo_tardio',
                effects: { saude: -5, conhecimento: 15, relacao: 10, autonomia: 10 },
                requiresAutonomia: 30
            },
            {
                text: "Inventar uma desculpa e tentar ignorar a preocupação, esperando que ela passe.",
                nextScene: 'final_alerta_ansiedade',
                effects: { saude: -15, conhecimento: 0, relacao: -10, autonomia: -10 }
            }
        ]
    },
    'consequencia_dialogo_tardio': {
        text: "Foi difícil, mas você finalmente teve a conversa. Alex, após um momento de surpresa, diz: 'Eu entendo. Deveríamos ter falado sobre isso antes. Vamos fazer os testes juntos, ok?'. Um alívio, mas a lição fica: a prevenção deve vir antes da preocupação. Essa honestidade, mesmo que tardia, pode fortalecer um relacionamento ${playerState.interest === 'long-term' ? 'sério e resiliente' : 'baseado na verdade e no crescimento'}.",
        educationalInfo: "É sempre tempo para começar a se proteger e buscar informação. Diálogo, mesmo que tardio, é fundamental para a saúde do relacionamento e individual. A confiança pode ser reconstruída com honestidade.",
        type: 'narrative',
        nextScene: 'cenario_testes_tardio',
        allowRandomEvent: true
    },
    'consequencia_testes_positivos_negativos': {
        text: "--- Cenário 3: O Resultado dos Testes ---\nOs dias até o resultado foram tensos. Finalmente, o envelope chega. Você e Alex abrem juntos. O que os resultados revelam?",
        type: 'narrative',
        nextScene: 'cenario_pos_resultados_iniciais',
        allowRandomEvent: true,
        preAction: () => {
            let detectedIST = false;
            if (playerState.saude < 60 && Math.random() < 0.4) {
                playerState.istDiagnosticada = (Math.random() < 0.5 ? 'clamidia' : 'gonorreia');
                detectedIST = true;
            } else if (playerState.saude < 30 && Math.random() < 0.7) {
                 playerState.istDiagnosticada = (Math.random() < 0.5 ? 'herpes' : 'hpv');
                detectedIST = true;
            }

            if (detectedIST) {
                gameScenes['cenario_pos_resultados_iniciais'].text = `Infelizmente, um dos resultados (o seu ou o de Alex, dependendo das suas ações) é positivo para **\${istDiagnosticada}**. É um choque, mas por terem feito o teste, o tratamento pode começar imediatamente. Alex te abraça: 'Vamos enfrentar isso juntos.'`;
                gameScenes['cenario_pos_resultados_iniciais'].nextScene = 'cenario4_estigma_adaptado';
                playerState.teveSintomas = true;
                playerState.alexReagiuBemDiagnostico = true;
            } else {
                gameScenes['cenario_pos_resultados_iniciais'].text = "Os resultados indicam que ambos estão negativos para as principais ISTs! Um enorme alívio. Vocês se sentem mais conectados e seguros, consolidando o compromisso de vocês com a saúde mútua.";
                gameScenes['cenario_pos_resultados_iniciais'].nextScene = 'final_feliz';
                playerState.istDiagnosticada = 'nenhuma';
            }
        }
    },
    'cenario_pos_resultados_iniciais': {
        text: "",
        educationalInfo: "",
        type: 'narrative',
        nextScene: '',
        allowRandomEvent: true,
        preAction: () => {
             if (playerState.istDiagnosticada && playerState.istDiagnosticada !== 'nenhuma') {
                gameScenes['cenario_pos_resultados_iniciais'].educationalInfo = `O diagnóstico de \${istDiagnosticada} é comum. ${playerState.istDiagnosticada === 'clamidia' || playerState.istDiagnosticada === 'gonorreia' ? 'É curável com antibióticos.' : 'É uma condição crônica, mas manejável com medicação e acompanhamento.'} O importante é a detecção precoce e o tratamento.`;
            } else {
                gameScenes['cenario_pos_resultados_iniciais'].educationalInfo = "Resultados negativos trazem alívio, mas reforçam a importância da prevenção contínua. A testagem regular, mesmo sem sintomas, é uma prática de saúde sexual responsável.";
            }
        }
    },
    'cenario_testes_tardio': {
        text: "--- Cenário 3.5: O Resultado dos Testes Tardia ---\nOs dias até o resultado foram tensos. Finalmente, o envelope chega. Você e Alex abrem juntos. O que os resultados revelam?",
        type: 'choice',
        allowRandomEvent: true,
        choices: [
            {
                text: "Resultados negativos para ambos! Ufa! Um enorme alívio e a promessa de prevenção contínua. Vocês se abraçam, mais aliviados e unidos.",
                nextScene: 'final_feliz_licoes',
                effects: { saude: 10, conhecimento: 10, relacao: 20, autonomia: 10 }
            },
            {
                text: "Um de vocês testa positivo para uma IST tratável (ex: HPV ou gonorreia).",
                nextScene: 'consequencia_diagnostico_tardio',
                effects: { saude: -20, conhecimento: 20, relacao: -10, autonomia: 15 },
                preAction: () => { playerState.teveSintomas = true; playerState.istDiagnosticada = (Math.random() > 0.5 ? 'gonorreia' : 'hpv'); }
            }
        ]
    },
    'consequencia_diagnostico_tardio': {
        text: `O diagnóstico de \${istDiagnosticada} é um choque, especialmente porque poderiam ter evitado. O foco é no tratamento imediato e na comunicação. Alex diz: 'Isso é difícil, mas estamos juntos.' A confiança é abalada, mas há um caminho para reconstruir, crucial para quem busca um relacionamento ${playerState.interest === 'long-term' ? 'sério.' : 'com base na verdade.'}`,
        educationalInfo: `Um diagnóstico de IST, mesmo que tardio, é uma oportunidade de tratamento. \${istDiagnosticada === 'gonorreia' ? 'Gonorreia é curável com antibióticos.' : 'HPV pode causar verrugas ou lesões que precisam ser acompanhadas.'} O importante é o cuidado e a comunicação com o(s) parceiro(s).`,
        type: 'narrative',
        nextScene: 'cenario4_estigma_adaptado',
        allowRandomEvent: true
    },
    'cenario3_sintomas': {
        text: "--- Cenário 3: Sinais de Alerta Graves ---\nApós ter ignorado a proteção, você começa a sentir sintomas intensos (dor, febre, feridas dolorosas). O medo e a preocupação são imensos. Alex percebe sua angústia e insiste para que você procure um médico. O que você faz?",
        type: 'choice',
        allowRandomEvent: true,
        choices: [
            {
                text: "Ceder e buscar um médico imediatamente, comunicando a Alex seus receios. (Um ato de coragem e responsabilidade).",
                nextScene: 'consequencia_diagnostico_urgente',
                effects: { saude: -15, conhecimento: 15, relacao: 5, autonomia: 10 },
                preAction: () => { playerState.teveSintomas = true; }
            },
            {
                text: "Tentar se automedicar com algo que viu na internet ou continuar negando, evitando falar com Alex. (Sua autonomia está baixa, dificultando essa decisão).",
                nextScene: 'final_triste_tardia',
                effects: { saude: -40, conhecimento: -10, relacao: -20, autonomia: -15 },
                requiresAutonomia: 20 // Se autonomia muito baixa, é mais fácil cair nessa
            }
        ]
    },
    'consequencia_diagnostico_urgente': {
        text: "O médico confirma uma IST mais complexa. É devastador, mas a busca por ajuda precoce significa que o tratamento pode começar. Alex, embora chocad${playerGenderSuffix}, demonstra apoio: 'Vamos descobrir tudo o que precisamos e enfrentar isso. Estou aqui com você.'",
        educationalInfo: "ISTs como Sífilis ou HIV exigem tratamento e acompanhamento contínuo. O diagnóstico precoce e a adesão ao tratamento são cruciais para a qualidade de vida e para evitar a transmissão. O apoio social e do(a) parceiro(a) é vital.",
        type: 'narrative',
        nextScene: 'cenario5_manejo_ist',
        allowRandomEvent: true,
        preAction: () => {
            if (playerState.saude < 40) {
                playerState.istDiagnosticada = 'sifilis';
                playerState.relacao = Math.max(0, playerState.relacao - 10);
            } else {
                playerState.istDiagnosticada = 'hiv';
                playerState.relacao = Math.max(0, playerState.relacao - 20);
                playerState.autonomia = Math.max(0, playerState.autonomia - 10);
                playerState.alexReagiuBemDiagnostico = (playerState.relacao > 40); // Alex reage bem se a relação não estiver tão ruim
            }
        }
    },
    'cenario5_manejo_ist': {
        text: `--- Cenário 5: Convivendo com o Diagnóstico (\${istDiagnosticada}) ---\nCom o diagnóstico de \${istDiagnosticada}, sua vida muda. Há tratamento, mas também estigma e a necessidade de adaptações. Alex tem sido um pilar, ${playerState.alexReagiuBemDiagnostico ? 'oferecendo apoio incondicional.' : 'apesar de um certo abalo na relação.'} Um amigo próximo, Rafa, pergunta sobre seu estado de saúde, notando algo diferente em você. Como você lida?`,
        type: 'choice',
        allowRandomEvent: true,
        choices: [
            {
                text: "Decidir compartilhar a verdade com Rafa, explicando a importância do apoio e da informação. (Exige coragem e autonomia).",
                nextScene: 'final_resiliencia_apoio',
                effects: { saude: 5, conhecimento: 15, relacao: 10, autonomia: 20 },
                requiresAutonomia: 60,
                preAction: () => { playerState.revelouISTParaAmigo = true; }
            },
            {
                text: "Manter o diagnóstico em segredo, inventando uma desculpa vaga. (Você tem medo do julgamento, talvez influenciado pelo seu interesse em evitar problemas).",
                nextScene: 'final_isolamento_ansiedade_grave',
                effects: { saude: -10, conhecimento: -5, relacao: -10, autonomia: -10 },
                preAction: () => { playerState.revelouISTParaAmigo = false; }
            }
        ]
    },
    'cenario4_estigma': {
        text: "--- Cenário 4: Lidando com o Estigma (Pós-Diagnóstico) ---\nCom o diagnóstico de \${istDiagnosticada} e o início do tratamento, você precisa lidar com a IST e, em alguns casos, com o estigma social. Você ouve comentários ou percebe olhares. Alex te apoia: 'Não se preocupe com o que os outros pensam.' Como você, ${playerState.name}, reage a isso?",
        type: 'choice',
        allowRandomEvent: true,
        choices: [
            { text: "Se informa mais sobre a IST e busca apoio, mostrando que ISTs são condições de saúde como outras. Fala abertamente com Alex e amigos de confiança.", nextScene: 'final_reflexao_resiliencia', effects: { saude: 5, conhecimento: 25, relacao: 10, autonomia: 20 } },
            { text: "Se isola, com vergonha e medo do julgamento alheio, evitando Alex e amigos. (Seu interesse em um relacionamento ${playerState.interest === 'casual' ? 'casual pode levar a um afastamento emocional.' : 'sério está sob ameaça por causa do estigma interno.'})", nextScene: 'final_triste_isolamento', effects: { saude: -15, conhecimento: -5, relacao: -10, autonomia: -10 } }
        ]
    },
    'cenario4_estigma_adaptado': {
        text: "--- Cenário 4.5: O Desafio do Estigma (Após Diagnóstico Tardia) ---\nO diagnóstico de \${istDiagnosticada} e a necessidade de tratamento expõem você e Alex a comentários e olhares de julgamento. A situação é mais delicada devido ao atraso e o interesse em um relacionamento ${playerState.interest === 'long-term' ? 'sério, o que torna a pressão ainda maior.' : 'casual, talvez você não se sinta tão responsável, mas o peso é grande.'} Alex está visivelmente afetad${playerGenderSuffix}. Como vocês decidem lidar com isso?",
        type: 'choice',
        allowRandomEvent: true,
        choices: [
            { text: "Unir forças com Alex, se informarem e buscarem apoio mútuo, enfrentando o estigma juntos. (Um verdadeiro teste de parceria).", nextScene: 'final_reflexao_resiliencia_parceria', effects: { saude: 0, conhecimento: 20, relacao: 20, autonomia: 15 } },
            { text: "Começar a culpar um ao outro ou se afastarem devido à pressão e ao ressentimento.", nextScene: 'final_triste_ruptura', effects: { saude: -20, conhecimento: -5, relacao: -30, autonomia: -15 } }
        ]
    },
    // --- Novos Cenários para maior profundidade ---
    'cenario6_conversando_com_a_familia': {
        text: "--- Cenário 6: A Conversa Difícil com a Família ---\nSeu relacionamento com Alex está cada vez mais sério, especialmente se seu interesse é em um futuro a dois. Alex sugere: 'Acho que está na hora de conversar com meus pais sobre nós e sobre a importância da saúde sexual. O que você acha de virmos juntos?'",
        type: 'choice',
        allowRandomEvent: true,
        requiresRelacao: 70, // Só aparece se a relação estiver forte
        choices: [
            {
                text: "Aceitar e preparar-se para a conversa, mostrando maturidade e união.",
                nextScene: 'consequencia_familia_positiva',
                effects: { relacao: 20, autonomia: 10, conhecimento: 5 },
                preAction: () => { playerState.alexConversouPais = true; }
            },
            {
                text: "Recuar, dizendo que é 'muito cedo' ou 'não é necessário'. (Pode magoar Alex e mostrar imaturidade).",
                nextScene: 'consequencia_familia_negativa',
                effects: { relacao: -15, autonomia: -5 },
                preAction: () => { playerState.alexConversouPais = false; }
            }
        ]
    },
    'consequencia_familia_positiva': {
        text: "A conversa com os pais de Alex foi surpreendentemente boa. Eles valorizaram a honestidade e o cuidado de vocês com a saúde. A relação com a família de Alex se fortalece, e vocês se sentem ainda mais unidos e apoiados.",
        educationalInfo: "Ter o apoio familiar é um fator protetivo importante para a saúde e o bem-estar. Abrir o diálogo sobre sexo seguro e ISTs no ambiente familiar, quando possível, desmistifica tabus e promove um ambiente de cuidado.",
        type: 'narrative',
        nextScene: 'cenario7_impacto_vida_academica',
        allowRandomEvent: true
    },
    'consequencia_familia_negativa': {
        text: "Alex ficou visivelmente chatead${playerGenderSuffix} com sua recusa. 'Eu queria que tivéssemos esse apoio', ele/ela disse. A falta de comprometimento com essa etapa importante pode gerar insegurança no relacionamento.",
        educationalInfo: "A recusa em dar passos importantes em um relacionamento pode gerar insegurança e afastar o parceiro. Relacionamentos saudáveis exigem comprometimento e vulnerabilidade mútua, especialmente em tópicos sensíveis como a saúde sexual.",
        type: 'narrative',
        nextScene: 'cenario7_impacto_vida_academica',
        allowRandomEvent: true
    },
    'cenario7_impacto_vida_academica': {
        text: "--- Cenário 7: Desafios na Vida Acadêmica ---\nO estresse da universidade aumenta. Você tem provas e trabalhos, e a pressão começa a afetar seu bem-estar. Como ${playerState.name}, você lida com o equilíbrio entre a vida acadêmica, pessoal e a manutenção da sua saúde, especialmente após as experiências vividas?",
        type: 'choice',
        allowRandomEvent: true,
        choices: [
            {
                text: "Organizar-se, buscar apoio psicológico na universidade se necessário, e conversar abertamente com Alex sobre o estresse.",
                nextScene: 'final_equilibrio',
                effects: { saude: 10, conhecimento: 10, autonomia: 15, relacao: 5 }
            },
            {
                text: "Ignorar o estresse, focar apenas nos estudos e negligenciar o autocuidado e o relacionamento.",
                nextScene: 'final_sobrecarga',
                effects: { saude: -20, relacao: -15, autonomia: -10 }
            }
        ]
    },
    // --- Reviravolta: Dilema com um Antigo Contato ---
    'cenario8_antigo_contato': {
        text: "--- Cenário 8: O Dilema do Antigo Contato ---\nUm(a) ex-parceiro(a) casual de antes de Alex reaparece na sua vida, te convidando para sair. ${playerState.interest === 'long-term' ? 'Seu relacionamento sério com Alex está em um bom momento.' : 'Você valoriza a liberdade e a não-monogamia, mas Alex pode ter expectativas diferentes.'} Você percebe que esta pessoa nunca foi muito responsável com saúde sexual. Como você age?",
        type: 'choice',
        allowRandomEvent: true,
        requiresConhecimento: 50, // Requer algum conhecimento para tomar uma decisão informada
        preAction: () => {
            // Se o jogador tiver uma IST diagnosticada, a reviravolta é mais tensa
            if (playerState.istDiagnosticada && playerState.istDiagnosticada !== 'nenhuma') {
                gameScenes['cenario8_antigo_contato'].text = "--- Cenário 8: O Dilema do Antigo Contato ---\nUm(a) ex-parceiro(a) casual de antes de Alex reaparece na sua vida, te convidando para sair. Lidar com o diagnóstico de **\${istDiagnosticada}** já é um peso, e você se lembra que esta pessoa nunca foi muito responsável com saúde sexual. Como você age?";
            }
        },
        choices: [
            {
                text: "Recusar educadamente, explicando (ou não) que está em um relacionamento sério/focado em saúde e responsabilidade.",
                nextScene: 'consequencia_fidelidade',
                effects: { relacao: 10, autonomia: 10, saude: 5 }
            },
            {
                text: "Aceitar sair, mas com a intenção de apenas conversar e relembrar velhos tempos.",
                nextScene: 'consequencia_tentacao',
                effects: { relacao: -5, autonomia: 5 }
            },
            {
                text: "Considerar a possibilidade de algo casual, sem Alex saber, mas com preocupação sobre saúde.",
                nextScene: 'consequencia_risco_recai',
                effects: { saude: -15, relacao: -20, autonomia: -10 }
            }
        ]
    },
    'consequencia_fidelidade': {
        text: "Você manteve sua integridade e priorizou seu relacionamento e saúde. Alex percebe seu comprometimento e a confiança entre vocês se fortalece ainda mais. Você se sente bem com suas escolhas.",
        educationalInfo: "A fidelidade, seja ela em um relacionamento monogâmico ou em acordos de não-monogamia ética, é uma escolha que reflete valores e fortalece a confiança mútua. A priorização da saúde sexual e do parceiro é um pilar da responsabilidade.",
        type: 'narrative',
        nextScene: 'cenario9_rede_apoio_ampliada',
        allowRandomEvent: true
    },
    'consequencia_tentacao': {
        text: "Você saiu com o(a) ex. A conversa fluiu, mas o clima ficou um pouco estranho. Alex notou sua ausência e a desculpa evasiva. A confiança pode ser abalada, e a tentação de um deslize ficou no ar, mesmo que nada tenha acontecido. A falta de transparência cria rachaduras.",
        educationalInfo: "Pequenas omissões ou 'meias-verdades' podem corroer a confiança em um relacionamento. A honestidade é fundamental, mesmo quando é desconfortável, para evitar mal-entendidos e ressentimentos.",
        type: 'narrative',
        nextScene: 'cenario9_rede_apoio_ampliada',
        allowRandomEvent: true
    },
    'consequencia_risco_recai': {
        text: "Você cedeu à tentação e teve um encontro íntimo sem proteção, esperando que Alex não descobrisse. A culpa e o medo da exposição são esmagadores. Alex percebe seu comportamento estranho e a distância aumenta. Você arriscou sua saúde e o relacionamento.",
        educationalInfo: "A recaída em comportamentos de risco, especialmente após ter conhecimento sobre ISTs, é perigosa. O segredo e a desonestidade podem ter consequências devastadoras para a saúde física, mental e para o relacionamento.",
        type: 'narrative',
        nextScene: 'final_triste_ruptura_recai',
        allowRandomEvent: true
    },
    'cenario9_rede_apoio_ampliada': {
        text: "--- Cenário 9: Ampliando a Rede de Apoio ---\nVocê percebe a importância de ter pessoas em quem confiar. Um(a) colega da universidade, Bia, começa a falar sobre saúde mental e grupos de apoio. Ela te convida para uma palestra sobre bem-estar integral. Você está dispost${playerGenderSuffix} a ampliar sua rede de apoio e compartilhar suas experiências?",
        type: 'choice',
        allowRandomEvent: true,
        choices: [
            {
                text: "Aceitar o convite e se abrir para novas conexões e apoio. (Especialmente importante se você teve um diagnóstico de IST).",
                nextScene: 'final_resiliencia_apoio_ampliado',
                effects: { conhecimento: 15, autonomia: 15, relacao: 5, saude: 5 }
            },
            {
                text: "Agradecer, mas recusar, preferindo manter-se mais reservad${playerGenderSuffix}.",
                nextScene: 'final_isolamento_sutil',
                effects: { autonomia: -5 }
            }
        ]
    },


    // --- Finais do Jogo ---
    'final_feliz': {
        text: "--- FIM: Final Consciente e Saudável ---\nSuas escolhas de **responsabilidade**, **comunicação** e **prevenção** levaram a um relacionamento saudável e seguro com Alex. Vocês construíram uma base de confiança e cuidado mútuo, especialmente valiosa para quem busca um relacionamento ${playerState.interest === 'long-term' ? 'sério e duradouro' : playerState.interest === 'casual' ? 'honesto e livre de riscos' : 'com liberdade e segurança'}. Sua saúde está em dia e seu conhecimento sobre ISTs é sólido. **Parabéns por suas escolhas!**",
        educationalInfo: "A saúde sexual é um direito humano e envolve respeito, segurança e prazer. Ela engloba a prevenção de ISTs e gravidez, a comunicação aberta, o consentimento e o conhecimento do seu corpo e do seu parceiro(a). Este é o caminho para uma vida plena.",
        type: 'end'
    },
    'final_feliz_licoes': {
        text: "--- FIM: Final Feliz com Lições Aprendidas ---\nVocês superaram a fase de dúvidas e incertezas. A conversa e os testes fortaleceram o relacionamento com Alex, mostrando que é possível aprender e mudar para melhor. A prevenção e a comunicação agora são pilares do seu relacionamento, independentemente do interesse inicial. Uma prova de que é sempre tempo de aprender e crescer juntos.",
        educationalInfo: "Errar faz parte, mas aprender com os erros e buscar corrigir o rumo é a chave para a saúde e o bem-estar. Não hesite em buscar informações e ajuda, mesmo que tardia. O importante é o cuidado e a evolução.",
        type: 'end'
    },
    'final_alerta_geral': {
        text: "--- FIM: Final de Alerta (Oportunidade Perdida) ---\nSuas hesitações em discutir a proteção deixaram uma margem de risco. Embora nada grave tenha acontecido neste momento, a experiência serviu como um alerta. Alex ainda se sente um pouco inseguro(a) com a falta de diálogo, o que pode ser um problema para um relacionamento ${playerState.interest === 'long-term' ? 'sério' : 'com qualquer tipo de comprometimento'}. É crucial priorizar a prevenção e a comunicação para evitar problemas futuros. Fique atent${playerGenderSuffix}!",
        educationalInfo: "Não deixe a vergonha ou o constrangimento impedirem você de falar sobre sexo seguro. A sua saúde e a de seu parceiro(a) dependem disso. A prevenção é um ato de amor próprio e ao outro, e a comunicação é a base para a segurança.",
        type: 'end'
    },
    'final_alerta_testes': {
        text: "--- FIM: Final de Alerta (Testes Recusados) ---\nVocê subestimou a importância dos exames de rotina. Mesmo com o uso de camisinha, existe um pequeno risco, e alguns exames são importantes para a saúde geral. Alex ficou desapontado(a) com sua resistência, o que pode afetar a confiança para um relacionamento ${playerState.interest === 'long-term' ? 'sério' : 'mais livre'}. A falta de monitoramento pode atrasar um possível diagnóstico e tratamento. Uma oportunidade de prevenção foi perdida, e a confiança de Alex foi levemente abalada.",
        educationalInfo: "A maioria das ISTs não apresenta sintomas no início, ou os sintomas são confundidos com outras condições. A testagem regular é a única forma de saber seu status e buscar tratamento, protegendo a si e aos outros. Parceiros devem se cuidar juntos.",
        type: 'end'
    },
    'final_alerta_ansiedade': {
        text: "--- FIM: Final de Ansiedade Persistente ---\nA preocupação com a falta de proteção inicial se tornou uma sombra constante. Alex percebe sua angústia, mas a falta de diálogo impede que a situação seja resolvida. A ansiedade afeta seu bem-estar, e a incerteza paira sobre o relacionamento. Para alguém que busca ${playerState.interest === 'long-term' ? 'algo duradouro' : 'explorar sem rótulos'}, essa situação é desgastante. A lição é clara: a prevenção traz tranquilidade, a omissão traz angústia.",
        educationalInfo: "A saúde mental é tão importante quanto a física. A ansiedade pode ser um sinal de que algo precisa ser abordado. Buscar ajuda profissional e resolver problemas de saúde sexual é fundamental para o bem-estar integral e para a qualidade dos seus relacionamentos.",
        type: 'end'
    },
    'final_triste_tardia': {
        text: "--- FIM: Final de Reflexão Tardia e Consequências ---\nVocê esperou demais para buscar ajuda. Os sintomas pioraram e o tratamento se tornou mais complexo, com possíveis sequelas permanentes. Alex está frustrado(a) e magoado(a) com sua negação inicial. Para alguém que busca ${playerState.interest === 'long-term' ? 'um relacionamento sério, isso é um golpe duro' : 'apenas algo casual, as consequências são mais severas do que o esperado'}. Esta é uma lição dolorosa sobre a importância de agir rapidamente e não ignorar os sinais do corpo. A prevenção e o cuidado imediato são sempre o melhor caminho, e o atraso pode custar caro à sua saúde e ao seu relacionamento.",
        educationalInfo: "Retardar a busca por ajuda médica pode agravar uma IST e tornar o tratamento mais difícil, além de aumentar o risco de sequelas graves e transmissão para outras pessoas. Não hesite, procure ajuda. Priorize sua saúde.",
        type: 'end'
    },
    'final_reflexao_resiliencia': {
        text: "--- FIM: Final de Resiliência e Consciência ---\nMesmo com um diagnóstico de \${istDiagnosticada}, sua atitude proativa em buscar tratamento, informar Alex e enfrentar o estigma demonstra grande responsabilidade, força e autonomia. Você e Alex fortalecem o laço, enfrentando juntos. Para alguém que busca um relacionamento ${playerState.interest === 'long-term' ? 'sério' : 'com base na confiança'}, essa experiência foi um teste superado. Você está no caminho certo para gerenciar a situação e viver uma vida plena. Você aprendeu que o diagnóstico de uma IST não é o fim, mas o início de um caminho de cuidado e resiliência, com dignidade e informação.",
        educationalInfo: "Conviver com uma IST pode ser desafiador, mas o apoio médico, psicológico e de redes de apoio é fundamental. Não se deixe abater pelo estigma; você não está sozinho(a). A informação é sua maior ferramenta para viver bem e quebrar barreiras.",
        type: 'end'
    },
    'final_reflexao_resiliencia_parceria': {
        text: "--- FIM: Final de Resiliência e Parceria Fortalecida ---\nO desafio do diagnóstico de \${istDiagnosticada} foi superado juntos. Ao unir forças com Alex, vocês fortaleceram o relacionamento e a autonomia de ambos. A experiência, embora difícil, ensinou a importância do apoio mútuo, da comunicação e da resiliência diante das adversidades. Para quem busca ${playerState.interest === 'long-term' ? 'um relacionamento sério, essa parceria é inestimável.' : 'explorar a vida, essa conexão profunda foi inesperada, mas valiosa.'} Uma parceria fortalecida pelo conhecimento e cuidado, pronta para o que der e vier.",
        educationalInfo: "Um relacionamento saudável é construído na confiança, comunicação e apoio mútuo, especialmente em momentos de vulnerabilidade. Enfrentar desafios juntos fortalece os laços e o crescimento pessoal de cada um.",
        type: 'end'
    },
    'final_resiliencia_apoio': {
        text: "--- FIM: Final de Resiliência com Rede de Apoio ---\nMesmo com um diagnóstico desafiador como \${istDiagnosticada}, sua decisão de compartilhar a verdade com Rafa (seu amigo) e manter Alex ao seu lado mostra imensa força e autonomia. Você construiu uma rede de apoio sólida e está vivendo com dignidade e informação. Para quem busca ${playerState.interest === 'long-term' ? 'construir uma vida séria' : 'navegar pelas complexidades da vida'}, o apoio social é fundamental. Esta é a prova de que a vida continua, e que o apoio social é tão vital quanto o tratamento médico.",
        educationalInfo: "Compartilhar um diagnóstico de IST com pessoas de confiança pode aliviar o fardo emocional. Construir uma rede de apoio é fundamental para a saúde mental e para enfrentar o estigma. Você não precisa passar por isso sozinho(a).",
        type: 'end'
    },
    'final_isolamento_sutil': {
        text: "--- FIM: Final de Isolamento Sutil ---\nVocê optou por não expandir sua rede de apoio, preferindo manter as coisas mais privadas. Embora não haja um desastre imediato, a falta de conexão e apoio pode levar a um aumento da ansiedade e do sentimento de sobrecarga no futuro. Lembre-se, o ser humano é social e buscar ajuda é um sinal de força.",
        educationalInfo: "Manter uma rede de apoio social e emocional é crucial para a saúde mental. O isolamento, mesmo que por escolha, pode levar a um acúmulo de estresse e ansiedade. Aprender a pedir e aceitar ajuda é uma habilidade vital para o bem-estar.",
        type: 'end'
    },
    'final_triste_isolamento': {
        text: "--- FIM: Final de Isolamento e Sofrimento ---\nO estigma e o medo do julgamento fizeram com que você se isolasse, inclusive de Alex e seus amigos. Essa atitude afetou drasticamente sua saúde mental e o sucesso do tratamento. Você se sente sozinho(a) e sobrecarregado(a), especialmente para alguém que ${playerState.interest === 'long-term' ? 'sonhava com um futuro ao lado de alguém' : 'valoriza a liberdade, mas acabou preso(a) no isolamento'}. Lembre-se: ISTs são condições de saúde, e buscar ajuda é um ato de coragem, não de vergonha. O isolamento só piora a situação e impede a cura completa.",
        educationalInfo: "O estigma em relação às ISTs impede muitas pessoas de buscar ajuda e tratamento, levando ao sofrimento desnecessário. É importante desconstruir preconceitos e oferecer apoio, não julgamento, criando um ambiente de acolhimento e suporte.",
        type: 'end'
    },
    'final_isolamento_ansiedade_grave': {
        text: "--- FIM: Final de Isolamento e Ansiedade Aumentada ---\nVocê optou por manter o diagnóstico de \${istDiagnosticada} em segredo, até mesmo de seu amigo mais próximo e de Alex. A ansiedade de esconder a verdade consome você, e Alex percebe seu afastamento, sem entender o motivo. Para quem busca ${playerState.interest === 'long-term' ? 'um relacionamento sério, essa quebra de confiança é devastadora' : 'uma vida livre, a sensação de estar preso(a) pelo segredo é insuportável'}. A falta de comunicação e o isolamento prejudicam sua saúde mental e o relacionamento. Uma vida sob o peso do segredo é insustentável.",
        educationalInfo: "O segredo e o isolamento em relação a um diagnóstico de IST podem levar a graves problemas de saúde mental, como depressão e ansiedade. Abertura e honestidade, com apoio profissional, são fundamentais para o bem-estar e para a saúde de seus relacionamentos.",
        type: 'end'
    },
    'final_triste_ruptura': {
        text: "--- FIM: Final de Ruptura e Arrependimento ---\nA pressão do diagnóstico de \${istDiagnosticada} e o estigma levaram à culpa e ao afastamento entre você e Alex. O relacionamento não resistiu, e ambos ficaram com as cicatrizes da experiência. Para quem buscava ${playerState.interest === 'long-term' ? 'um futuro juntos, o sonho se desfez' : 'apenas algo casual, as consequências foram mais pesadas do que o esperado'}. O arrependimento de não ter agido de forma diferente no início é grande, e você se sente sozinho(a) e com a saúde comprometida. Esta é uma lição dolorosa sobre como a falta de comunicação e apoio pode destruir laços.",
        educationalInfo: "A responsabilidade sexual é individual e compartilhada. Culpabilizar ou se afastar em momentos de dificuldade pode ter um impacto profundo na vida de ambos. A empatia e o diálogo são cruciais para a saúde de qualquer relacionamento. Lembre-se, o cuidado é sempre a melhor escolha.",
        type: 'end'
    },
    'final_triste_ruptura_recai': {
        text: "--- FIM: Final de Ruptura por Falta de Honestidade ---\nSua decisão de se envolver com o(a) ex-parceiro(a) sem transparência veio à tona. Alex descobriu, e a confiança foi completamente quebrada. O relacionamento de vocês terminou em tristeza e ressentimento. Além disso, você colocou sua saúde em risco novamente. As consequências da desonestidade foram devastadoras para a sua vida pessoal e para a sua saúde. Uma lição dolorosa sobre a importância da integridade e da comunicação em qualquer tipo de relacionamento, seja ele ${playerState.interest === 'long-term' ? 'sério' : 'casual ou exploratório'}.",
        educationalInfo: "A desonestidade e a falta de respeito pelos acordos (explícitos ou implícitos) de um relacionamento, especialmente em questões de saúde sexual, podem destruir a confiança e levar ao término. A transparência é essencial para um relacionamento saudável.",
        type: 'end'
    },
    'final_equilibrio': {
        text: "--- FIM: Final de Equilíbrio e Crescimento ---\nVocê conseguiu gerenciar o estresse acadêmico, mantendo o autocuidado e o diálogo aberto com Alex. Sua resiliência e maturidade cresceram, mostrando que é possível equilibrar diferentes áreas da vida, mesmo em momentos de pressão. Sua saúde física e mental estão em harmonia, e o relacionamento com Alex é um porto seguro. Um exemplo de como a consciência e as escolhas certas levam a uma vida plena.",
        educationalInfo: "O equilíbrio entre vida acadêmica/profissional e vida pessoal, incluindo o autocuidado e a saúde sexual, é fundamental para o bem-estar integral. Buscar apoio e comunicar suas necessidades são estratégias eficazes para lidar com o estresse.",
        type: 'end'
    },
    'final_sobrecarga': {
        text: "--- FIM: Final de Sobrecarga e Desgaste ---\nAo negligenciar o estresse e o autocuidado em prol apenas dos estudos, sua saúde física e mental sofreram. O relacionamento com Alex se desgastou devido à sua distância e irritabilidade. Você percebe o peso da sobrecarga e a necessidade urgente de reavaliar suas prioridades. A vida não é feita só de estudos; o bem-estar integral é indispensável.",
        educationalInfo: "A negligência do autocuidado e da saúde mental leva à exaustão e ao desgaste em todas as áreas da vida, incluindo relacionamentos. É crucial priorizar o bem-estar e buscar um equilíbrio saudável para evitar o 'burnout' e preservar a qualidade de vida.",
        type: 'end'
    }
};

// --- Início do Jogo (Ajustado para a tela de criação) ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicia mostrando a tela de criação de personagem
    characterCreationScreen.style.display = 'flex';
    gameContent.style.display = 'none';
    updateStatusBar(); // Garante que a barra de status esteja no estado inicial, mesmo que oculta
});