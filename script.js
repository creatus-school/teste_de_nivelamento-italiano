document.addEventListener('DOMContentLoaded', () => {
    // Elementos das telas
    const introSection = document.getElementById('intro-section');
    const nameSection = document.getElementById('name-section');
    const lastNameSection = document.getElementById('lastName-section');
    const proficiencySection = document.getElementById('proficiency-section');
    const preparationSection = document.getElementById('preparation-section');
    const quizSection = document.getElementById('quiz-section');
    const resultsSection = document.getElementById('results-section');

    // Elementos da introdução
    const startButton = document.getElementById('startButton');

    // Elementos da coleta de nome
    const firstNameInput = document.getElementById('firstNameInput');
    const nextNameButton = document.getElementById('nextNameButton');

    // Elementos da coleta de sobrenome
    const lastNameQuestion = document.getElementById('lastNameQuestion');
    const lastNameInput = document.getElementById('lastNameInput');
    const nextLastNameButton = document.getElementById('nextLastNameButton');

    // Elementos da coleta de proficiência
    const proficiencyQuestion = document.getElementById('proficiencyQuestion');
    const proficiencyOptionsContainer = document.querySelector('.proficiency-options');
    const proficiencyOptionButtons = document.querySelectorAll('.proficiency-option');
    const nextProficiencyButton = document.getElementById('nextProficiencyButton');

    // Elementos da tela de preparação
    const preparationMessage = document.getElementById('preparationMessage');
    const startQuizButton = document.getElementById('startQuizButton');

    // Elementos do quiz
    const progressBarFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const youtubeVideoContainer = document.getElementById('youtube-video-container');
    const nextButton = document.getElementById('nextButton');

    // Elementos dos resultados
    const scoreDisplay = document.getElementById('scoreDisplay');
    const totalQuestionsDisplay = document.getElementById('totalQuestionsDisplay');
    const levelDisplay = document.getElementById('levelDisplay');
    const detailedFeedback = document.getElementById('detailedFeedback');
    const restartButton = document.getElementById('restartButton');

    let currentQuestionIndex = 0;
    let userAnswers = [];
    let score = 0;
    let userData = {
        firstName: '',
        lastName: '',
        proficiencyLevel: ''
    };

    // Variáveis do Cronômetro
    let timerInterval;
    let timeRemaining = 20 * 60; // 20 minutos em segundos

    // Cria o elemento visual do cronômetro na tela
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'timerDisplay';
    document.body.appendChild(timerDisplay);

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        timeRemaining = 15 * 60; // Reseta para 20 minutos
        timerDisplay.classList.remove('warning');
        timerDisplay.style.display = 'block';
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 60) {
                timerDisplay.classList.add('warning'); // Fica vermelho no último minuto
            }

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                alert('O tempo acabou! O teste será finalizado automaticamente.');
                calculateResults(); // Força o fim do teste
            }
        }, 1000);
    }

    // Controle de vídeo nativo
    let currentVideoElement = null;
    let videoOverlayElement = null;
    const videoPlayCounts = {}; // Objeto para armazenar a contagem de reproduções por questão

    // Função para embaralhar um array (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Estrutura de dados para as perguntas
    const questions = [
        {
            id: 'q1',
            type: 'grammar',
            topic: 'verb_tenses',
            question: "_________ the store. Do you want to come with me?",
            options: [
                { id: 'opt1a', text: "Am going to" },
                { id: 'opt1b', text: "I going to" },
                { id: 'opt1c', text: "I'm going to" },
                { id: 'opt1d', text: "Going to" }
            ],
            correctAnswerId: 'opt1c',
            explanation: "A forma correta para expressar uma ação futura planejada é 'I'm going to' seguido do verbo base.",
            youtubeVideoId: null
        },
        {
            id: 'q2',
            topic: 'past_simple',
            question: "Yesterday, I __________ to the cinema with my friends.",
            options: [
                { id: 'opt2a', text: "went" },
                { id: 'opt2b', text: "going" },
                { id: 'opt2c', text: "goed" },
                { id: 'opt2d', text: "go" }
            ],
            correctAnswerId: 'opt2a',
            explanation: "O passado simples de 'go' é 'went'.",
            youtubeVideoId: null
        },
        {
            id: 'q3',
            topic: 'present_simple',
            question: "My sister is a teacher. She __________ English at a school.",
            options: [
                { id: 'opt3a', text: "teaching" },
                { id: 'opt3b', text: "teaches" },
                { id: 'opt3c', text: "teach" },
                { id: 'opt3d', text: "teached" }
            ],
            correctAnswerId: 'opt3b',
            explanation: "Para a terceira pessoa do singular (she) no Present Simple, adiciona-se '-es' ao verbo 'teach'.",
            youtubeVideoId: null
        },
        {
            id: 'q4',
            topic: 'adjectives',
            question: "<strong>A:</strong> What's the weather like today?<br><strong>B:</strong> It's very ________.",
            options: [
                { id: 'opt4a', text: "hotter" },
                { id: 'opt4b', text: "hot" },
                { id: 'opt4c', text: "hottest" },
                { id: 'opt4d', text: "hotnes" }
            ],
            correctAnswerId: 'opt4b',
            explanation: "O adjetivo simples 'hot' é o correto para descrever o clima sem fazer comparação.",
            youtubeVideoId: null
        },
        {
            id: 'q5',
            topic: 'object pronouns',
            question: "Can you pass ________ the salt, please?",
            options: [
                { id: 'opt5a', text: "me" },
                { id: 'opt5b', text: "by" },
                { id: 'opt5c', text: "for" },
                { id: 'opt5d', text: "at" }
            ],
            correctAnswerId: 'opt5a',
            explanation: "A construção correta é 'pass me the salt', pois o pronome 'me', assim como os outros object pronouns existentes, é usado para indicar quem recebe a ação.",
            youtubeVideoId: null
        },
        {
            id: 'q6',
            topic: 'there to be',
            question: "_________ a man studying in the library.",
            options: [
                { id: 'opt6a', text: "There are" },
                { id: 'opt6b', text: "There were" },
                { id: 'opt6c', text: "There is" },
                { id: 'opt6d', text: "There aren't" }
            ],
            correctAnswerId: 'opt6c',
            explanation: "Usa-se 'there is' (forma presente de 'there to be') para substantivos singulares.",
            youtubeVideoId: null
        },
        {
            id: 'q7',
            topic: 'quantifiers',
            question: "How __________ sugar do you put in your coffee?",
            options: [
                { id: 'opt7a', text: "a lot of" },
                { id: 'opt7b', text: "many" },
                { id: 'opt7c', text: "much" },
                { id: 'opt7d', text: "a little" }
            ],
            correctAnswerId: 'opt7c',
            explanation: "'sugar', assim como café, feijão, água, entre outros, é um substantivo incontável, então usa-se 'much'.",
            youtubeVideoId: null
        },
        {
            id: 'q8',
            topic: 'present_perfect',
            question: "How many times __________ to Paris?",
            options: [
                { id: 'opt8a', text: "been you" },
                { id: 'opt8b', text: "you been" },
                { id: 'opt8c', text: "you have been" },
                { id: 'opt8d', text: "have you been" }
            ],
            correctAnswerId: 'opt8d',
            explanation: "A estrutura correta do Present Perfect em perguntas é 'Have/Has + sujeito + past participle'.",
            youtubeVideoId: null
        },
        {
            id: 'q9',
            topic: 'past_continuous',
            question: "Last weekend, while I __________ TV, the power suddenly went out.",
            options: [
                { id: 'opt9a', text: "watch" },
                { id: 'opt9b', text: "was watching" },
                { id: 'opt9c', text: "were watching" },
                { id: 'opt9d', text: "watched" }
            ],
            correctAnswerId: 'opt9b',
            explanation: "Para uma ação contínua no passado interrompida por outra, usa-se Past Continuous ('was watching').",
            youtubeVideoId: null
        },
        {
            id: 'q10',
            topic: 'modals',
            question: "You _______ smoke in this area. It's not allowed.",
            options: [
                { id: 'opt10a', text: "don't have to" },
                { id: 'opt10b', text: "have to" },
                { id: 'opt10c', text: "must" },
                { id: 'opt10d', text: "mustn't" }
            ],
            correctAnswerId: 'opt10d',
            explanation: "'Mustn't' é a contração de 'must + not' e indica proibição.",
            youtubeVideoId: null
        },
        {
            id: 'q11',
            topic: 'modals',
            question: "<strong>A:</strong> Did you study for tomorrow's exam?<br><strong>B:</strong> Yes, but I __________ dedicate more time to it this afternoon.",
            options: [
                { id: 'opt11a', text: "used to" },
                { id: 'opt11b', text: "have" },
                { id: 'opt11c', text: "should" },
                { id: 'opt11d', text: "need" }
            ],
            correctAnswerId: 'opt11c',
            explanation: "'Should' expressa uma recomendação, sugestão ou obrigação leve.",
            youtubeVideoId: null
        },
        {
            id: 'q12',
            topic: 'used_to',
            question: "<strong>A:</strong> Did you play any instrument when you were younger?<br><strong>B:</strong> Yes, I __________ play the piano regularly.",
            options: [
                { id: 'opt12a', text: "am used to" },
                { id: 'opt12b', text: "use to" },
                { id: 'opt12c', text: "using to" },
                { id: 'opt12d', text: "used to" }
            ],
            correctAnswerId: 'opt12d',
            explanation: "'Used to' é usado para hábitos ou estados passados que não são mais colocados em prática.",
            youtubeVideoId: null
        },
        {
            id: 'q13',
            topic: 'time',
            question: "<strong>A:</strong> What time is the meeting today?<br><strong>B:</strong> __________.",
            options: [
                { id: 'opt13a', text: "Sometimes in the morning" },
                { id: 'opt13b', text: "It's only at 3 p.m." },
                { id: 'opt13c', text: "Sorry, I did that" },
                { id: 'opt13d', text: "It's the same place" }
            ],
            correctAnswerId: 'opt13b',
            explanation: "A resposta 'It's only at 3 p.m.' é a única que responde diretamente à pergunta sobre o horário da reunião.",
            youtubeVideoId: null
        },
        {
            id: 'q14',
            topic: 'compound preposition / directions',
            question: "<strong>A:</strong> Where should I put the package?<br><strong>B:</strong> __________.",
            options: [
                { id: 'opt14a', text: "I like the blue one" },
                { id: 'opt14b', text: "Next to the door" },
                { id: 'opt14c', text: "Because it's heavy" },
                { id: 'opt14d', text: "Here. Help me" }
            ],
            correctAnswerId: 'opt14b',
            explanation: "'Next to the door' indica o local onde o pacote deve ser colocado.",
            youtubeVideoId: null
        },
        {
            id: 'q15',
            topic: 'superlatives',
            question: "Could you recommend a good movie for me to watch this weekend?",
            options: [
                { id: 'opt15a', text: "'Inception' is the most exciting movie ever!" },
                { id: 'opt15b', text: "'Inception' is more excitingest movie ever!" },
                { id: 'opt15c', text: "'Inception' is the more exciting movie ever!" },
                { id: 'opt15d', text: "'Inception' is more exciting movie ever!" }
            ],
            correctAnswerId: 'opt15a',
            explanation: "Para superlativos com adjetivos longos, usa-se 'the most + adjective'.",
            youtubeVideoId: null
        },
        {
            id: 'q16',
            topic: 'conditionals',
            question: "Why are you bringing an umbrella in a sunny day?",
            options: [
                { id: 'opt16a', text: "Sunny days make me happy." },
                { id: 'opt16b', text: "Only because it's sunny." },
                { id: 'opt16c', text: "Weather forecasts are usually accurate." },
                { id: 'opt16d', text: "If it rained, I would need the umbrella." }
            ],
            correctAnswerId: 'opt16d',
            explanation: "A resposta usa um condicional para explicar a precaução em um dia ensolarado.",
            youtubeVideoId: null
        },
        {
            id: 'q17',
            topic: 'future continuous',
            question: "What will you be doing next Friday?",
            options: [
                { id: 'opt17a', text: "My boyfriend never goes to my house this day." },
                { id: 'opt17b', text: "I will be studying for my exams." },
                { id: 'opt17c', text: "My mom likes to go to parks." },
                { id: 'opt17d', text: "I will play tennis every day." }
            ],
            correctAnswerId: 'opt17b',
            explanation: "A pergunta está no Future Continuous, e a resposta correta também usa essa estrutura para descrever uma ação contínua no futuro.",
            youtubeVideoId: null
        },
        {
            id: 'q18',
            topic: 'third onditional',
            question: "Why didn't you invest in that tech company a few years ago? Now it's one of the most important in the world.",
            options: [
                { id: 'opt18a', text: "Had I been aware of it, I'll invest for sure." },
                { id: 'opt18b', text: "If I had the knowledge, I invest earlier." },
                { id: 'opt18c', text: "If I had known, I would have invested." },
                { id: 'opt18d', text: "If I know about it, I will invest next time." }
            ],
            correctAnswerId: 'opt18c',
            explanation: "A frase usa o Third Conditional para expressar um arrependimento sobre uma situação passada hipotética.",
            youtubeVideoId: null
        },
        {
            id: 'q19',
            topic: 'question tags',
            question: "I don't know what to wear to the party.",
            options: [
                { id: 'opt19a', text: "Your friends always borrow you their clothes, don't they?" },
                { id: 'opt19b', text: "We need to get there on time for her birthday, don't we?" },
                { id: 'opt19c', text: "You'd better decide quickly. We don't want to be late, do we?" },
                { id: 'opt19d', text: "You could've asked your parents to pick you up earlier, couldn't you?" }
            ],
            correctAnswerId: 'opt19c',
            explanation: "A resposta oferece um conselho e usa uma question tag apropriada para a situação.",
            youtubeVideoId: null
        },
        {
            id: 'q20',
            topic: 'advice / modal verbs',
            question: "I couldn't make it to the meeting because I needed to fix my car.",
            options: [
                { id: 'opt20a', text: "I can't help you with that, because I was traveling." },
                { id: 'opt20b', text: "You can ask for help if you needed." },
                { id: 'opt20c', text: "In the past, public transportation are able to be a good option." },
                { id: 'opt20d', text: "We could find someone to fix it for you next time." }
            ],
            correctAnswerId: 'opt20d',
            explanation: "A resposta oferece uma possível solução para uma situação futura similar.",
            youtubeVideoId: null
        },
        {
            id: 'q21',
            topic: 'quantifiers',
            question: "Unfortunately, I don't have many books to read during my vacation.",
            options: [
                { id: 'opt21a', text: "Your parents must have a few books at home." },
                { id: 'opt21b', text: "I need a few comic books for my sister, maybe you could help me." },
                { id: 'opt21c', text: "My brother has little will to read, either." },
                { id: 'opt21d', text: "I think you'll have little time for reading." }
            ],
            correctAnswerId: 'opt21d',
            explanation: "A resposta sugere que a pessoa não terá muito tempo pra ler, por isso ela não deveria se preocupar com o fato de não ter muitos livros para ler durante suas férias.",
            youtubeVideoId: null
        },
        {
            id: 'q22',
            topic: '-ing / verbs',
            question: "We could feel the captivating melody of the orchestra ____________ through the concert hall.",
            options: [
                { id: 'opt22a', text: "envisioning" },
                { id: 'opt22b', text: "dissolving" },
                { id: 'opt22c', text: "resounding" }
            ],
            correctAnswerId: 'opt22c',
            explanation: "'Resounding' significa ecoar ou soar fortemente, o que se encaixa no contexto de uma melodia em um salão de concertos.",
            youtubeVideoId: null
        },
        {
            id: 'q23',
            topic: 'past / regular verbs',
            question: "He ________ a new language during his sabbatical in Europe.",
            options: [
                { id: 'opt23a', text: "learned" },
                { id: 'opt23b', text: "achieved" },
                { id: 'opt23c', text: "developed" }
            ],
            correctAnswerId: 'opt23a',
            explanation: "'Learned' (passado de 'aprender') é o verbo mais apropriado para adquirir uma nova língua.",
            youtubeVideoId: null
        },
        {
            id: 'q24',
            topic: 'verbs',
            question: "Make sure you ________ all the ingredients before you start cooking.",
            options: [
                { id: 'opt24a', text: "compile" },
                { id: 'opt24b', text: "accumulate" },
                { id: 'opt24c', text: "gather" }
            ],
            correctAnswerId: 'opt24c',
            explanation: "'Gather' (reunir) é o verbo mais comum para coletar ingredientes antes de cozinhar.",
            youtubeVideoId: null
        },
        {
            id: 'q25',
            topic: 'past / regular verbs',
            question: "Last night, my friends laughed so loudly that it ________ through the apartment, awakening my neighbors.",
            options: [
                { id: 'opt25a', text: "vanished" },
                { id: 'opt25b', text: "echoed" },
                { id: 'opt25c', text: "criticized" }
            ],
            correctAnswerId: 'opt25b',
            explanation: "'Echoed' (ecoou) descreve o som se espalhando e sendo repetido.",
            youtubeVideoId: null
        },
        {
            id: 'q26',
            topic: 'verbs',
            question: "It's essential to ________ the historical significance of the artwork during the museum tour.",
            options: [
                { id: 'opt26a', text: "seize" },
                { id: 'opt26b', text: "grasp" },
                { id: 'opt26c', text: "comprehend" }
            ],
            correctAnswerId: 'opt26c',
            explanation: "'Comprehend' (compreender, entender profundamente) é o vocabulário mais adequado para entender o significado de algo.",
            youtubeVideoId: null
        },
        {
            id: 'q27',
            topic: 'verbs',
            question: "It's important to ________ your plants regularly to help them grow strong and healthy.",
            options: [
                { id: 'opt27a', text: "inspect" },
                { id: 'opt27b', text: "examine" },
                { id: 'opt27c', text: "check" }
            ],
            correctAnswerId: 'opt27c',
            explanation: "'Check' (verificar) é o verbo mais comum para monitorar plantas regularmente.",
            youtubeVideoId: null
        },
        {
            id: 'q28',
            topic: '-ing / verbs',
            question: "The delicious aroma of freshly baked cookies is ________ throughout the entire kitchen.",
            options: [
                { id: 'opt28a', text: "spreading" },
                { id: 'opt28b', text: "concerning" },
                { id: 'opt28c', text: "awaiting" }
            ],
            correctAnswerId: 'opt28a',
            explanation: "'Spreading' (espalhando) descreve o aroma se difundindo pela cozinha.",
            youtubeVideoId: null
        },
        {
            id: 'q29',
            topic: 'present perfect',
            question: "Listen to <strong>Speaker #1</strong> and choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt29a', text: "Yes, I love rock concerts!" },
                { id: 'opt29b', text: "I have a few friends who play instruments." },
                { id: 'opt29c', text: "I usually stay at home during the weekends." },
                { id: 'opt29d', text: "Last year, I bought a new guitar." }
            ],
            correctAnswerId: 'opt29a',
            explanation: "A resposta mais natural à pergunta 'Have you ever been to a music festival?' é comentar que adora shows de rock.",
            videoSrc: 'q29.mp4'
        },
        {
            id: 'q30',
            topic: 'conversation',
            question: "Listen to <strong>Speaker #2</strong> and choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt30a', text: "I love drinking wine to relax after I get home." },
                { id: 'opt30b', text: "A cup of tea and soft music help me to sleep well." },
                { id: 'opt30c', text: "My mom cooks dinner for me almost every night." },
                { id: 'opt30d', text: "The boss at my company likes to hold meetings late at night." }
            ],
            correctAnswerId: 'opt30a',
            explanation: "A resposta relata o que é feito para relaxar depois de um longo dia de trabalho e não o que é feito para dormir melhor.",
            videoSrc: 'q30.mp4'
        },
        {
            id: 'q31',
            topic: 'conversation',
            question: "Listen to <strong>Speaker #3</strong> and choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt31a', text: "I never attend classes because I learn better alone." },
                { id: 'opt31b', text: "I like to drink some tea and sleep early every day." },
                { id: 'opt31c', text: "I create a study schedule and review my notes regularly." },
                { id: 'opt31d', text: "I enjoy playing sports after exams to help me release my stress." }
            ],
            correctAnswerId: 'opt31c',
            explanation: "A resposta descreve diretamente uma estratégia de estudo organizada.",
            videoSrc: 'q31.mp4'
        },
        {
            id: 'q32',
            topic: 'conversation',
            question: "Listen to <strong>Speaker #4</strong> and choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt32a', text: "That's great! You must be an expert at playing songs now." },
                { id: 'opt32b', text: "Maybe you're just not cut out for music." },
                { id: 'opt32c', text: "I hope you're not dedicating too much time to it." },
                { id: 'opt32d', text: "You need to practice your cooking skills more." }
            ],
            correctAnswerId: 'opt32b',
            explanation: "A resposta 'Maybe you're just not cut out for music.' sugere que talvez o interlocutor deva parar de tentar aprender violão e se dedicar a outro hobby, visto que ainda não consegue tocar nenhuma música.",
            videoSrc: 'q32.mp4'
        },
        {
            id: 'q33',
            topic: 'conversation',
            question: "Listen to <strong>Speaker #5</strong> and choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt33a', text: "I bought a new book to read." },
                { id: 'opt33b', text: "I had meetings all day." },
                { id: 'opt33c', text: "I'm thinking of planning a vacation soon." },
                { id: 'opt33d', text: "I love going to the gym after work." }
            ],
            correctAnswerId: 'opt33b',
            explanation: "Responde diretamente à pergunta explicando por que está exausto: reuniões o dia inteiro.",
            videoSrc: 'q33.mp4'
        },
        {
            id: 'q34',
            topic: 'conversation',
            question: "Listen to <strong>Speaker #6</strong> and choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt34a', text: "I'm not a fan of shopping for groceries." },
                { id: 'opt34b', text: "Tell me all about it when you get home." },
                { id: 'opt34c', text: "I have a dentist appointment next week." },
                { id: 'opt34d', text: "I've been trying a new recipe lately." }
            ],
            correctAnswerId: 'opt34b',
            explanation: "É a resposta que continua naturalmente a conversa, mostrando interesse no que aconteceu.",
            videoSrc: 'q34.mp4'
        },
        {
            id: 'q35',
            topic: 'conversation',
            question: "Listen to <strong>Speaker #7</strong> and choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt35a', text: "I'm planning a road trip for next month." },
                { id: 'opt35b', text: "I bought a new bicycle recently." },
                { id: 'opt35c', text: "Congratulations! How was the test?" },
                { id: 'opt35d', text: "I prefer using public transportation." }
            ],
            correctAnswerId: 'opt35c',
            explanation: "É a resposta mais natural: parabeniza e pergunta sobre o teste.",
            videoSrc: 'q35.mp4'
        },
        {
            id: 'q36',
            topic: `l'amicizia su internet`,
            question: "Ascolta l'audio e rispondi alla domanda:<br><br><i>Secondo lo speaker, qual è il paradosso delle amicizie nell'era digitale?</i>",
            options: [
                { id: 'opt36a', text: "Più siamo connessi digitalmente, più abbiamo il coraggio di affrontare conversazioni difficili." },
                { id: 'opt36b', text: "I messaggi e i vocali hanno sostituito completamente le conversazioni faccia a faccia in modo positivo." },
                { id: 'opt36c', text: "La connettività digitale crea una sensazione di vicinanza che non sempre corrisponde a una vera intimità." }
            ],
            correctAnswerId: 'opt36c',
            explanation: "O interlocutor questiona se a sensação de estar conectado digitalmente corresponde a uma proximidade real, visto que a conectividade digital paradoxalmente parece reduzir o coragem para conversas verdadeiras.",
            videoSrc: 'q36.mp4'
        },
        {
            id: 'q37',
            topic: 'i piccoli negozi in città',
            question: "Ascolta l'audio e rispondi alla domanda:<br><br><i>Qual è la preoccupazione principale dello speaker riguardo alla scomparsa dei negozi di quartiere?</i>",
            options: [
                { id: 'opt37a', text: "La perdita di spazi di incontro e del senso di comunità nei quartieri urbani." },
                { id: 'opt37b', text: "Il cambiamento nelle abitudini alimentari della popolazione urbana." },
                { id: 'opt37c', text: "La difficoltà di trovare prodotti freschi e di qualità nei supermercati moderni causata dalla concorrenza del commercio online." }
            ],
            correctAnswerId: 'opt37a',
            explanation: "A preocupação central não é o que se compra, mas o que se perde em termos de convivência e sentido de comunidade quando os pequenos negócios desaparecem em decorrência da evolução dos centros urbanos.",
            videoSrc: 'q37.mp4'
        },
        {
            id: 'q38',
            topic: 'il rispetto per il cibo',
            question: "Ascolta l'audio e rispondi alla domanda:<br><br><i>Qual è la riflessione principale dello speaker nel suo discorso?</i>",
            options: [
                { id: 'opt38a', text: "I supermercati dovrebbero abbassare i prezzi per ridurre gli sprechi alimentari." },
                { id: 'opt38b', text: "Abbiamo perso il rispetto per il cibo e produciamo troppo spreco nella vita quotidiana." },
                { id: 'opt38c', text: "Le generazioni più anziane avevano abitudini alimentari più sane rispetto alle giovani." }
            ],
            correctAnswerId: 'opt38b',
            explanation: "A ideia central é a desconexão com o valor do alimento e o excesso de desperdício na sociedade atual.",
            videoSrc: 'q38.mp4'
        },
        {
            id: 'q39',
            topic: 'la diversità tra le persone',
            question: "Ascolta l'audio e rispondi alla domanda:<br><br><i>Quale distinzione fondamentale fa lo speaker nel suo discorso sulla diversità culturale nelle città?</i>",
            options: [
                { id: 'opt39a', text: "La differenza tra il semplice convivere con l'altro e il riconoscerne genuinamente il valore." },
                { id: 'opt39b', text: "La differenza tra città grandi e piccole nel modo di accogliere culture diverse." },
                { id: 'opt39c', text: "Il contrasto tra culture che si integrano facilmente e culture che faticano ad adattarsi." }
            ],
            correctAnswerId: 'opt39a',
            explanation: "O interlocutor distingue claramente entre a mera coexistência e o reconhecimento genuíno do valor que o outro traz consigo. Para ele, é essa curiosidade real pelo outro que transforma a diversidade de um problema a ser gerido numa verdadeira riqueza coletiva.",
            videoSrc: 'q39.mp4'
        },
        {
            id: 'q40',
            topic: 'il tempo libero',
            question: "Ascolta l'audio e rispondi alla domanda:<br><br><i>Quale fenomeno sociale osserva lo speaker nel suo discorso?</i>",
            options: [
                { id: 'opt40a', text: "La tendenza delle nuove generazioni a dedicare troppo tempo ai social media." },
                { id: 'opt40b', text: "Il fatto che i giovani di oggi abbiano meno tempo libero rispetto alle generazioni precedenti." },
                { id: 'opt40c', text: "La pressione contemporanea a riempire ogni momento con attività produttive, a scapito del vero riposo." }
            ],
            correctAnswerId: 'opt40c',
            explanation: "A interlocutora observa que o tempo livre perdeu seu significado original e se transformou em algo a ser preenchido e justificado, frequentemente por meio de postagens e documentação nas redes sociais. Ela aponta que a capacidade de simplesmente não fazer nada foi esquecida ou se tornou fonte de culpa.",
            videoSrc: 'q40.mp4'
        }
    ];

    userAnswers = new Array(questions.length).fill(null);

    // Função para transição de telas com fading
    function showScreen(screenToShow) {
        const allScreens = [introSection, nameSection, lastNameSection, proficiencySection, preparationSection, quizSection, resultsSection];

        allScreens.forEach(screen => {
            screen.style.opacity = '0';
        });

        setTimeout(() => {
            allScreens.forEach(screen => {
                screen.classList.add('hidden');
            });

            screenToShow.classList.remove('hidden');

            setTimeout(() => {
                screenToShow.style.opacity = '1';
            }, 50);
        }, 500);
    }

    // --- Lógica das Telas Iniciais ---
    startButton.addEventListener('click', () => {
        showScreen(nameSection);
        firstNameInput.focus();
    });

    document.addEventListener('keydown', (event) => {
        if (!introSection.classList.contains('hidden') && event.key === 'Enter') {
            startButton.click();
        }
    });

    firstNameInput.addEventListener('input', () => {
        nextNameButton.disabled = firstNameInput.value.trim() === '';
    });

    firstNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !nextNameButton.disabled) {
            event.preventDefault();
            nextNameButton.click();
        }
    });

    nextNameButton.addEventListener('click', () => {
        userData.firstName = firstNameInput.value.trim();
        lastNameQuestion.textContent = `${userData.firstName}, qual é seu sobrenome?`;
        showScreen(lastNameSection);
        lastNameInput.focus();
    });

    lastNameInput.addEventListener('input', () => {
        nextLastNameButton.disabled = lastNameInput.value.trim() === '';
    });

    lastNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !nextLastNameButton.disabled) {
            event.preventDefault();
            nextLastNameButton.click();
        }
    });

    nextLastNameButton.addEventListener('click', () => {
        userData.lastName = lastNameInput.value.trim();
        proficiencyQuestion.textContent = `${userData.firstName}, você se considera em qual nível de proficiência da língua inglesa:`;
        showScreen(proficiencySection);
    });

    proficiencyOptionButtons.forEach(button => {
        button.addEventListener('click', () => {
            proficiencyOptionButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            userData.proficiencyLevel = button.dataset.level;
            nextProficiencyButton.disabled = false;
        });
    });

    document.addEventListener('keydown', (event) => {
        if (!proficiencySection.classList.contains('hidden') && event.key === 'Enter' && !nextProficiencyButton.disabled) {
            event.preventDefault();
            nextProficiencyButton.click();
        }
    });

    nextProficiencyButton.addEventListener('click', () => {
        preparationMessage.innerHTML = `Seu teste irá começar.<br>Prepare-se! &#128074;&#127995;&#128521;`;
        showScreen(preparationSection);
    });

    startQuizButton.addEventListener('click', () => {
        showScreen(quizSection);
        loadQuestion();
        startTimer();
    });

    document.addEventListener('keydown', (event) => {
        if (!preparationSection.classList.contains('hidden') && event.key === 'Enter') {
            event.preventDefault();
            startQuizButton.click();
        }
    });

    // --- Lógica do Quiz ---
    function loadQuestion() {
        const question = questions[currentQuestionIndex];
        questionText.innerHTML = question.question;
        optionsContainer.innerHTML = '';

        youtubeVideoContainer.innerHTML = '';
        currentVideoElement = null;
        videoOverlayElement = null;

        if (question.videoSrc) {
            youtubeVideoContainer.style.display = 'block';

            const video = document.createElement('video');
            video.src = question.videoSrc;
            video.controls = false; // Remove controles nativos
            video.preload = 'auto';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.backgroundColor = 'black';
            video.disablePictureInPicture = true; // Previne PiP
            video.controlsList = "nodownload nofullscreen noremoteplayback"; // Restrições extras

            // Previne menu de contexto (botão direito) para evitar que ativem controles
            video.addEventListener('contextmenu', e => e.preventDefault());

            // Previne atalhos de teclado (espaço para pausar, setas para avançar)
            video.addEventListener('keydown', e => e.preventDefault());

            // Impede cliques no vídeo de pausarem
            video.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            // Inicializa a contagem de reproduções se não existir
            if (videoPlayCounts[question.id] === undefined) {
                videoPlayCounts[question.id] = 0;
            }

            // Força a continuar tocando se for pausado acidentalmente (exceto se acabou)
            video.addEventListener('pause', () => {
                if (!video.ended && videoPlayCounts[question.id] < 2 && videoOverlayElement.style.display === 'none') {
                    video.play();
                }
            });

            // Bloqueia qualquer tentativa de avanço ou retrocesso
            let supposedCurrentTime = 0;
            video.addEventListener('timeupdate', () => {
                if (!video.seeking) {
                    supposedCurrentTime = video.currentTime;
                }
            });
            video.addEventListener('seeking', () => {
                // Se tentar pular, volta pro tempo real
                let delta = video.currentTime - supposedCurrentTime;
                if (Math.abs(delta) > 0.01) {
                    video.currentTime = supposedCurrentTime;
                }
            });

            const handleVideoEnded = () => {
                if (videoPlayCounts[question.id] < 2) {
                    videoPlayCounts[question.id]++;
                    updateVideoOverlay(question.id);
                }
            };

            video.addEventListener('ended', handleVideoEnded);

            youtubeVideoContainer.appendChild(video);
            currentVideoElement = video;

            // Cria o overlay
            const overlay = document.createElement('div');
            overlay.classList.add('video-overlay');
            overlay.innerHTML = '<div class="video-overlay-message"></div>';
            youtubeVideoContainer.appendChild(overlay);
            videoOverlayElement = overlay;

            overlay.addEventListener('click', () => {
                if (videoPlayCounts[question.id] < 2) {
                    if (currentVideoElement) {
                        currentVideoElement.currentTime = 0;
                        supposedCurrentTime = 0; // Reseta o controle de tempo
                        currentVideoElement.play();
                        videoOverlayElement.style.display = 'none';
                    }
                }
            });

            // Estado inicial do overlay
            updateVideoOverlay(question.id);

        } else {
            youtubeVideoContainer.style.display = 'none';
        }

        const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const shuffledOptions = shuffleArray([...question.options]);

        shuffledOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.dataset.optionId = option.id;
            button.addEventListener('click', () => selectOption(option.id));

            const letterSpan = document.createElement('span');
            letterSpan.classList.add('option-letter');
            letterSpan.textContent = optionLetters[index];

            const textSpan = document.createElement('span');
            textSpan.classList.add('option-text');
            textSpan.textContent = option.text;

            button.appendChild(letterSpan);
            button.appendChild(textSpan);
            optionsContainer.appendChild(button);
        });

        if (userAnswers[currentQuestionIndex]) {
            const selectedOptionButton = optionsContainer.querySelector(`[data-option-id="${userAnswers[currentQuestionIndex]}"]`);
            if (selectedOptionButton) {
                selectedOptionButton.classList.add('selected');
            }
        }

        updateProgressBar();
        updateNavigationButtons();
    }

    function updateVideoOverlay(questionId) {
        if (!videoOverlayElement) return;

        const msgDiv = videoOverlayElement.querySelector('.video-overlay-message');
        const plays = videoPlayCounts[questionId] || 0;
        const playsLeft = 2 - plays;

        if (playsLeft > 0) {
            msgDiv.innerHTML = `Clique para assistir ao vídeo<br>(Restam ${playsLeft} reproduções)`;
            videoOverlayElement.classList.remove('disabled');
            videoOverlayElement.style.display = 'flex';
            videoOverlayElement.style.cursor = 'pointer';
        } else {
            msgDiv.textContent = 'Limite de reproduções atingido';
            videoOverlayElement.classList.add('disabled');
            videoOverlayElement.style.display = 'flex';
            videoOverlayElement.style.cursor = 'not-allowed';
            videoOverlayElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Escurece para indicar bloqueio
        }
    }

    function selectOption(optionId) {
        optionsContainer.querySelectorAll('.option-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        const selectedButton = optionsContainer.querySelector(`[data-option-id="${optionId}"]`);
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
        userAnswers[currentQuestionIndex] = optionId;
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBarFill.style.width = `${progress}%`;
        progressText.textContent = `Questão ${currentQuestionIndex + 1} de ${questions.length}`;
    }

    function updateNavigationButtons() {
        nextButton.textContent = currentQuestionIndex === questions.length - 1 ? 'Finalizar Teste' : 'Próxima';
    }

    function calculateResults() {
        clearInterval(timerInterval);
        timerDisplay.style.display = 'none';
        score = 0;
        const incorrectQuestions = [];

        questions.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            const originalCorrectOption = q.options.find(opt => opt.id === q.correctAnswerId);

            if (userAnswer === originalCorrectOption.id) {
                score++;
            } else {
                const userAnswerText = q.options.find(opt => opt.id === userAnswer)?.text || "Não respondida";
                const correctAnswerText = originalCorrectOption.text;

                incorrectQuestions.push({
                    question: q.question,
                    userAnswer: userAnswerText,
                    correctAnswer: correctAnswerText,
                    explanation: q.explanation,
                    type: q.type,
                    topic: q.topic
                });
            }
        });

        displayResults(incorrectQuestions);
    }

    function displayResults(incorrectQuestions) {
        showScreen(resultsSection);

        scoreDisplay.textContent = score;
        totalQuestionsDisplay.textContent = questions.length;

        let level = '';
        if (score === questions.length) {
            level = 'C2 - Fluente';
        } else if (score >= questions.length * 0.8) {
            level = 'C1 - Avançado';
        } else if (score >= questions.length * 0.6) {
            level = 'B2 - Pré-avançado';
        } else if (score >= questions.length * 0.4) {
            level = 'B1 - Intermediário';
        } else if (score >= questions.length * 0.2) {
            level = 'A2 - Básico';
        } else {
            level = 'A1 - Iniciante';
        }
        levelDisplay.textContent = level;

        detailedFeedback.innerHTML = '';
        if (incorrectQuestions.length === 0) {
            detailedFeedback.innerHTML = '<p>Parabéns! Você acertou todas as questões.</p>';
        } else {
            incorrectQuestions.forEach(item => {
                const feedbackItem = document.createElement('div');
                feedbackItem.classList.add('feedback-item');
                feedbackItem.innerHTML = `
                    <p class="question-feedback"><strong>Questão:</strong> ${item.question}</p>
                    <p class="user-answer-feedback"><strong>Sua resposta:</strong> ${item.userAnswer}</p>
                    <p class="correct-answer-feedback"><strong>Resposta correta:</strong> ${item.correctAnswer}</p>
                    <p class="explanation-feedback"><strong>Explicação:</strong> ${item.explanation}</p>
                    <p><strong>Tipo:</strong> ${item.type} | <strong>Tópico:</strong> ${item.topic}</p>
                `;
                detailedFeedback.appendChild(feedbackItem);
            });
        }
    }

    nextButton.addEventListener('click', () => {
        if (userAnswers[currentQuestionIndex] === null) {
            alert('Por favor, selecione uma opção antes de prosseguir.');
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            calculateResults();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!quizSection.classList.contains('hidden') && event.key === 'Enter' && !nextButton.disabled) {
            event.preventDefault();
            nextButton.click();
        }
    });

    restartButton.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerDisplay.style.display = 'none';
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        score = 0;
        userData = { firstName: '', lastName: '', proficiencyLevel: '' };
        firstNameInput.value = '';
        lastNameInput.value = '';
        proficiencyOptionButtons.forEach(btn => btn.classList.remove('selected'));
        nextNameButton.disabled = true;
        nextLastNameButton.disabled = true;
        nextProficiencyButton.disabled = true;

        showScreen(introSection);
    });

    document.addEventListener('keydown', (event) => {
        if (!resultsSection.classList.contains('hidden') && event.key === 'Enter' && !restartButton.disabled) {
            event.preventDefault();
            restartButton.click();
        }
    });

    // Inicia na tela de introdução
    showScreen(introSection);
});
