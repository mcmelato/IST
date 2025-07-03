// Elementos HTML
const narrativeTextElement = document.getElementById('narrative-text');
const educationalMessageElement = document.getElementById('educational-message');
const choicesContainer = document.getElementById('choices-container');
const continueButton = document.getElementById('continue-button');
const restartButton = document.getElementById('restart-button');

// Elementos da barra de status
const statusSaude = document.getElementById('status-saude');
const statusConhecimento = document.getElementById('status-conhecimento');
const statusRelacao = document.getElementById('status-relacao');

// --- Variáveis de Jogo ---
let playerState = {
    saude: 100,       // Percentual de saúde, de 0 a 100
    conhecimento: 0,  // Nível de conhecimento sobre ISTs, de 0 a 100
    relacao: 50       // Qualidade do relacionamento, de 0 a 100
};

let currentSceneId = 'intro'; // ID da cena atual
let isTyping = false; // Flag para controlar o efeito de digitação

// --- Funções Auxiliares de UI ---
function updateStatusBar() {
    statusSaude.textContent = playerState.saude;
    statusConhecimento.textContent = playerState.conhecimento;
    statusRelacao.textContent = playerState.relacao;

    statusSaude.style.color = playerState.saude < 50 ? '#dc3545' : '#28a745';
    statusConhecimento.style.color = playerState.conhecimento < 30 ? '#ffc107' : '#17a2b8';
    statusRelacao.style.color = playerState.relacao < 30 ? '#dc3545' : '#17a2b8';
}

// Simula o efeito de digitação do texto
function typeWriter(text, element, i = 0) {
    isTyping = true;
    if (i < text.length) {
        element.textContent += text.charAt(i);
        setTimeout(() => typeWriter(text, element, i + 1), 30); // Velocidade da digitação
    } else {
        isTyping = false;
        const scene = gameScenes[currentSceneId];
        // Exibe mensagem educativa se houver
        if (scene.educationalInfo) {
            showEducationalMessage(scene.educationalInfo);
        }

        // Determina qual botão exibir após a digitação
        if (scene.type === 'narrative') {
            continueButton.style.display = 'block';
        } else if (scene.type === 'choice') {
            displayChoices(scene.choices); // Chama displayChoices para exibir os botões de escolha
        } else if (scene.type === 'end') {
            restartButton.style.display = 'block';
        }
    }
}

// Exibe as mensagens educativas
function showEducationalMessage(message) {
    educationalMessageElement.textContent = message;
    educationalMessageElement.style.display = 'block';
}

// Oculta a mensagem educativa
function hideEducationalMessage() {
    educationalMessageElement.style.display = 'none';
    educationalMessageElement.textContent = '';
}

// Cria e exibe os botões de escolha
function displayChoices(choices) {
    choicesContainer.innerHTML = ''; // Limpa escolhas anteriores
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice-button');
        button.textContent = choice.text;
        button.addEventListener('click', () => makeChoice(choice)); // Passa o objeto choice
        choicesContainer.appendChild(button);
    });
    choicesContainer.style.display = 'flex'; // Garante que o contêiner de escolhas seja visível
    continueButton.style.display = 'none'; // Esconde o botão de continuar (importante para cenas de escolha)
}

// --- Lógica do Jogo ---

// Função principal para processar a escolha e avançar
function makeChoice(choice) {
    if (isTyping) return; // Impede cliques enquanto o texto está sendo digitado

    // Aplica os efeitos da escolha nas variáveis de estado do jogador
    if (choice.effects) {
        if (choice.effects.saude !== undefined) playerState.saude = Math.max(0, Math.min(100, playerState.saude + choice.effects.saude));
        if (choice.effects.conhecimento !== undefined) playerState.conhecimento = Math.max(0, Math.min(100, playerState.conhecimento + choice.effects.conhecimento));
        if (choice.effects.relacao !== undefined) playerState.relacao = Math.max(0, Math.min(100, playerState.relacao + choice.effects.relacao));
    }
    updateStatusBar(); // Atualiza a barra de status

    currentSceneId = choice.nextScene;
    loadScene(currentSceneId);
}

// Carrega e exibe uma nova cena
function loadScene(sceneId) {
    const scene = gameScenes[sceneId];
    if (!scene) {
        console.error('Cena não encontrada:', sceneId);
        return;
    }

    // Limpa e oculta elementos anteriores
    narrativeTextElement.textContent = '';
    hideEducationalMessage();
    choicesContainer.innerHTML = '';
    choicesContainer.style.display = 'none'; // Sempre esconde as escolhas ao carregar uma nova cena
    continueButton.style.display = 'none'; // Sempre esconde o continuar ao carregar uma nova cena
    restartButton.style.display = 'none';

    // Inicia o efeito de digitação do novo texto
    typeWriter(scene.text, narrativeTextElement);
}

