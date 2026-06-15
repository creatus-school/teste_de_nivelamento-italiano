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
            topic: 'presente dei verbi regolari',
            question: "La mia amica ___________ una pizza deliziosa per la cena.",
            options: [
                { id: 'opt1a', text: "cucinare" },
                { id: 'opt1b', text: "cucina" },
                { id: 'opt1c', text: "cucinano" },
                { id: 'opt1d', text: "cucini" }
            ],
            correctAnswerId: 'opt1b',
            explanation: "Concordância verbal no presente do indicativo para a terceira pessoa do singular ('lei' - a minha amiga).",
            youtubeVideoId: null
        },
        {
            id: 'q2',
            topic: 'passato prossimo',
            question: "Ieri sera, noi ___________ un bel film alla televisione.",
            options: [
                { id: 'opt2a', text: "guardiamo" },
                { id: 'opt2b', text: "guardavamo" },
                { id: 'opt2c', text: "abbiamo guardato" },
                { id: 'opt2d', text: "guarderemo" }
            ],
            correctAnswerId: 'opt2c',
            explanation: "Uso do passato prossimo para uma ação concluída no passado, que se forma com o auxiliar 'avere' e o participio passato do verbo principal.",
            youtubeVideoId: null
        },
        {
            id: 'q3',
            topic: 'verbi riflessivi',
            question: "Il mio gatto _______________ sempre sul divano quando dorme.",
            options: [
                { id: 'opt3a', text: "stà" },
                { id: 'opt3b', text: "è" },
                { id: 'opt3c', text: "rimane" },
                { id: 'opt3d', text: "si sdraia" }
            ],
            correctAnswerId: 'opt3d',
            explanation: "Verbo reflexivo 'sdraiarsi' (deitar-se) no presente do indicativo, terceira pessoa do singular.",
            youtubeVideoId: null
        },
        {
            id: 'q4',
            topic: 'preposizioni articolate',
            question: "La borsa è ____________ tavolo.",
            options: [
                { id: 'opt4a', text: "sotto" },
                { id: 'opt4b', text: "in" },
                { id: 'opt4c', text: "sul" },
                { id: 'opt4d', text: "con" }
            ],
            correctAnswerId: 'opt4c',
            explanation: "Uso da preposição 'su' (sobre) + o artigo 'il' (masculino) = 'sul' e é usado para indicar posição.",
            youtubeVideoId: null
        },
        {
            id: 'q5',
            topic: 'verbi irregolari al presente',
            question: "Quanti anni ________ tu?",
            options: [
                { id: 'opt5a', text: "hai" },
                { id: 'opt5b', text: "sei" },
                { id: 'opt5c', text: "ha" },
                { id: 'opt5d', text: "avere" }
            ],
            correctAnswerId: 'opt5a',
            explanation: "Uso do verbo 'avere' (ter) para perguntar a idade, na segunda pessoa do singular.",
            youtubeVideoId: null
        },
        {
            id: 'q6',
            topic: 'pronomi personali',
            question: "<strong>A:</strong> Di dove sei?<br><strong>B:</strong> ________ sono di Roma.",
            options: [
                { id: 'opt6a', text: "Tu" },
                { id: 'opt6b', text: "Lei" },
                { id: 'opt6c', text: "Io" },
                { id: 'opt6d', text: "Noi" }
            ],
            correctAnswerId: 'opt6c',
            explanation: "Pronome pessoal sujeito 'io' (eu) para responder à pergunta sobre a origem de acordo com o contexto.",
            youtubeVideoId: null
        },
        {
            id: 'q7',
            topic: 'aggettivi',
            question: "Vorrei __________ informazioni sul corso di italiano.",
            options: [
                { id: 'opt7a', text: "qualche" },
                { id: 'opt7b', text: "alcune" },
                { id: 'opt7c', text: "un po' di" },
                { id: 'opt7d', text: "dei" }
            ],
            correctAnswerId: 'opt7b',
            explanation: "'Un po' di' é usado para indicar uma quantidade indefinida de substantivos incontáveis ou plurais. 'Informazioni' é plural.",
            youtubeVideoId: null
        },
        {
            id: 'q8',
            topic: `l'imperfetto indicativo`,
            question: "Quando ero bambino, __________ spesso al parco con i miei genitori.",
            options: [
                { id: 'opt8a', text: "andavo" },
                { id: 'opt8b', text: "sono andato" },
                { id: 'opt8c', text: "andrei" },
                { id: 'opt8d', text: "andrò" }
            ],
            correctAnswerId: 'opt8a',
            explanation: "Uso do imperfetto indicativo para descrever uma ação habitual ou repetida no passado.",
            youtubeVideoId: null
        },
        {
            id: 'q9',
            topic: `periodo ipotetico della realtà`,
            question: "Se ________ tempo, ti aiuterò con i compiti.",
            options: [
                { id: 'opt8a', text: "avrò" },
                { id: 'opt8b', text: "avessi" },
                { id: 'opt8c', text: "ho" },
                { id: 'opt8d', text: "avrei" }
            ],
            correctAnswerId: 'opt8a',
            explanation: "Periodo ipotetico del primo tipo (realidade): 'se + futuro simples, futuro simples'",
            youtubeVideoId: null
        },
        {
            id: 'q10',
            topic: 'presente dei verbi irregolari',
            question: "Non __________ uscire stasera, sono troppo stanco.",
            options: [
                { id: 'opt9a', text: "posso" },
                { id: 'opt9b', text: "devo" },
                { id: 'opt9c', text: "voglio" },
                { id: 'opt9d', text: "so" }
            ],
            correctAnswerId: 'opt9c',
            explanation: "Uso do verbo modal 'potere' (poder) para expressar incapacidade ou impossibilidade.",
            youtubeVideoId: null
        },
        {
            id: 'q11',
            topic: 'verbo esserci',
            question: "<strong>A:</strong> Hai già visitato Firenze?<br><strong>B:</strong> No, non ____________ ancora stata.",
            options: [
                { id: 'opt10a', text: "ci sono" },
                { id: 'opt10b', text: "ci sono mai" },
                { id: 'opt10c', text: "ci sono ancora" },
                { id: 'opt10d', text: "ci sono stata" }
            ],
            correctAnswerId: 'opt10a',
            explanation: "Uso do pronome 'ci' (lá) e concordância do participio passato com o sujeito feminino ('stata').",
            youtubeVideoId: null
        },
        {
            id: 'q12',
            topic: `periodo ipotetico della possibilità`,
            question: "Se _________ più soldi, comprerei una casa più grande.",
            options: [
                { id: 'opt12a', text: "avessi" },
                { id: 'opt12b', text: "ho" },
                { id: 'opt12c', text: "avrò" },
                { id: 'opt12d', text: "avrei" }
            ],
            correctAnswerId: 'opt12a',
            explanation: "Periodo ipotetico della possibilità: 'se + imperfeito do subjuntivo, condicional simples'",
            youtubeVideoId: null
        },
        {
            id: 'q13',
            topic: 'congiuntivo',
            question: "<strong>A:</strong> Cosa pensi del nuovo ristorante in centro?<br><strong>B:</strong> _________________.",
            options: [
                { id: 'opt13a', text: "Penso che sarà molto buono." },
                { id: 'opt13b', text: "Penso che è molto buono." },
                { id: 'opt13c', text: "Penso che è stato molto buono." },
                { id: 'opt13d', text: "Penso che sia molto buono." }
            ],
            correctAnswerId: 'opt13d',
            explanation: "Verbos de opinião e crença como 'credere' exigem o subjuntivo presente na oração subordinada.",
            youtubeVideoId: null
        },
        {
            id: 'q14',
            topic: 'congiuntivo',
            question: "È importante che tu ____________ la verità.",
            options: [
                { id: 'opt14a', text: "dici" },
                { id: 'opt14b', text: "dica" },
                { id: 'opt14c', text: "dirai" },
                { id: 'opt14d', text: "dicessi" }
            ],
            correctAnswerId: 'opt14b',
            explanation: "Expressões de importância ou necessidade ('è importante che') exigem o subjuntivo.",
            youtubeVideoId: null
        },
        {
            id: 'q15',
            topic: 'congiuntivo',
            question: "Nonostante ___________ piovendo, siamo usciti a fare una passeggiata.",
            options: [
                { id: 'opt15a', text: "è" },
                { id: 'opt15b', text: "fosse" },
                { id: 'opt15c', text: "stia" },
                { id: 'opt15d', text: "sia" }
            ],
            correctAnswerId: 'opt15c',
            explanation: "A conjunção 'nonostante' (apesar de) exige o subjuntivo.",
            youtubeVideoId: null
        },
        {
            id: 'q16',
            topic: `periodo ipotetico dell'irrealtà`,
            question: "Se ___________ studiato di più, avresti superato l'esame. ",
            options: [
                { id: 'opt16a', text: "avrai" },
                { id: 'opt16b', text: "avresti" },
                { id: 'opt16c', text: "hai" },
                { id: 'opt16d', text: "avessi" }
            ],
            correctAnswerId: 'opt16d',
            explanation: "Periodo ipotetico dell'irrealtà: 'se + trapassato do subjuntivo, condizionale'.",
            youtubeVideoId: null
        },
        {
            id: 'q17',
            topic: 'discorso indiretto',
            question: "Mi ha chiesto ___________ fossi andato.",
            options: [
                { id: 'opt17a', text: "se" },
                { id: 'opt17b', text: "che" },
                { id: 'opt17c', text: "dove" },
                { id: 'opt17d', text: "quando" }
            ],
            correctAnswerId: 'opt17c',
            explanation: "Discurso indireto com pergunta, mantendo o advérbio interrogativo 'dove'.",
            youtubeVideoId: null
        },
        {
            id: 'q18',
            topic: 'congiuntivo',
            question: "È probabile che __________ domani.",
            options: [
                { id: 'opt18a', text: "piove" },
                { id: 'opt18b', text: "piova" },
                { id: 'opt18c', text: "pioverà" },
                { id: 'opt18d', text: "piovesse" }
            ],
            correctAnswerId: 'opt18b',
            explanation: "Expressões de probabilidade ou incerteza ('è probabile che') exigem o subjuntivo.",
            youtubeVideoId: null
        },
        {
            id: 'q19',
            topic: 'question tags',
            question: "Non c'è nessuno __________ possa aiutarmi.",
            options: [
                { id: 'opt19a', text: "che" },
                { id: 'opt19b', text: "il quale" },
                { id: 'opt19c', text: "cui" },
                { id: 'opt19d', text: "chi" }
            ],
            correctAnswerId: 'opt19a',
            explanation: "Pronome relativo 'che' para introduzir uma oração subordinada adjetiva.",
            youtubeVideoId: null
        },
        {
            id: 'q20',
            topic: 'congiuntivo imperfetto',
            question: "Vorrei che tu __________ più attento.",
            options: [
                { id: 'opt20a', text: "eri" },
                { id: 'opt20b', text: "sei" },
                { id: 'opt20c', text: "sarai" },
                { id: 'opt20d', text: "fossi" }
            ],
            correctAnswerId: 'opt20d',
            explanation: "Verbos de desejo ou vontade ('vorrei che') exigem o subjuntivo imperfeito.",
            youtubeVideoId: null
        },
        {
            id: 'q21',
            topic: `'si' impersonale`,
            question: "Si dice che __________ un nuovo film di quel regista.",
            options: [
                { id: 'opt21a', text: "uscirà" },
                { id: 'opt21b', text: "uscisse" },
                { id: 'opt21c', text: "esca" },
                { id: 'opt21d', text: "è uscito" }
            ],
            correctAnswerId: 'opt21a',
            explanation: "A construção impessoal 'si dice che' pode ser seguida pelo indicativo quando a ação é vista como provável ou futura.",
            youtubeVideoId: null
        },
        {
            id: 'q22',
            topic: 'vocabolario',
            question: "Il suo discorso, __________ di passione, ha commosso l'intera platea.",
            options: [
                { id: 'opt22a', text: "impregnato" },
                { id: 'opt22b', text: "intriso" },
                { id: 'opt22c', text: "colmo" }
            ],
            correctAnswerId: 'opt22b',
            explanation: "'Intriso' (imbuído, saturado) é o termo mais preciso e formal para descrever algo preenchido ou permeado por um sentimento ou qualidade.",
            youtubeVideoId: null
        },
        {
            id: 'q23',
            topic: 'vocabolario',
            question: "Nonostante le difficoltà, ha dimostrato una __________ resilienza.",
            options: [
                { id: 'opt23a', text: "ammirevole" },
                { id: 'opt23b', text: "notevole" },
                { id: 'opt23c', text: "considerevole" }
            ],
            correctAnswerId: 'opt23a',
            explanation: "O contexto destaca a superação de obstáculos difíceis, uma qualidade moral que suscita profunda admiração e aprovação. Usar 'notável' indicaria apenas uma grande dose de resiliência, enquanto 'admirável' confere ao gesto o devido valor de elogio.",
            youtubeVideoId: null
        },
        {
            id: 'q24',
            topic: 'vocabolario',
            question: "La sua capacità di ____________ tra diverse culture è davvero impressionante.",
            options: [
                { id: 'opt24a', text: "destreggiarsi" },
                { id: 'opt24b', text: "barcamenarsi" },
                { id: 'opt24c', text: "navigare" }
            ],
            correctAnswerId: 'opt24c',
            explanation: "Nesse contexto, 'navigare', em seu sentido figurado, é o termo mais preciso para indicar a capacidade de agir com competência, destreza e consciência, como, por exemplo, diferentes culturas, situações sociais ou contextos de trabalho.",
            youtubeVideoId: null
        },
        {
            id: 'q25',
            topic: 'vocabolario',
            question: "L'artista ha saputo ______________ l'essenza della bellezza in un'unica opera.",
            options: [
                { id: 'opt25a', text: "catturare" },
                { id: 'opt25b', text: "cogliere" },
                { id: 'opt25c', text: "racchiudere" }
            ],
            correctAnswerId: 'opt25c',
            explanation: "O verbo 'racchiudere' sugere a ideia de conter algo vasto ou complexo (como “a essência da beleza”) dentro de um limite preciso (como “uma única obra”). Ele transmite perfeitamente a imagem de um processo de síntese.",
            youtubeVideoId: null
        },
        {
            id: 'q26',
            topic: 'vocabolario',
            question: "È fondamentale ______________ le fonti prima di diffondere notizie.",
            options: [
                { id: 'opt26a', text: "controllare" },
                { id: 'opt26b', text: "verificare" },
                { id: 'opt26c', text: "accertare" }
            ],
            correctAnswerId: 'opt26b',
            explanation: "'Verificare' significa verificar a veracidade ou a autenticidade de algo por meio de provas ou confirmações. É o termo padrão quando se fala em “fact-checking” ou na confiabilidade de fontes de uma informação.",
            youtubeVideoId: null
        },
        {
            id: 'q27',
            topic: 'vocabolario',
            question: "La sua eloquenza era tale da _____________ l'attenzione di tutti i presenti.",
            options: [
                { id: 'opt27a', text: "calamitare" },
                { id: 'opt27b', text: "attrarre" },
                { id: 'opt27c', text: "focalizzare" }
            ],
            correctAnswerId: 'opt27a',
            explanation: "'Calamitare' deriva de “calamita” (ímã) e transmite perfeitamente a ideia de uma força irresistível que atrai para si, tornando-o o termo ideal para descrever uma eloquência excepcional que mantém o público literalmente “grudado” no orador.",
            youtubeVideoId: null
        },
        {
            id: 'q28',
            topic: 'vocabolario',
            question: "Il progetto è stato ______________ a causa di problemi finanziari imprevisti.",
            options: [
                { id: 'opt28a', text: "accantonato" },
                { id: 'opt28b', text: "sospeso" },
                { id: 'opt28c', text: "rimandato" }
            ],
            correctAnswerId: 'opt28b',
            explanation: "'sospeso' indica que o projeto foi suspenso temporariamente, com a intenção ou a esperança de retomá-lo no futuro, quando os problemas forem resolvidos.",
            youtubeVideoId: null
        },
        {
            id: 'q29',
            topic: 'conversazione',
            question: "Ascolta l'<strong>Interlocutore #1</strong> e scegli l'opzione migliore per ciò che segue nella conversazione.",
            options: [
                { id: 'opt29a', text: "Davvero?! Te lo avevo detto che ti sarebbe piaciuto!" },
                { id: 'opt29b', text: "Sì, la storia romana è sempre stata una materia interessante a scuola." },
                { id: 'opt29c', text: "Anch'io devo ancora comprare qualcosa da leggere questo mese." },
                { id: 'opt29d', text: "Beh, i romanzi storici di solito sono molto lunghi, no?" }
            ],
            correctAnswerId: 'opt29a',
            explanation: "A resposta do segundo interlocutor apresenta tom de entusiasmo, demonstrando sincronia com o entusiasmo da pessoa no áudio e interesse genuíno pelo que ela acabou de dizer.",
            videoSrc: 'q29.mp4'
        },
        {
            id: 'q30',
            topic: 'conversazione',
            question: "Ascolta l'<strong>Interlocutore #2</strong> e scegli l'opzione migliore per ciò che segue nella conversazione.",
            options: [
                { id: 'opt30a', text: "Non mi piacciono i colloqui di lavoro." },
                { id: 'opt30b', text: "Hai preparato le risposte alle domande del colloquio?" },
                { id: 'opt30c', text: "Spero che tu ottenga il lavoro." },
                { id: 'opt30d', text: "Figurati, andrà tutto bene." }
            ],
            correctAnswerId: 'opt30d',
            explanation: "A intenção do segundo interlocutor é de se sensibilizar pela preocupação do amigo e tentar tranquilizá-lo sobre a entrevista.",
            videoSrc: 'q30.mp4'
        },
        {
            id: 'q31',
            topic: 'conversazione',
            question: "Ascolta l'<strong>Interlocutore #3</strong> e scegli l'opzione migliore per ciò che segue nella conversazione.",
            options: [
                { id: 'opt31a', text: "Anch'io preferisco evitare il traffico uscendo prima la mattina." },
                { id: 'opt31b', text: "Potresti mandargli un messaggio di scuse e proporre un nuovo incontro al più presto." },
                { id: 'opt31c', text: "Il traffico è sempre così in questa città, non c'è niente da fare." },
                { id: 'opt31d', text: "La prossima volta prendi la metropolitana, è molto più veloce." }
            ],
            correctAnswerId: 'opt31b',
            explanation: "A reação do interlocutor foi sugerir uma possível solução para o problema; ou seja, ele não foca apenas na questão do trânsito e não ignora a preocupação central do colega em talvez ter perdido um cliente.",
            videoSrc: 'q31.mp4'
        },
        {
            id: 'q32',
            topic: 'conversazione',
            question: "Ascolta l'<strong>Interlocutore #4</strong> e scegli l'opzione migliore per ciò che segue nella conversazione.",
            options: [
                { id: 'opt32a', text: "Lo so. La cucina giapponese è molto popolare in tutto il mondo." },
                { id: 'opt32b', text: "Dai, la prima volta capita a tutti! La prossima volta ti viene sicuramente meglio." },
                { id: 'opt32c', text: "È comprensibile. Anch'io preferisco ordinare da fuori quando sono stanco." },
                { id: 'opt32d', text: "Forse dovresti comprare degli utensili da cucina migliori la prossima volta." }
            ],
            correctAnswerId: 'opt32b',
            explanation: "A interlocutora está relatando uma experiência frustrante na cozinha, com um tom autodepreciativo. A reação do outro interlocutor, que acolhe essa frustração de forma empática e encorajadora, sem desviar do assunto, é a frase 'Dai, la prima volta capita a tutti! La prossima volta ti viene sicuramente meglio.'",
            videoSrc: 'q32.mp4'
        },
        {
            id: 'q33',
            topic: 'conversazione',
            question: "Ascolta l'<strong>Interlocutore #5</strong> e scegli l'opzione migliore per ciò che segue nella conversazione.",
            options: [
                { id: 'opt33a', text: "Che situazione difficile. Hai pensato di chiedergli un chiarimento su questo?" },
                { id: 'opt33b', text: "Anch'io a volte ho problemi senza motivi con i colleghi sul lavoro." },
                { id: 'opt33c', text: "Forse il tuo collega non sapeva che questo progetto era tuo." },
                { id: 'opt33d', text: "L'università è un'esperienza importante che ci aiuta ad imparare le cose nuove." }
            ],
            correctAnswerId: 'opt33a',
            explanation: "A reação do segundo interlocutor que mais se adequa ao contexto da preocupação do primeiro interlocutor é aquela que reconhece a dificuldade da situação e sugere uma ação concreta e construtiva, sem minimizar o problema nem desviar do assunto central.",
            videoSrc: 'q33.mp4'
        },
        {
            id: 'q34',
            topic: 'conversazione',
            question: "Ascolta l'<strong>Interlocutore #6</strong> e scegli l'opzione migliore per ciò che segue nella conversazione.",
            options: [
                { id: 'opt34a', text: "Anche a me piace il caffè." },
                { id: 'opt34b', text: "Dobbiamo andarci insieme un giorno." },
                { id: 'opt34c', text: "Preferisco il tè durante la mattina." },
                { id: 'opt34d', text: "Non bevo caffè molto spesso perché mi fa male." }
            ],
            correctAnswerId: 'opt34b',
            explanation: "É uma resposta entusiástica que sugere uma ação futura em conjunto, demonstrando harmonia com o contexto e expressando interesse na descoberta do interlocutor.",
            videoSrc: 'q34.mp4'
        },
        {
            id: 'q35',
            topic: 'conversazione',
            question: "Ascolta l'<strong>Interlocutore #7</strong> e scegli l'opzione migliore per ciò che segue nella conversazione.",
            options: [
                { id: 'opt35a', text: "Non mi piacciono i viaggi avventurosi quando sono in vacanza." },
                { id: 'opt35b', text: "Sai che non è molto divertente andare da solo in luoghi sconosciuti." },
                { id: 'opt35c', text: "Che avventura! Hai già pianificato l'itinerario?" },
                { id: 'opt35d', text: "È un continente molto grande da conoscere solo in alcune settimane." }
            ],
            correctAnswerId: 'opt35c',
            explanation: "É uma resposta que está de acordo com o contexto da fala do interlocutor e expressa curiosidade sobre os planos de viagem, incentivando o interlocutor a compartilhar mais detalhes.",
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
        proficiencyQuestion.textContent = `${userData.firstName}, você se considera em qual nível de proficiência da língua italiana:`;
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