// --- Cenários do Jogo ---
const gameScenes = {
    'intro': {
        text: "Bem-vindo(a) ao jogo 'Consciência e Escolhas'. Você é um(a) estudante universitário(a) com a vida cheia de planos. Recentemente, você começou a namorar uma pessoa muito especial. Suas decisões neste relacionamento terão um grande impacto no seu futuro e saúde.",
        type: 'narrative',
        nextScene: 'cenario1_encontro'
    },
    'cenario1_encontro': {
        text: "--- Cenário 1: O Início do Relacionamento ---\nVocês estão cada vez mais próximos. A intimidade está crescendo. Uma noite, em um momento de paixão, a questão da proteção surge. O que você faz?",
        // O type deve ser 'choice' para que as opções apareçam automaticamente após a digitação do texto.
        // Se fosse 'narrative', ele esperaria o clique no "Continuar".
        type: 'choice',
        choices: [
            { text: "Sugerir o uso de camisinha e conversar sobre proteção.", nextScene: 'consequencia_comunicacao', effects: { saude: 0, conhecimento: 20, relacao: 15 } },
            { text: "Deixar as coisas acontecerem, esperando que a outra pessoa tome a iniciativa.", nextScene: 'consequencia_risco_inicial', effects: { saude: -10, conhecimento: 5, relacao: -5 } },
            { text: "Ignorar o assunto e focar apenas no momento.", nextScene: 'consequencia_risco_grave', effects: { saude: -25, conhecimento: -5, relacao: -10 } }
        ]
    },
    'consequencia_comunicacao': {
        text: "Ótima escolha! A **comunicação** é fundamental. Vocês conversam abertamente sobre sexo seguro e decidem usar camisinha. Isso demonstra respeito mútuo e cuidado com a saúde de ambos.",
        educationalInfo: "A camisinha (preservativo) é o método mais eficaz para prevenir ISTs e gravidez indesejada quando usada corretamente.",
        type: 'narrative',
        nextScene: 'cenario2_testes'
    },
    'consequencia_risco_inicial': {
        text: "Você hesitou em levantar o assunto... A paixão do momento tomou conta, e a proteção acabou sendo deixada de lado. Essa falta de iniciativa pode trazer riscos futuros.",
        educationalInfo: "A falta de diálogo sobre sexo seguro pode expor ambos a riscos desnecessários. A responsabilidade é compartilhada.",
        type: 'narrative',
        nextScene: 'final_alerta_geral'
    },
    'consequencia_risco_grave': {
        text: "Você optou por ignorar a questão da proteção. Ter relações sexuais sem proteção é um risco direto à saúde. Essa atitude pode levar a consequências graves no futuro.",
        educationalInfo: "Relações sexuais sem proteção são a principal forma de transmissão de ISTs. A prevenção é a melhor forma de se cuidar.",
        type: 'narrative',
        nextScene: 'cenario3_sintomas'
    },
    'cenario2_testes': {
        text: "--- Cenário 2: Prevenção e Cuidado Contínuo ---\nAlguns meses se passaram. Vocês continuam se protegendo, mas também sabem da importância dos exames. É sugerido que ambos façam exames de rotina para ISTs, como prevenção. O que você faz?",
        type: 'choice',
        choices: [
            { text: "Concordar e agendar os exames juntos, incentivando a parceria.", nextScene: 'final_feliz', effects: { saude: 5, conhecimento: 20, relacao: 15 } },
            { text: "Achar que não é necessário, já que estão se protegendo e não há sintomas.", nextScene: 'final_alerta_testes', effects: { saude: -5, conhecimento: -10, relacao: -5 } }
        ]
    },
    'cenario3_sintomas': {
        text: "--- Cenário 3: Sinais de Alerta ---\nAlgum tempo depois, você começa a sentir alguns sintomas estranhos (dor, coceira, ferida). O medo e a preocupação tomam conta. Você se arrepende de não ter se protegido. O que você faz?",
        type: 'choice',
        choices: [
            { text: "Buscar um médico imediatamente e fazer os exames necessários.", nextScene: 'consequencia_diagnostico_proativo', effects: { saude: -10, conhecimento: 15, relacao: 5 } },
            { text: "Tentar pesquisar na internet ou esperar para ver se os sintomas desaparecem sozinhos.", nextScene: 'final_triste_tardia', effects: { saude: -30, conhecimento: -5, relacao: -15 } }
        ]
    },
    'consequencia_diagnostico_proativo': {
        text: "Ao buscar ajuda rapidamente, você descobre que contraiu uma IST. É um choque, mas por ter agido cedo, o tratamento é mais simples e eficaz. Você também comunica seu parceiro(a) e o incentiva a buscar ajuda e testagem.",
        educationalInfo: "Ao menor sinal de sintoma, procure um profissional de saúde. O diagnóstico precoce e o tratamento adequado são cruciais para a cura ou controle da IST e para prevenir a transmissão.",
        type: 'narrative',
        nextScene: 'cenario4_estigma'
    },
    'cenario4_estigma': {
        text: "--- Cenário 4: Lidando com o Estigma ---\nCom o diagnóstico e o início do tratamento, você precisa lidar com a IST e, em alguns casos, com o estigma. Você ouve comentários ou percebe olhares que o(a) fazem sentir-se mal. Como você reage?",
        type: 'choice',
        choices: [
            { text: "Se informa mais sobre a IST e busca apoio, mostrando que ISTs são condições de saúde como outras.", nextScene: 'final_reflexao_resiliencia', effects: { saude: 5, conhecimento: 25, relacao: 10 } },
            { text: "Se isola, com vergonha e medo do julgamento alheio.", nextScene: 'final_triste_isolamento', effects: { saude: -15, conhecimento: -5, relacao: -10 } }
        ]
    },

    // --- Finais do Jogo ---
    'final_feliz': {
        text: "--- FIM: Final Consciente e Saudável ---\nSuas escolhas de **responsabilidade**, **comunicação** e **prevenção** levaram a um relacionamento saudável e seguro. Você e seu parceiro(a) construíram uma base de confiança e cuidado mútuo. Lembre-se: Sua saúde sexual é parte fundamental do seu bem-estar geral. Parabéns por suas escolhas!",
        educationalInfo: "A saúde sexual é um direito humano e envolve respeito, segurança e prazer. Ela engloba a prevenção de ISTs e gravidez, a comunicação aberta e o consentimento.",
        type: 'end'
    },
    'final_alerta_geral': {
        text: "--- FIM: Final de Alerta ---\nSuas hesitações em discutir a proteção deixaram uma margem de risco. Embora nada grave tenha acontecido neste momento, a experiência serviu como um alerta. É crucial priorizar a prevenção e a comunicação para evitar problemas futuros.",
        educationalInfo: "Não deixe a vergonha ou o constrangimento impedirem você de falar sobre sexo seguro. A sua saúde e a do seu parceiro(a) dependem disso.",
        type: 'end'
    },
    'final_alerta_testes': {
        text: "--- FIM: Final de Alerta (Testes) ---\nVocê subestimou a importância dos exames. Mesmo com o uso de camisinha, existe um pequeno risco, e alguns exames são importantes para a saúde geral. A falta de monitoramento pode atrasar um possível diagnóstico e tratamento, que seriam mais simples se descobertos cedo.",
        educationalInfo: "A maioria das ISTs não apresenta sintomas no início, ou os sintomas são confundidos com outras condições. A testagem regular é a única forma de saber seu status e buscar tratamento.",
        type: 'end'
    },
    'final_triste_tardia': {
        text: "--- FIM: Final de Reflexão Tardia ---\nVocê esperou demais para buscar ajuda. Os sintomas pioraram e o tratamento se tornou mais complexo. Esta é uma lição dolorosa sobre a importância de agir rapidamente e não ignorar os sinais do corpo. A prevenção e o cuidado imediato são sempre o melhor caminho.",
        educationalInfo: "Retardar a busca por ajuda médica pode agravar uma IST e tornar o tratamento mais difícil, além de aumentar o risco de sequelas e transmissão para outras pessoas.",
        type: 'end'
    },
    'final_reflexao_resiliencia': {
        text: "--- FIM: Final de Resiliência ---\nMesmo com um diagnóstico, sua atitude proativa em buscar tratamento, informar seu parceiro(a) e enfrentar o estigma demonstra grande responsabilidade e força. Você está no caminho certo para gerenciar a situação e viver uma vida plena. Você aprendeu que o diagnóstico de uma IST não é o fim, mas o início de um caminho de cuidado e resiliência.",
        educationalInfo: "Conviver com uma IST pode ser desafiador, mas o apoio médico, psicológico e de redes de apoio é fundamental. Não se deixe abater pelo estigma; você não está sozinho(a).",
        type: 'end'
    },
    'final_triste_isolamento': {
        text: "--- FIM: Final de Isolamento ---\nO estigma e o medo do julgamento fizeram com que você se isolasse e deixasse de buscar apoio. Essa atitude pode afetar sua saúde mental e o sucesso do tratamento. Lembre-se: ISTs são condições de saúde, e buscar ajuda é um ato de coragem, não de vergonha.",
        educationalInfo: "O estigma em relação às ISTs impede muitas pessoas de buscar ajuda e tratamento. É importante desconstruir preconceitos e oferecer apoio, não julgamento.",
        type: 'end'
    }
};

// --- Event Listeners ---
continueButton.addEventListener('click', () => {
    // Garante que não haja cliques enquanto o texto está digitando
    if (isTyping) return;

    const scene = gameScenes[currentSceneId];
    if (scene.nextScene) {
        loadScene(scene.nextScene);
    }
});

restartButton.addEventListener('click', () => {
    if (isTyping) return;

    // Reinicia as variáveis de estado
    playerState = {
        saude: 100,
        conhecimento: 0,
        relacao: 50
    };
    updateStatusBar(); // Atualiza a barra de status para o estado inicial
    currentSceneId = 'intro';
    loadScene(currentSceneId);
});

// --- Início do Jogo ---
// Carrega a primeira cena quando a página é carregada
document.addEventListener('DOMContentLoaded', () => {
    updateStatusBar(); // Garante que a barra de status apareça corretamente no início
    loadScene(currentSceneId);
});