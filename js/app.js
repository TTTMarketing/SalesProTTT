const API='/api/chat',MDL='claude-sonnet-4-5';
const $=id=>document.getElementById(id);
function load(t){$('ltxt').textContent=t||'...';$('loverlay').classList.add('on')}
function unload(){$('loverlay').classList.remove('on')}
function delay(ms){return new Promise(r=>setTimeout(r,ms))}
function ar(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,100)+'px'}

async function ai(sys,msgs,tok){
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const r=await fetch(API,{method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:MDL,max_tokens:tok||500,system:sys,messages:msgs})});
      if(!r.ok){if(attempt<3){await delay(attempt*1200);continue;}throw new Error('HTTP '+r.status);}
      const d=await r.json();
      if(!d.content?.[0]?.text){if(attempt<3){await delay(attempt*1200);continue;}throw new Error('API');}
      return d.content[0].text;
    }catch(e){
      if(attempt===3)throw e;
      await delay(attempt*1200);
    }
  }
}

/* ── RANKS ── */
const RANKS=[
  {id:'trainee',name:'Стажёр',emoji:'🪖',xp:0},
  {id:'private',name:'Рядовой',emoji:'⭐',xp:100},
  {id:'corporal',name:'Ефрейтор',emoji:'🎯',xp:300},
  {id:'sergeant',name:'Сержант',emoji:'💪',xp:700},
  {id:'lt',name:'Лейтенант',emoji:'🔰',xp:1500},
  {id:'captain',name:'Капитан',emoji:'🎖️',xp:3000},
  {id:'major',name:'Майор',emoji:'⚔️',xp:6000},
  {id:'colonel',name:'Полковник',emoji:'🦅',xp:10000},
  {id:'general',name:'Генерал',emoji:'🏆',xp:18000},
  {id:'legend',name:'Легенда продаж',emoji:'👑',xp:30000}
];
const DIFF_XP={easy:50,medium:100,hard:200};
const DLBL={easy:'Лёгкий',medium:'Средний',hard:'Жёсткий'};

/* ── ACHIEVEMENTS ── */
const ACHS=[
  {id:'first',ic:'🗡️',nm:'Первая кровь',ds:'Первая тренировка',fn:s=>s.sessions>=1},
  {id:'sold',ic:'💰',nm:'Продал!',ds:'Закрыть сделку',fn:s=>s.wins>=1},
  {id:'str3',ic:'🔥',nm:'В огне',ds:'3 дня подряд',fn:s=>s.streak>=3},
  {id:'hard1',ic:'💀',nm:'Хардкор',ds:'Жёсткий уровень',fn:s=>s.hardCount>=1},
  {id:'s5',ic:'🏋️',nm:'Боевой режим',ds:'5 тренировок',fn:s=>s.sessions>=5},
  {id:'s20',ic:'🎯',nm:'Снайпер',ds:'20 тренировок',fn:s=>s.sessions>=20},
  {id:'w5',ic:'🤝',nm:'Продавец',ds:'5 сделок',fn:s=>s.wins>=5},
  {id:'perf',ic:'⭐',nm:'Совершенство',ds:'Балл 9+',fn:s=>s.bestScore>=9},
  {id:'str7',ic:'🌟',nm:'Недельный воин',ds:'7 дней подряд',fn:s=>s.streak>=7},
  {id:'xp1k',ic:'🚀',nm:'Ракета',ds:'1000 XP',fn:s=>s.xp>=1000},
  {id:'iq1',ic:'🔍',nm:'Рекрутёр',ds:'Первая квалификация',fn:s=>(s.iqSessions||0)>=1},
  {id:'learn1',ic:'📚',nm:'Студент',ds:'Первый модуль обучения',fn:s=>(s.learnModules||0)>=1}
];

/* ── LEARN DATA ── */
const LEARN_LEVELS=[
  {id:'l1',name:'Новобранец',emoji:'🟢',sub:'Первый контакт и приветствие',minRank:'trainee',
   modules:[
    {id:'m1',title:'Идеальное приветствие',xp:30,
     tip:{text:'Первые 10 секунд решают всё. Клиент решает — слушать вас или нет — почти мгновенно. Представьтесь чётко: имя, компания, одна причина звонка.',
      bad:'Алло, здравствуйте, я Дмитрий, менеджер компании... эм... мы занимаемся разными услугами, я хотел бы вам рассказать...',
      good:'Добрый день, Асель! Меня зовут Дмитрий, компания SalesPRO. Звоню по одному конкретному вопросу — займу 2 минуты. Удобно говорить?'},
     quiz:[
      {q:'Что самое важное в первые 10 секунд звонка?',opts:['Рассказать о компании подробно','Представиться чётко и назвать причину звонка','Сразу перейти к цене','Спросить как дела'],correct:1,exp:'Клиент принимает решение слушать вас в первые секунды. Имя + компания + причина звонка = правильный старт.'},
      {q:'Как правильно завершить приветствие?',opts:['Удобно говорить?','У меня важное предложение!','Вы слышите меня?','Давайте я расскажу всё подробно'],correct:0,exp:'Вопрос "Удобно говорить?" показывает уважение к времени клиента и сразу вовлекает его в диалог.'}
     ]},
    {id:'m2',title:'Как не слить звонок за 30 секунд',xp:30,
     tip:{text:'Главные ошибки в начале: говорить слишком быстро, использовать клише "беспокою вас", не называть причину звонка. Клиент должен понять зачем вы звоните.',
      bad:'Здравствуйте, извините что беспокою, я по поводу нашего замечательного предложения которое у нас есть и которое вам может быть интересно...',
      good:'Асель, добрый день! Звоню по делу — вы недавно интересовались CRM-системами. Нашёл для вас вариант, который закрывает именно ваши задачи. Расскажу за 2 минуты?'},
     quiz:[
      {q:'Какое слово НЕЛЬЗЯ использовать в начале звонка?',opts:['Добрый день','Беспокою','Вопрос','Звоню'],correct:1,exp:'"Беспокою" сразу ставит вас в позицию извиняющегося и создаёт негатив. Замените на уверенное приветствие.'},
      {q:'Что означает "назвать причину звонка"?',opts:['Сказать что вы менеджер','Сразу предложить скидку','Объяснить конкретно зачем звоните клиенту','Спросить удобно ли говорить'],correct:2,exp:'Клиент должен с первых секунд понимать — зачем вы звоните и что получит лично он.'}
     ]}
   ]},
  {id:'l2',name:'Боец',emoji:'🟡',sub:'Выявление потребностей',minRank:'private',
   modules:[
    {id:'m3',title:'Открытые вопросы — ключ к клиенту',xp:35,
     tip:{text:'Открытые вопросы начинаются с: Что, Как, Почему, Расскажите, Опишите. Они дают клиенту говорить — и раскрывают настоящие потребности. Ваша цель: говорить 30%, клиент — 70%.',
      bad:'— У вас есть CRM? — Нет. — Хотите купить? — Не знаю.',
      good:'— Расскажите, как сейчас ведёте базу клиентов? — Ну, в Excel... — А что чаще всего теряется или забывается? — Да вот звонки не фиксируем...'},
     quiz:[
      {q:'Какой вопрос является открытым?',opts:['Вам нужна CRM?','Вы пользуетесь Excel?','Как вы сейчас работаете с клиентской базой?','Хотите улучшить продажи?'],correct:2,exp:'Открытый вопрос начинается с "Как" — он не предполагает ответа "да/нет" и даёт клиенту рассказать о ситуации.'},
      {q:'Какое соотношение речи правильное?',opts:['Менеджер 70%, клиент 30%','50% на 50%','Менеджер 30%, клиент 70%','Не важно'],correct:2,exp:'Чем больше говорит клиент — тем больше вы узнаёте о его потребностях. Ваша задача слушать и направлять.'}
     ]},
    {id:'m4',title:'Техника СПИН — продажи через вопросы',xp:40,
     tip:{text:'СПИН = Ситуация, Проблема, Извлечение, Направляющий. Сначала узнаёте ситуацию, затем находите проблему, показываете последствия, и предлагаете решение.',
      bad:'— Берёте нашу систему? Она лучшая на рынке! — Нет, спасибо.',
      good:'— Как сейчас контролируете менеджеров? (Ситуация) — Как отслеживаете сколько звонков сделано? (Проблема) — Что происходит когда клиент "потерялся"? (Извлечение) — Если бы всё фиксировалось автоматически — сколько сделок не потеряли бы? (Направляющий)'},
     quiz:[
      {q:'Что означает "И" в СПИН?',opts:['Интерес клиента','Извлечение — вопрос о последствиях проблемы','Идеальное решение','Информация о продукте'],correct:1,exp:'Извлекающий вопрос помогает клиенту самому осознать масштаб проблемы. Это сильнее любого аргумента менеджера.'},
      {q:'С какого вопроса начинается СПИН?',opts:['Направляющий','Проблемный','Ситуационный','Извлекающий'],correct:2,exp:'Сначала нужно понять текущую ситуацию клиента — без этого невозможно найти его проблему.'}
     ]}
   ]},
  {id:'l3',name:'Сержант',emoji:'🟠',sub:'Возражения и презентация',minRank:'sergeant',
   modules:[
    {id:'m5',title:'Работа с возражением «Дорого»',xp:45,
     tip:{text:'"Дорого" — не отказ, это запрос на обоснование ценности. Никогда не оправдывайтесь и не давайте скидку сразу. Сначала согласитесь, затем переключите на ценность.',
      bad:'— Дорого. — Ну мы можем скидку сделать... — Нет всё равно дорого.',
      good:'— Дорого. — Понимаю, цена — важный фактор. Скажите, если убрать вопрос цены — продукт вам подходит? — Ну в целом да... — Тогда давайте разберём что входит в стоимость и что вы получаете.'},
     quiz:[
      {q:'Что делать первым при возражении "Дорого"?',opts:['Сразу дать скидку','Сказать что цена справедливая','Согласиться и переключить на ценность','Спросить сколько они готовы заплатить'],correct:2,exp:'Согласие снимает конфронтацию. Затем вы переключаете разговор с цены на ценность — что клиент получает за эти деньги.'},
      {q:'Какая фраза лучше всего отрабатывает "Дорого"?',opts:['Это очень выгодная цена!','Если убрать вопрос цены — продукт подходит?','Мы можем сделать скидку','У конкурентов дороже'],correct:1,exp:'Этот вопрос разделяет возражение по цене и реальный интерес к продукту. Если клиент говорит "да" — цена не главная причина отказа.'}
     ]},
    {id:'m6',title:'Презентация по выгодам',xp:45,
     tip:{text:'Презентируй не характеристики, а выгоды. Формула: Характеристика → Преимущество → Выгода для клиента. "У нас CRM с автоматическими напоминаниями (хар.) → менеджер не забудет перезвонить (пре.) → вы не потеряете ни одного клиента (выгода)".',
      bad:'— Наша CRM имеет 47 функций, облачное хранилище, API интеграции, мобильное приложение...',
      good:'— Асель, вы сказали что теряете клиентов которые "ушли подумать". В нашей CRM автоматические напоминания — менеджер получит уведомление точно в нужный момент. По опыту клиентов — возвращают 20-30% таких потерявшихся.'},
     quiz:[
      {q:'Что такое "выгода" в презентации?',opts:['Техническая характеристика продукта','То что продукт делает лучше конкурентов','Конкретный результат который получит клиент','Описание функций'],correct:2,exp:'Выгода — это ответ на вопрос клиента "Что это даст именно МНЕ?". Всегда переводи характеристики в конкретный результат.'},
      {q:'С чего начинать презентацию?',opts:['С цены','С характеристик продукта','С потребности клиента которую вы услышали','С истории компании'],correct:2,exp:'Презентация должна быть ответом на то, что вы узнали о клиенте. "Вы сказали что..." — лучшее начало.'}
     ]}
   ]},
  {id:'l4',name:'Капитан',emoji:'🔴',sub:'Закрытие и дожим',minRank:'captain',
   modules:[
    {id:'m7',title:'Техники закрытия сделки',xp:55,
     tip:{text:'Закрытие — это не давление, это помощь клиенту принять решение. Три сильных техники: 1) Альтернативный вопрос 2) Допущение 3) Следующий шаг.',
      bad:'— Ну что, берёте? — Не знаю, надо подумать. — Ну когда решите — звоните.',
      good:'— Когда вам удобнее начать — в этом месяце или в следующем? (Альтернатива)\n— Давайте я оформлю — на какой email отправить договор? (Допущение)\n— Следующий шаг — я пришлю договор сегодня, вы посмотрите до пятницы. Договорились? (Шаг)'},
     quiz:[
      {q:'Что такое "альтернативный вопрос" при закрытии?',opts:['Спросить — брать или не брать','Предложить выбор между двумя вариантами покупки','Спросить о скидке','Предложить подумать'],correct:1,exp:'Альтернативный вопрос убирает выбор "покупать / не покупать" и предлагает выбор "как именно покупать". Оба варианта ведут к сделке.'},
      {q:'Что делать если клиент говорит "подумаю"?',opts:['Сказать "хорошо, звоните"','Спросить что именно нужно обдумать и договориться о следующем шаге','Дать скидку','Отправить КП и ждать'],correct:1,exp:'"Подумаю" — не отказ. Уточните что именно смущает и договоритесь о конкретной дате следующего контакта.'}
     ]},
    {id:'m8',title:'Работа с отказом — второй шанс',xp:55,
     tip:{text:'Отказ — это не конец. 80% сделок закрываются после 5-го контакта. При отказе важно: не давить, уточнить причину, оставить дверь открытой.',
      bad:'— Нам не нужно. — Ну ладно. [кладёт трубку]',
      good:'— Нам не нужно. — Понимаю. Можете сказать — что именно не подошло? Хочу лучше понять. (пауза) — Ясно. Тогда не буду настаивать. Если ситуация изменится — вот мой контакт. Когда могу напомнить о себе через 3 месяца?'},
     quiz:[
      {q:'Сколько контактов в среднем нужно до закрытия сделки?',opts:['1-2','3','5 и более','10+'],correct:2,exp:'Статистика показывает: 80% продаж происходят после 5-го контакта. Большинство менеджеров сдаются после 1-2 попыток — это их главная ошибка.'},
      {q:'Что спросить при отказе?',opts:['Почему? Вы уверены?','Можете сказать что именно не подошло?','Ладно, удачи','Тогда берёте за полцены?'],correct:1,exp:'Нейтральный вопрос о причине отказа даёт информацию, показывает профессионализм и иногда — открывает новую возможность.'}
     ]}
   ]},
  {id:'l5',name:'Легенда',emoji:'🏆',sub:'Мастерство и переговоры',minRank:'major',
   modules:[
    {id:'m9',title:'Переговоры с крупными клиентами',xp:65,
     tip:{text:'В B2B продажах решение принимают несколько людей. Найдите "чемпиона" — того кто заинтересован внутри компании и будет продвигать ваше предложение.',
      bad:'— Я отправил КП генеральному. — Жду ответа уже 3 недели.',
      good:'— Асель, вам лично это решение поможет? — Да. — Отлично. Кто ещё участвует в принятии решения? Как вы обычно согласовываете такие вещи? Давайте я подготовлю презентацию специально для финансового директора.'},
     quiz:[
      {q:'Кто такой "чемпион" в B2B продажах?',opts:['Главный руководитель','Тот кто платит','Сотрудник внутри компании заинтересованный в вашем решении','Лучший менеджер'],correct:2,exp:'Чемпион — ваш союзник внутри компании. Он помогает продвигать ваше предложение там где вы не можете присутствовать.'},
      {q:'Что делать если КП "ушло в стол"?',opts:['Ждать','Позвонить и надавить','Узнать у вашего контакта кто ещё участвует в решении','Снизить цену'],correct:2,exp:'Поймите процесс принятия решений внутри компании. Найдите союзника и помогите ему "продать" ваше решение коллегам.'}
     ]},
    {id:'m10',title:'Повторные продажи и лояльность',xp:65,
     tip:{text:'Продать существующему клиенту в 5 раз дешевле чем новому. Используйте три правила: регулярный контакт без продаж, быстрая реакция на проблемы, персонализация.',
      bad:'Клиент купил → менеджер больше не звонит → клиент уходит к конкуренту через год.',
      good:'— Асель, месяц после старта — как всё идёт? Вопросы есть? (через 1 мес)\n— Видел статью как раз про вашу отрасль — отправил вам (ценность без продажи)\n— Кстати, у нас новая функция которая закрывает вашу боль с отчётами. Расскажу?'},
     quiz:[
      {q:'Во сколько раз дешевле продать существующему клиенту?',opts:['В 2 раза','В 5 раз','В 10 раз','Одинаково'],correct:1,exp:'Привлечение нового клиента стоит в 5-7 раз дороже. Лояльная база — главный актив менеджера по продажам.'},
      {q:'Как правильно поддерживать контакт с клиентом?',opts:['Звонить каждую неделю с новыми предложениями','Контактировать редко чтобы не раздражать','Чередовать полезный контент и предложения','Ждать когда клиент сам позвонит'],correct:2,exp:'Чередуйте: иногда давайте ценность без продажи (статья, совет, поздравление) — иногда делайте предложение. Это строит доверие.'}
     ]}
   ]}
];

/* ── STATE ── */
let user=null,gs=null;
let currentUid=null;
let scHist=[],scDiff='easy',scCfg={},scRes=null,scTurns=0;
let iqMotHist=[],iqRpHist=[],iqMotAnswers=[],iqRpProduct='',iqRpTurns=0,iqCandName='',iqRole='',iqResult=null;
let scRec=null,iqRec=null,scRec2=false,iqRec2=false;
let timerInt=null,timerSec=900;
let phrases=[];
let phrasesMode='all';
// Store last 3 full session details
let sessionDetails=[];

const PRODS=['Сертификат на массаж за 25 000₸','Курс английского языка за 80 000₸','Ручка Parker за 15 000₸','Абонемент в фитнес-клуб за 50 000₸/мес','Интернет для бизнеса за 15 000₸/мес','Подписка на Иви за 3 900₸/мес'];

/* ── STORAGE (localStorage for instant + Firestore for cross-device sync) ── */
let _firestoreSaveTimer=null;
function save(){
  if(!currentUid) return;
  // Synchronous: localStorage (instant)
  try{
    localStorage.setItem('sp_g_'+currentUid,JSON.stringify(gs));
    localStorage.setItem('sp_p_'+currentUid,JSON.stringify(phrases));
    localStorage.setItem('sp_sd_'+currentUid,JSON.stringify(sessionDetails));
  }catch(e){}
  // Debounced: Firestore (cross-device sync)
  if(_firestoreSaveTimer) clearTimeout(_firestoreSaveTimer);
  _firestoreSaveTimer=setTimeout(()=>{
    if(!window.SP_FIREBASE || !currentUid) return;
    window.SP_FIREBASE.saveState(currentUid,{gs,phrases,sessionDetails})
      .catch(e=>console.error('Firestore state save failed',e));
  },1500);
}
function emptyState(){
  return {xp:0,sessions:0,wins:0,streak:0,lastDate:null,hardCount:0,bestScore:0,iqSessions:0,learnModules:0,achievements:[],history:[],doneModules:[],catHistory:{}};
}
async function loadGameStateForUid(uid){
  // Try Firestore first (cross-device)
  try{
    const state=await window.SP_FIREBASE.getState(uid);
    if(state && state.gs){
      gs=state.gs;
      phrases=state.phrases||[];
      sessionDetails=state.sessionDetails||[];
      // Mirror to localStorage for offline access
      try{
        localStorage.setItem('sp_g_'+uid,JSON.stringify(gs));
        localStorage.setItem('sp_p_'+uid,JSON.stringify(phrases));
        localStorage.setItem('sp_sd_'+uid,JSON.stringify(sessionDetails));
      }catch(e){}
      return;
    }
  }catch(e){
    console.warn('Firestore state load failed, falling back to localStorage',e);
  }
  // Fallback: localStorage
  try{
    const g=localStorage.getItem('sp_g_'+uid);
    const p=localStorage.getItem('sp_p_'+uid);
    const sd=localStorage.getItem('sp_sd_'+uid);
    if(g){
      gs=JSON.parse(g);
      phrases=p?JSON.parse(p):[];
      sessionDetails=sd?JSON.parse(sd):[];
      return;
    }
  }catch(e){}
  // Fresh state
  gs=emptyState();
  phrases=[];
  sessionDetails=[];
}

/* ── SCREEN ROUTING ── */
function gotoScreen(id){
  ['scr-login','scr-reg','scr-app'].forEach(s=>{
    const el=document.getElementById(s);
    if(el) el.classList.remove('on');
  });
  const target=document.getElementById(id);
  if(target) target.classList.add('on');
}

/* ── AUTH STATE → ENTRY ROUTER ── */
function describeAuthIdentity(fu){
  const pid=fu.providerData?.[0]?.providerId||'';
  const icon=pid==='google.com'?'🔵 Google':pid==='phone'?'📱':'✉️';
  const id=fu.email||fu.phoneNumber||fu.uid.slice(0,8);
  return icon+' '+id;
}
function renderAuthInfo(fu){
  const el=document.getElementById('authInfo');
  if(el) el.textContent='Вход выполнен: '+describeAuthIdentity(fu);
}
async function handleAuthChange(firebaseUser){
  if(!firebaseUser){
    currentUid=null;user=null;gs=null;
    gotoScreen('scr-login');
    unload();
    return;
  }
  currentUid=firebaseUser.uid;
  try{
    const profile=await window.SP_FIREBASE.getProfile(firebaseUser.uid);
    if(profile && profile.name){
      user={name:profile.name,tg:profile.tg||'—',team:profile.team||'—'};
      await loadGameStateForUid(firebaseUser.uid);
      gotoScreen('scr-app');
      renderProfile();renderLearn();renderPhrases();updateNavRank();
      renderAuthInfo(firebaseUser);
    } else {
      if(firebaseUser.displayName){
        const rn=document.getElementById('rName');
        if(rn && !rn.value) rn.value=firebaseUser.displayName;
      }
      gotoScreen('scr-reg');
    }
  }catch(e){
    console.error('Profile load failed',e);
    gotoScreen('scr-reg');
  }
  unload();
}

async function logout(){
  if(!confirm('Выйти из аккаунта?')) return;
  try{ await window.SP_FIREBASE.logout(); }catch(e){}
  location.reload();
}
// iOS-safe button binding
document.addEventListener('DOMContentLoaded', function() {
  // Universal iOS touch handler - catches all button taps
  // Safe action dispatcher - no eval
  var ACTIONS = {
    'register': function(el) { register(); },
    'startSC': function(el) { startSC(); },
    'startIQ': function(el) { startIQ(); },
    'endSC': function(el) { endSC(); },
    'resetSC': function(el) { resetSC(); },
    'resetIQ': function(el) { resetIQ(); },
    'confirmCancelSC': function(el) { confirmCancelSC(); },
    'doConfirm': function(el) { doConfirm(); },
    'closeConfirm': function(el) { closeConfirm(); },
    'scSend': function(el) { scSend(); },
    'iqSend': function(el) { iqSend(); },
    'endTraining': function(el) { endSC(); },
    'copyPhrases': function(el) { copyPhrases(); },
    'copyTg': function(el) { copyTg(); },
    'sendSheets': function(el) { sendSheets(); }
  };

  function dispatchAction(fn, el) {
    if (!fn) return false;
    // goTab
    var mTab = fn.match(/goTab\('([^']+)'/);
    if (mTab) { goTab(mTab[1], el); return true; }
    // setDiff
    var mDiff = fn.match(/setDiff\(this,'([^']+)'\)/);
    if (mDiff) { setDiff(el, mDiff[1]); return true; }
    // toggleLevel
    var mLvl = fn.match(/toggleLevel\('([^']+)'\)/);
    if (mLvl) { toggleLevel(mLvl[1]); return true; }
    // toggleModule
    var mMod = fn.match(/toggleModule\('([^']+)'\)/);
    if (mMod) { toggleModule(mMod[1]); return true; }
    // completeModule
    var mComp = fn.match(/completeModule\('([^']+)',([^)]+)\)/);
    if (mComp) { completeModule(mComp[1], parseInt(mComp[2])); return true; }
    // showPhrases
    var mPhr = fn.match(/showPhrases\('([^']+)',this\)/);
    if (mPhr) { showPhrases(mPhr[1], el); return true; }
    // toggleFav
    var mFav = fn.match(/toggleFav\(([^)]+)\)/);
    if (mFav) { toggleFav(parseInt(mFav[1])); return true; }
    // openSheets/openTg
    var mSh = fn.match(/openSheets\('([^']+)'\)/);
    if (mSh) { openSheets(mSh[1]); return true; }
    var mTg = fn.match(/openTg\('([^']+)'\)/);
    if (mTg) { openTg(mTg[1]); return true; }
    // closeM
    var mCl = fn.match(/closeM\('([^']+)'\)/);
    if (mCl) { closeM(mCl[1]); return true; }
    // goToModule
    var mGo = fn.match(/goToModule\('([^']+)','([^']+)'\)/);
    if (mGo) { goToModule(mGo[1], mGo[2]); return true; }
    // answerQuiz
    var mAns = fn.match(/answerQuiz\(this\)/);
    if (mAns) { answerQuiz(el); return true; }
    // toggleVoice
    var mVoice = fn.match(/toggleV\('([^']+)'\)/);
    if (mVoice) { toggleV(mVoice[1]); return true; }
    // Named actions
    for (var name in ACTIONS) {
      if (fn.indexOf(name) !== -1) { ACTIONS[name](el); return true; }
    }
    return false;
  }

  function handleTap(e) {
    try {
      var el = e.target;
      if (!el || typeof el.getAttribute !== 'function') return;
      for (var i = 0; i < 8; i++) {
        if (!el || el === document.body) break;
        if (typeof el.getAttribute !== 'function') { el = el.parentNode; continue; }
        var fn = el.getAttribute('onclick');
        if (fn) {
          e.preventDefault();
          dispatchAction(fn, el);
          return;
        }
        el = el.parentNode;
      }
    } catch(err) { /* silent */ }
  }
  document.addEventListener('touchend', handleTap, {passive: false});
});

window.onload=()=>{
  function startAuth(){
    if(window.SP_FIREBASE){
      window.SP_FIREBASE.onAuthStateChanged(handleAuthChange);
    } else {
      window.addEventListener('sp-firebase-ready', ()=>{
        window.SP_FIREBASE.onAuthStateChanged(handleAuthChange);
      }, {once:true});
    }
  }
  startAuth();
  // Setup keyboard scroll fix for both inputs
  setTimeout(()=>{
    ['scInp','iqInp'].forEach(id=>{
      const inp=document.getElementById(id);
      if(!inp)return;
      inp.addEventListener('focus',function(){
        setTimeout(()=>{
          this.scrollIntoView({behavior:'smooth',block:'nearest'});
          const chatId=id==='scInp'?'scMsgs':'iqMsgs';
          const chat=document.getElementById(chatId);
          if(chat)chat.scrollTop=chat.scrollHeight;
        },400);
      });
    });
    // Visual viewport API for keyboard detection
    // Update --vvh CSS var on keyboard open/close
    function updateVVH(){
      document.documentElement.style.setProperty('--vvh', window.visualViewport ? window.visualViewport.height+'px' : window.innerHeight+'px');
    }
    updateVVH();
    if(window.visualViewport) window.visualViewport.addEventListener('resize', updateVVH);
    window.addEventListener('resize', updateVVH);

    if(window.visualViewport){
      window.visualViewport.addEventListener('resize',()=>{
        const el=document.activeElement;
        if(el&&(el.id==='scInp'||el.id==='iqInp')){
          const vvh=window.visualViewport.height;
          const inpRow=el.closest('.inp-row')||el.parentElement;
          if(inpRow){
            const rect=inpRow.getBoundingClientRect();
            if(rect.bottom>vvh-10){
              setTimeout(()=>{
                inpRow.scrollIntoView({behavior:'smooth',block:'end'});
                window.scrollBy(0,80);
              },100);
            }
          }
        }
      });
    }
  },500);
};

/* ── REGISTER (saves profile to Firestore, gamification to localStorage) ── */
async function register(){
  const n=$('rName').value.trim(),t=$('rTg').value.trim(),tm=$('rTeam').value.trim();
  if(!n){alert('Введите имя');return}
  if(!currentUid){alert('Не авторизован — обновите страницу');return}
  user={name:n,tg:t||'—',team:tm||'—'};
  if(!gs){
    gs={xp:0,sessions:0,wins:0,streak:0,lastDate:null,hardCount:0,bestScore:0,iqSessions:0,learnModules:0,achievements:[],history:[],doneModules:[],catHistory:{}};
  }
  try{
    await window.SP_FIREBASE.saveProfile(currentUid,user);
  }catch(e){
    console.error('Profile save failed',e);
    alert('Не удалось сохранить профиль. Попробуйте ещё раз.');
    return;
  }
  save();boot();
  if(window.SP_FIREBASE?.auth?.currentUser) renderAuthInfo(window.SP_FIREBASE.auth.currentUser);
}
function boot(){
  $('scr-reg').classList.remove('on');
  $('scr-app').classList.add('on');
  renderProfile();renderLearn();renderPhrases();updateNavRank();
}

/* ── RANKS ── */
function getRank(xp){let r=RANKS[0];for(const k of RANKS){if(xp>=k.xp)r=k;else break}return r}
function getNext(xp){for(const k of RANKS){if(xp<k.xp)return k}return null}

/* ── PROFILE ── */
function renderProfile(){
  if(!gs)return;
  const rk=getRank(gs.xp),nx=getNext(gs.xp);
  $('pBadge').textContent=rk.emoji;$('pRankTitle').textContent=rk.name;
  $('pName').textContent=user.name;$('pTg').textContent=user.tg+(user.team?' · '+user.team:'');
  $('xpDisp').textContent=gs.xp+' XP';
  if(nx){const p=Math.round(((gs.xp-rk.xp)/(nx.xp-rk.xp))*100);$('xpFill').style.width=p+'%';$('xpNext').textContent='До «'+nx.name+'»: '+(nx.xp-gs.xp)+' XP'}
  else{$('xpFill').style.width='100%';$('xpNext').textContent='Максимальное звание! 👑'}
  $('stS').textContent=gs.sessions;$('stStr').textContent=gs.streak+'🔥';
  const scSessions=gs.history.filter(h=>h.type==='sc');
  const last3=scSessions.slice(-3);
  const avg=last3.length?Math.round(last3.reduce((a,h)=>a+h.score,0)/last3.length*10)/10:'—';
  $('stAvg').textContent=avg;$('stW').textContent=gs.wins;
  renderProgChart();renderLadder(rk);renderAch();renderHist();
}

function renderProgChart(){
  const cats=[
    {key:'opening',lbl:'Открытие',c:'#f0b429'},
    {key:'questions',lbl:'Вопросы',c:'#4f8ef7'},
    {key:'pitch',lbl:'Презентация',c:'#2ecc71'},
    {key:'objections',lbl:'Возражения',c:'#f39c12'},
    {key:'close',lbl:'Закрытие',c:'#9b59b6'}
  ];
  const hist=gs.history.filter(h=>h.type==='sc'&&h.stages);
  if(!hist.length){$('progChart').innerHTML='<div style="color:var(--t3);font-size:13px;text-align:center;padding:16px">Пройди тренировки чтобы увидеть динамику 📈</div>';return}
  const last=hist.slice(-5);
  const sc=v=>v>=8?'var(--grn)':v>=6?'var(--amb)':'var(--red)';
  const trend=arr=>{if(arr.length<2)return'➡️';const d=arr[arr.length-1]-arr[0];return d>0?'📈':d<0?'📉':'➡️'};
  $('progChart').innerHTML=cats.map(cat=>{
    const vals=last.map(h=>h.stages?.[cat.key]||0);
    const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10:0;
    return`<div class="prog-row">
      <div class="prog-lbl">${cat.lbl}</div>
      <div class="prog-dots">${vals.map(v=>`<div class="prog-dot" style="background:${sc(v)}22;color:${sc(v)}">${v}</div>`).join('')}</div>
      <div class="prog-trend">${trend(vals)}</div>
      <div class="prog-avg" style="color:${sc(avg)}">${avg}</div>
    </div>`;
  }).join('');
}

function renderLadder(cur){
  $('rlad').innerHTML=RANKS.map((r,i)=>{
    const isc=r.id===cur.id,isd=gs.xp>=r.xp&&!isc,isl=gs.xp<r.xp;
    return`<div class="rrow ${isc?'cur':isd?'done':'lock'}" style="margin-bottom:6px">
      <div class="re">${r.emoji}</div><div class="rn">${r.name}</div>
      <div class="rx">${r.xp.toLocaleString()} XP</div>
      ${isc?'<span class="rcur">● ТЕКУЩЕЕ</span>':''}
    </div>`;
  }).join('');
}

function renderAch(){
  $('achGrid').innerHTML=ACHS.map(a=>{const un=gs.achievements.includes(a.id);return`<div class="ach ${un?'un':'lk'}"><div class="ach-ic">${a.ic}</div><div class="ach-nm">${a.nm}</div><div class="ach-ds">${a.ds}</div></div>`}).join('');
}

function renderHist(){
  if(!gs.history.length)return;
  const sc=s=>s>=8?'var(--grn)':s>=6?'var(--amb)':'var(--red)';
  $('histList').innerHTML=gs.history.slice().reverse().slice(0,10).map((h,i)=>`
    <div class="hi" data-histidx="${gs.history.length-1-i}">
      <div class="hi-sc" style="color:${sc(h.score)}">${h.score}</div>
      <div class="hi-info">
        <div class="hi-prod">${h.product}<span class="badge ${h.type}">${h.type==='iq'?'IQ':'Coach'}</span></div>
        <div class="hi-meta">${h.diff||''} · ${h.outcome} · ${new Date(h.date).toLocaleDateString('ru')}</div>
      </div>
      <div>
        <div class="hi-xp">+${h.xp} XP</div>
        <div class="hi-arr">›</div>
      </div>
    </div>`).join('');
  // Delegated tap handler for iOS compatibility
  $('histList').ontouchend=$('histList').onclick=function(e){
    const row=e.target.closest('[data-histidx]');
    if(row){e.preventDefault();openHistDetail(+row.dataset.histidx);}
  };
}

function openHistDetail(idx){
  const h=gs.history[idx];
  const detail=sessionDetails.find(d=>d.histIdx===idx);
  $('mHistTitle').textContent=(h.type==='iq'?'🔍 IQ: ':'⚔️ Тренировка: ')+h.product;
  let body='';
  if(detail){
    const sl={opening:'Открытие',questions:'Вопросы',pitch:'Презентация',objections:'Возражения',close:'Закрытие'};
    const sc2=v=>v>=8?'var(--grn)':v>=6?'var(--amb)':'var(--red)';
    const sc3=['#f0b429','#4f8ef7','#2ecc71','#f39c12','#9b59b6'];

    // ── Scores ──
    if(detail.stages){
      body+=`<div class="hd-section">
        <div class="hd-title">📊 Оценки по критериям</div>
        <div class="hd-scores">${Object.entries(detail.stages).map(([k,v],i)=>`
          <div class="hd-sc">
            <div class="hd-sc-v" style="color:${sc3[i]||sc2(v)}">${v}</div>
            <div class="hd-sc-l">${sl[k]||k}</div>
          </div>`).join('')}</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--gold);text-align:center;margin:10px 0">
          Общий балл: ${h.score}/10
        </div>
      </div>`;
    }

    // ── Verdict + Summary ──
    if(detail.verdict||detail.summary){
      const isWin=h.outcome==='Продажа';
      body+=`<div class="hd-section">
        <div class="res-verd ${isWin?'win':'lose'}" style="margin:0">
          <div class="vhd"><span style="font-size:18px">${isWin?'🏆':'📚'}</span>
          <span class="vtt">${detail.verdict||h.outcome}</span></div>
          ${detail.summary?`<div style="font-size:13px;line-height:1.6;color:var(--t2);margin-top:6px">${detail.summary}</div>`:''}
        </div>
      </div>`;
    }

    // ── Best / Worst ──
    if(detail.best_moment||detail.worst_moment){
      body+=`<div class="hd-section">
        <div class="mom-grid" style="margin:0">
          ${detail.best_moment?`<div class="mc best"><div class="mc-lbl">✅ Лучший момент</div><div class="mc-txt">"${detail.best_moment}"</div></div>`:''}
          ${detail.worst_moment?`<div class="mc worst"><div class="mc-lbl">⚠️ Зона роста</div><div class="mc-txt">${detail.worst_moment}</div></div>`:''}
        </div>
      </div>`;
    }

    // ── Advice ──
    if(detail.advice&&detail.advice.length){
      body+=`<div class="hd-section">
        <div class="hd-title">📡 Приказ тренера</div>
        <div class="adv-card" style="margin:0">
          ${detail.advice.map((a,i)=>`<div class="adv-item"><div class="adv-n">${i+1}</div><div>${highlightAdvice(a)}</div></div>`).join('')}
        </div>
      </div>`;
    }

    // ── Phrases ──
    if(detail.phrases&&detail.phrases.length){
      body+=`<div class="hd-section">
        <div class="hd-title">💬 Фразы из тренировки</div>
        ${detail.phrases.map(p=>`<div class="phrase-item" style="margin-bottom:8px">
          <div><div class="phrase-cat">${p.cat}</div><div class="phrase-text">"${p.text}"</div></div>
        </div>`).join('')}
      </div>`;
    }

    // ── Dialog ──
    if(detail.dialog&&detail.dialog.length){
      body+=`<div class="hd-section">
        <div class="hd-title">💬 Диалог</div>`;
      detail.dialog.forEach(m=>{
        const isM=m.role==='manager'||m.role==='mgr';
        body+=`<div class="hd-msg ${isM?'mgr':'cli'}">
          <div class="hd-msg-who">${isM?(user.name||'Вы'):'Клиент'}</div>
          ${m.content}
        </div>`;
      });
      body+=`</div>`;
    }

  } else {
    body=`<div style="color:var(--t3);font-size:13px;padding:12px 0">Детали этой тренировки не сохранились — они хранятся для последних 10 сессий.</div>`;
  }
  $('mHistBody').innerHTML=body;
  $('mHist').classList.add('on');
}

function updateNavRank(){if(!gs)return;const r=getRank(gs.xp);$('navRank').textContent=r.emoji+' '+r.name;const b=$('navRankBadge');if(b)b.textContent=r.emoji;}

/* ── XP & ACH ── */
function checkAch(){const nw=[];for(const a of ACHS){if(!gs.achievements.includes(a.id)&&a.fn(gs)){gs.achievements.push(a.id);nw.push(a)}}return nw}
function showAchPop(a){$('apic').textContent=a.ic;$('aptit').textContent='ДОСТИЖЕНИЕ: '+a.nm;$('apdsc').textContent=a.ds;$('apop').classList.add('on');setTimeout(()=>$('apop').classList.remove('on'),4000)}
function addXP(n){const pr=getRank(gs.xp);gs.xp+=n;const nr=getRank(gs.xp);return{up:pr.id!==nr.id,rank:nr}}

/* ── TABS ── */
function goTab(tab,el){
  try {
    // If tapping Бой again while in active training
    if(tab==='coach'){
      var chatVisible=$('sc-chat')&&$('sc-chat').style.display!=='none';
      var resultVisible=$('sc-result')&&$('sc-result').style.display!=='none';
      if(chatVisible||resultVisible){
        var alreadyOnCoach=document.querySelector('#tab-coach.on');
        if(alreadyOnCoach){ confirmCancelSC(); return; }
      }
    }
    var tabs=document.querySelectorAll('.nt');
    for(var i=0;i<tabs.length;i++) tabs[i].classList.remove('on');
    var panels=document.querySelectorAll('.tab');
    for(var j=0;j<panels.length;j++) panels[j].classList.remove('on');
    if(el&&el.classList) el.classList.add('on');
    var panel=$('tab-'+tab);
    if(panel) panel.classList.add('on');
    if(tab==='phrases') renderPhrases();
    if(tab==='learn') renderLearn();
  } catch(err) { console.log('goTab error:',err); }
}

/* ── DIFF ── */
function setDiff(el,d){document.querySelectorAll('.db').forEach(b=>b.classList.remove('sel'));el.classList.add('sel');scDiff=d}

/* ═══════════════════
   SALESIQ
═══════════════════ */
const IQ_MOT_SYS=`Ты — HR-эксперт. Проводишь квалификацию кандидата на позицию менеджера по продажам.
Задай ровно 3 вопроса по одному:
1. «Почему выбрали продажи? Что привлекает?»
2. «Как реагируете на отказ клиента?»
3. «Конец месяца, план не выполнен. Ваши действия?»
После 3-го ответа скажи: "Отлично! Переходим к практическому заданию."
Один вопрос за раз. Дружелюбный тон. Только русский.`;

function iqRpSys(){return`Ты — капризный, но платёжеспособный клиент. Продукт: ${iqRpProduct}
Задавай каверзные вопросы. Реагируй на аргументы. Веди себя как живой человек.
Реплики 1-4 предложения. Без форматирования.
После 4-6 реплик кандидата прими решение. Добавь: [ИТОГ: купил] или [ИТОГ: не купил]
Только русский.`}

const IQ_SCORE_SYS=`Эксперт оценки менеджеров. Верни ТОЛЬКО JSON без markdown:
{"scores":{"motivation":0-10,"objections":0-10,"persuasion":0-10,"activity":0-10,"stress":0-10},"total":0-10,"verdict":"БРАТЬ"|"РАССМОТРЕТЬ"|"НЕ БРАТЬ","summary":"2 предложения","strengths":["...","..."],"growth":["...","..."]}`;

async function startIQ(){
  iqCandName=$('iqCandName').value.trim()||'Кандидат';
  iqRole=$('iqRole').value;
  iqMotHist=[];iqRpHist=[];iqMotAnswers=[];iqRpTurns=0;iqResult=null;
  $('iq-intro').style.display='none';$('iq-chat').style.display='block';$('iq-result').style.display='none';
  $('iqMsgs').innerHTML='';setIQDot(0);$('iqStageLbl').textContent='Блок 1: Мотивация';
  load('ПОДГОТОВКА...');
  try{
    const q=await ai(IQ_MOT_SYS,[{role:'user',content:'Начни с первого вопроса.'}],200);
    iqMotHist=[{role:'user',content:'Начни с первого вопроса.'},{role:'assistant',content:q}];
    unload();iqAddMsg('bot',q);$('iqInp').focus();
  }catch(e){unload();}
}

function setIQDot(i){['d0','d1','d2','d3'].forEach((id,j)=>{const el=$(id);el.classList.remove('act','dn');if(j<i)el.classList.add('dn');else if(j===i)el.classList.add('act')})}

function iqAddMsg(who,text,opts){
  const msgs=$('iqMsgs'),clean=text.replace(/\[ИТОГ:.*?\]/g,'').trim(),isBot=who==='bot';
  const div=document.createElement('div');
  div.className='cm'+(isBot?'':' r');
  div.innerHTML=`<div class="cav ${isBot?'bot':'usr'}">${isBot?'🤖':'👤'}</div>
    <div><div class="cw ${isBot?'bot':'usr'}">${isBot?'SalesIQ':iqCandName}</div><div class="cbub ${isBot?'bot':'usr'}">${clean}</div></div>`;
  msgs.appendChild(div);
  if(opts){
    const or=document.createElement('div');or.className='opt-row';
    opts.forEach(o=>{const b=document.createElement('button');b.className='opt-btn';b.textContent=o;b.onclick=()=>{or.remove();iqHandleInput(o)};or.appendChild(b)});
    msgs.appendChild(or);
  }
  msgs.scrollTop=msgs.scrollHeight;
}

function iqShowTyp(){const m=$('iqMsgs');const t=document.createElement('div');t.className='typ';t.id='iqtyp';t.innerHTML=`<div class="cav bot">🤖</div><div class="typb"><div class="td"></div><div class="td"></div><div class="td"></div></div>`;m.appendChild(t);m.scrollTop=m.scrollHeight}
function iqHideTyp(){const t=$('iqtyp');if(t)t.remove()}

async function iqSend(){const inp=$('iqInp'),text=inp.value.trim();if(!text)return;inp.value='';inp.style.height='auto';await iqHandleInput(text)}
function iqKey(e){} // Enter no longer sends - use send button

async function iqHandleInput(text){
  iqAddMsg('cand',text);$('iqInp').disabled=true;
  if(!iqMotHist.find(m=>m.role==='user'&&m.content===text.trim())){}
  if(iqMotAnswers.length<3){
    iqMotHist.push({role:'user',content:text});iqMotAnswers.push(text);
    iqShowTyp();
    try{
      const r=await ai(IQ_MOT_SYS,iqMotHist,250);
      iqMotHist.push({role:'assistant',content:r});iqHideTyp();iqAddMsg('bot',r);
      if(r.includes('практическому заданию')||iqMotAnswers.length>=3){await delay(700);startIQRp();return}
    }catch(e){iqHideTyp();iqAddMsg('bot', '⚠️ Нет ответа от сервера. Попробуй ещё раз.');$('iqInp').disabled=false;}
  } else {
    iqRpHist.push({role:'user',content:text});iqRpTurns++;
    iqShowTyp();
    try{
      const r=await ai(iqRpSys(),iqRpHist,200);
      iqRpHist.push({role:'assistant',content:r});iqHideTyp();iqAddMsg('bot','[Клиент] '+r);
      if(r.includes('[ИТОГ:')||iqRpTurns>=6){const w=r.includes('купил]');await delay(700);startIQScore(w);return}
    }catch(e){iqHideTyp();iqAddMsg('bot', '⚠️ Нет ответа от сервера. Попробуй ещё раз.');$('iqInp').disabled=false;}
  }
  $('iqInp').disabled=false;$('iqInp').focus();
}

async function startIQRp(){
  iqRpProduct=PRODS[Math.floor(Math.random()*PRODS.length)];
  setIQDot(1);$('iqStageLbl').textContent='Блок 2: Ролевая игра — '+iqRpProduct;
  iqAddMsg('bot',`🎭 Отлично! Теперь ролевая игра.\n\nЯ — клиент. Продукт: **${iqRpProduct}**\nПродайте мне этот товар. Удачи!`);
  await delay(800);load('ГОТОВИМ КЛИЕНТА...');
  try{
    const r=await ai(iqRpSys(),[{role:'user',content:'Начни — ты клиент, взял трубку. 1-2 фразы.'}],150);
    iqRpHist=[{role:'user',content:'Начни — ты клиент, взял трубку. 1-2 фразы.'},{role:'assistant',content:r}];
    unload();iqAddMsg('bot','[Клиент] '+r);$('iqInp').disabled=false;$('iqInp').focus();
  }catch(e){unload();}
}

async function startIQScore(won){
  setIQDot(2);$('iqStageLbl').textContent='Блок 3: Формирование оценки...';$('iqInp').disabled=true;
  load('АНАЛИЗИРУЕМ...');
  const content=`Имя: ${iqCandName}, Позиция: ${iqRole}\nМотивация: ${iqMotAnswers.join(' | ')}\nРолевая (продукт: ${iqRpProduct}): ${iqRpHist.filter(m=>m.role==='user').map(m=>m.content).join(' | ')}\nИсход: ${won?'закрыл сделку':'клиент отказался'}`;
  try{
    const raw=await ai(IQ_SCORE_SYS,[{role:'user',content}],700);
    iqResult=JSON.parse(raw.replace(/```json|```/g,'').trim());
    unload();finishIQ(won);
  }catch(e){unload();iqAddMsg('bot','⚠️ Ошибка оценки. Попробуй ещ раз.');}
}

function finishIQ(won){
  setIQDot(3);
  const xp=40+Math.round((iqResult.total||5)*4);
  gs.xp+=xp;gs.iqSessions=(gs.iqSessions||0)+1;gs.sessions++;
  if(iqResult.total>gs.bestScore)gs.bestScore=iqResult.total;
  updateStreak();
  gs.history.push({product:iqRpProduct,type:'iq',diff:'—',outcome:iqResult.verdict,score:iqResult.total,xp,date:Date.now()});
  // Save detail
  const detail={histIdx:gs.history.length-1,stages:iqResult.scores,dialog:[],advice:iqResult.growth||[]};
  sessionDetails.push(detail);if(sessionDetails.length>10)sessionDetails.shift();
  // Update histIdx references
  sessionDetails.forEach((d,i)=>{d.histIdx=gs.history.length-1-i});
  const nw=checkAch();save();
  nw.forEach((a,i)=>setTimeout(()=>showAchPop(a),700+i*4500));
  renderProfile();updateNavRank();renderIQResult(xp);
  autoSendSheets('iq');
}

function renderIQResult(xp){
  $('iq-chat').style.display='none';$('iq-result').style.display='block';
  const r=iqResult;
  const vm={'БРАТЬ':{cls:'hire',lbl:'✅ РЕКОМЕНДОВАН'},'РАССМОТРЕТЬ':{cls:'maybe',lbl:'🤔 РАССМОТРЕТЬ'},'НЕ БРАТЬ':{cls:'pass',lbl:'❌ НЕ РЕКОМЕНДОВАН'}};
  const v=vm[r.verdict]||vm['РАССМОТРЕТЬ'];
  const sl={motivation:'Мотивация',objections:'Возражения',persuasion:'Убедительность',activity:'Активность',stress:'Стрессоуст.'};
  const sc2=['#f0b429','#e74c3c','#2ecc71','#4f8ef7','#9b59b6'];
  $('iqResCard').innerHTML=`
    <div style="font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:1px;margin-bottom:14px">Результат: ${iqCandName} — <span style="color:var(--gold)">${r.total}/10</span></div>
    <div class="iq-sc-grid">${Object.entries(r.scores||{}).map(([k,v2],i)=>`
      <div class="iq-sc-item"><div class="iq-sc-lbl">${sl[k]||k}</div>
      <div class="iq-sc-bar"><div class="iq-sc-fill" style="width:${v2*10}%;background:${sc2[i]}"></div></div>
      <div class="iq-sc-val" style="color:${sc2[i]}">${v2}/10</div></div>`).join('')}</div>
    <div class="iq-verdict ${v.cls}"><div><div class="iq-vt">${v.lbl}</div><div style="font-size:12px;color:var(--t2);margin-top:3px">${r.summary||''}</div></div></div>
    <div class="pts-grid">
      <div class="pt"><div class="pt-lbl">💪 Сильные</div>${(r.strengths||[]).map(s=>`<div class="pt-item"><div class="dot5" style="background:var(--grn)"></div><div>${s}</div></div>`).join('')}</div>
      <div class="pt"><div class="pt-lbl">🎯 Зоны роста</div>${(r.growth||[]).map(g=>`<div class="pt-item"><div class="dot5" style="background:var(--red)"></div><div>${g}</div></div>`).join('')}</div>
    </div>
    <div style="text-align:center;margin-top:12px;padding:10px;background:var(--gbg);border-radius:9px;font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--gold)">+${xp} XP заработано!</div>`;
}

function resetIQ(){$('iq-intro').style.display='block';$('iq-chat').style.display='none';$('iq-result').style.display='none';$('iqCandName').value='';iqResult=null}

/* ═══════════════════
   SALESCOACH
═══════════════════ */
function scSys(){
  const d={easy:'Клиент доброжелателен, соглашается после 1-2 аргументов.',medium:'Задаёт каверзные вопросы, требует 2-3 аргумента.',hard:'Груб, перебивает, всё дорого. Соглашается только при очень сильных аргументах.'};
  return`Ты — реальный клиент. Продукт: ${scCfg.product}. Тип: ${scCfg.client}. Сложность: ${d[scDiff]||d.medium}
Короткие реплики (1-4 предложения). Без форматирования. Следи за логикой всего диалога — отвечай исходя из контекста разговора.
После 4-6 реплик менеджера заверши. Добавь: [ИТОГ: купил] или [ИТОГ: отказался]
Только русский.`
}

async function startSC(){
  scCfg={product:$('scProd').value,client:$('scClient').value};
  scHist=[];scTurns=0;scRes=null;
  $('sc-setup').style.display='none';$('sc-result').style.display='none';$('sc-chat').style.display='block';
  $('scMsgs').innerHTML='';$('coachPanel').classList.remove('on');
  $('hProd').textContent=scCfg.product.length>16?scCfg.product.slice(0,16)+'…':scCfg.product;$('hDiff').textContent=DLBL[scDiff];$('hClient').textContent='Клиент: '+scCfg.client;
  startTimer();load('ГОТОВИМ КЛИЕНТА...');
  var _retries=0;
  async function _tryStart(){
    try{
      const f=await ai(scSys(),[{role:'user',content:'Начни — ты клиент, взял трубку. 1-2 фразы.'}],150);
      scHist=[{role:'user',content:'Начни — ты клиент, взял трубку. 1-2 фразы.'},{role:'assistant',content:f}];
      unload();scAddMsg('cli',f);$('scInp').focus();
    }catch(e){
      if(_retries<2){_retries++;setTimeout(_tryStart,1500);}
      else{unload();scAddMsg('cli','⚠️ Нет ответа от сервера. Проверь соединение.');}
    }
  }
  _tryStart();
}

function startTimer(){timerSec=900;updTimer();clearInterval(timerInt);timerInt=setInterval(()=>{timerSec--;updTimer();if(timerSec<=0){clearInterval(timerInt);endSC(null,true)}},1000)}
function stopTimer(){clearInterval(timerInt)}
function updTimer(){
  const m=Math.floor(timerSec/60),s=timerSec%60;
  $('tDisp').textContent=m+':'+String(s).padStart(2,'0');
  const p=(timerSec/900)*100;$('tFill').style.width=p+'%';
  $('tDisp').className='tdisp'+(timerSec<60?' dng':timerSec<180?' warn':'');
  $('tFill').style.background=timerSec<60?'var(--red)':timerSec<180?'var(--amb)':'var(--grn)';
}

function scAddMsg(who,text){
  const b=$('scMsgs'),clean=text.replace(/\[ИТОГ:.*?\]/g,'').trim();
  const div=document.createElement('div');div.className='cm'+(who==='mgr'?' r':'');
  div.innerHTML=`<div class="cav ${who}">${who==='cli'?'👤':'😊'}</div>
    <div><div class="cw ${who}">${who==='cli'?'Клиент':user.name}</div><div class="cbub ${who}">${clean}</div></div>`;
  $('scMsgs').appendChild(div);$('scMsgs').scrollTop=$('scMsgs').scrollHeight;
}

function scShowTyp(){const b=$('scMsgs');const t=document.createElement('div');t.className='typ';t.id='sctyp';t.innerHTML=`<div class="cav cli">👤</div><div class="typb"><div class="td"></div><div class="td"></div><div class="td"></div></div>`;b.appendChild(t);b.scrollTop=b.scrollHeight}
function scHideTyp(){const t=$('sctyp');if(t)t.remove()}

async function scSend(){
  const inp=$('scInp'),text=inp.value.trim();if(!text)return;
  inp.value='';inp.style.height='auto';inp.disabled=true;
  scAddMsg('mgr',text);
  // Full history for context
  scHist.push({role:'user',content:text});scTurns++;
  scShowTyp();
  try{
    // Pass FULL history to maintain context
    const r=await ai(scSys(),scHist,200);
    scHist.push({role:'assistant',content:r});scHideTyp();scAddMsg('cli',r);
    if(scTurns%2===0)showCoach(text,scHist);
    if(r.includes('[ИТОГ:')){const w=r.includes('купил]');stopTimer();await delay(800);endSC(w,false);return}
  }catch(e){
    scHideTyp();
    const errMsg='⚠️ Нет ответа от сервера. <span style="color:var(--acc);cursor:pointer;text-decoration:underline" onclick="scRetry()">Повторить попытку</span>';
    scAddMsg('cli', errMsg);
  }
  inp.disabled=false;if(inp)inp.focus();
}
function scKey(e){} // Enter no longer sends - use send button

function scRetry(){
  const inp=$('scInp');if(inp)inp.disabled=false;
  const lastErr=$('scMsgs').querySelector('.cbub.cli:last-child');
  if(lastErr&&lastErr.innerHTML.includes('Повторить'))lastErr.closest('.cm').remove();
}

async function showCoach(msg,hist){
  // Full dialog context so coach knows what was already said
  var fullCtx=hist.slice(1).map(function(m){
    return (m.role==='user'?'Менеджер':'Клиент')+': '+m.content.replace(/\[ИТОГ:.*?\]/g,'').trim();
  }).join('\n');
  var sys='Ты коуч по продажам. Прочитай ВЕСЬ диалог и дай обратную связь ТОЛЬКО по последней реплике менеджера.\n'
    +'Важно: если менеджер уже называл цену или факт ранее в диалоге — не упрекай его за это снова.\n'
    +'Продукт: '+scCfg.product+'. Тип клиента: '+scCfg.client+'.\n\n'
    +'Весь диалог:\n'+fullCtx+'\n\n'
    +'Последняя реплика менеджера: "'+msg+'"\n\n'
    +'Верни ТОЛЬКО JSON: {"items":[{"type":"ok" или "warn" или "crit","text":"конкретный комментарий"}]} Макс 2 пункта. Без markdown.';
  try{
    var raw=await ai(sys,[{role:'user',content:'Оцени последнюю реплику.'}],350);
    var d=JSON.parse(raw.replace(/```json|```/g,'').trim());
    $('coachItems').innerHTML=(d.items||[]).map(function(i){return '<div class="ci '+i.type+'"><div class="ci-lbl">'+( i.type==='ok'?'✅ Хорошо':i.type==='warn'?'💡 Совет':'⚠️ Ошибка')+'</div>'+i.text+'</div>';}).join('');
    $('coachPanel').classList.add('on');
  }catch(e){}
}

async function endSC(won,timeout){
  stopTimer();stopVoice('sc');$('coachPanel').classList.remove('on');
  if(timeout)scAddMsg('cli','⏱️ Время вышло!');
  load('АНАЛИЗИРУЕМ БОЙ...');
  const lines=scHist.filter(m=>m.role==='user').slice(1).map(m=>m.content).join('\n');
  const fullDialog=scHist.slice(1).map(m=>({role:m.role==='user'?'mgr':'cli',content:m.content.replace(/\[ИТОГ:.*?\]/g,'').trim()}));
  const sys=`Тренер продаж. Оцени тренировку.
Продукт: ${scCfg.product}, Клиент: ${scCfg.client}, Уровень: ${scDiff}
Исход: ${won===true?'ПРОДАЖА':won===false?'ОТКАЗ':'нет'}
Реплики менеджера:\n${lines}
Верни ТОЛЬКО JSON без markdown:
{
  "total":0-10,
  "verdict":"ПРОДАЖА СОВЕРШЕНА"|"КЛИЕНТ УШЁЛ"|"ВРЕМЯ ВЫШЛО",
  "summary":"2 предложения, подбодри если низкий балл — это учёба!",
  "stages":{"opening":0-10,"questions":0-10,"pitch":0-10,"objections":0-10,"close":0-10},
  "best_moment":"лучшая реплика дословно",
  "worst_moment":"худшая реплика и почему кратко",
  "top_advice":["совет1","совет2","совет3"],
  "phrases":[
    {"cat":"Возражения","text":"готовая фраза для использования в продажах"},
    {"cat":"Закрытие","text":"готовая фраза"},
    {"cat":"Презентация","text":"готовая фраза"}
  ],
  "weak_topics":["название темы из обучения","название темы"]
}`;
  try{
    const raw=await ai(sys,[{role:'user',content:'Оцени.'}],1000);
    scRes=JSON.parse(raw.replace(/```json|```/g,'').trim());
    if(won===true)scRes.verdict='ПРОДАЖА СОВЕРШЕНА';
    if(won===false&&scRes.verdict!=='ПРОДАЖА СОВЕРШЕНА')scRes.verdict='КЛИЕНТ УШЁЛ';
    if(timeout)scRes.verdict='ВРЕМЯ ВЫШЛО';
    unload();finishSC(won,fullDialog);
  }catch(e){
    unload();
    scRes={total:5,verdict:'НЕОПРЕДЕЛЁННО',summary:'Продолжай практиковаться!',stages:{opening:5,questions:5,pitch:5,objections:5,close:5},best_moment:'—',worst_moment:'—',top_advice:['Задавай вопросы','Работай с возражениями','Закрывай чётко'],phrases:[],weak_topics:[]};
    finishSC(won,fullDialog);
  }
}

function finishSC(won,fullDialog){
  const isWin=scRes.verdict==='ПРОДАЖА СОВЕРШЕНА';
  const base=DIFF_XP[scDiff]||50;
  const sb=Math.round((scRes.total||5)*5);
  const wb=isWin?30:0;
  const tot=base+sb+wb;
  const pr=getRank(gs.xp);
  const {up,rank:nr}=addXP(tot);
  gs.sessions++;if(isWin)gs.wins++;if(scDiff==='hard')gs.hardCount++;
  if(scRes.total>gs.bestScore)gs.bestScore=scRes.total;
  updateStreak();
  // Update cat history
  if(scRes.stages){
    Object.entries(scRes.stages).forEach(([k,v])=>{
      if(!gs.catHistory)gs.catHistory={};
      if(!gs.catHistory[k])gs.catHistory[k]=[];
      gs.catHistory[k].push(v);
      if(gs.catHistory[k].length>10)gs.catHistory[k].shift();
    });
  }
  gs.history.push({product:scCfg.product,type:'sc',diff:DLBL[scDiff],outcome:isWin?'Продажа':'Отказ',score:scRes.total,xp:tot,date:Date.now(),stages:scRes.stages});
  // Save FULL session detail
  const detail={
    histIdx:gs.history.length-1,
    stages:scRes.stages,
    dialog:fullDialog,
    advice:scRes.top_advice||[],
    verdict:scRes.verdict||'',
    summary:scRes.summary||'',
    best_moment:scRes.best_moment||'',
    worst_moment:scRes.worst_moment||'',
    phrases:scRes.phrases||[]
  };
  sessionDetails.push(detail);if(sessionDetails.length>10)sessionDetails.shift();
  sessionDetails.forEach((d,i)=>{d.histIdx=gs.history.length-1-i});
  // Auto-save phrases
  if(scRes.phrases&&scRes.phrases.length){
    scRes.phrases.forEach(ph=>{phrases.push({cat:ph.cat,text:ph.text,fav:false,date:Date.now()})});
    if(phrases.length>50)phrases=phrases.slice(-50);
  }
  const nw=checkAch();save();
  nw.forEach((a,i)=>setTimeout(()=>showAchPop(a),1000+i*4500));
  renderProfile();updateNavRank();renderSCResult(tot,base,sb,wb,isWin,up,nr);
  autoSendSheets('sc');
}

function updateStreak(){
  const today=new Date().toDateString();
  if(gs.lastDate===today)return;
  if(gs.lastDate===new Date(Date.now()-86400000).toDateString())gs.streak++;
  else gs.streak=1;
  gs.lastDate=today;
}

function renderSCResult(tot,base,sb,wb,isWin,up,nr){
  $('sc-chat').style.display='none';$('sc-result').style.display='block';
  const sl={opening:'Открытие',questions:'Вопросы',pitch:'Презентация',objections:'Возражения',close:'Закрытие'};
  const sc2=['#f0b429','#4f8ef7','#2ecc71','#f39c12','#9b59b6'];
  // Find weak stages
  const stages=scRes.stages||{};
  const weakStages=Object.entries(stages).filter(([k,v])=>v<6).map(([k])=>sl[k]||k);

  // Map weak topics to learn modules
  const topicMap={
    'Открытие':['m1','m2'],'Вопросы':['m3','m4'],'Презентация':['m6'],
    'Возражения':['m5'],'Закрытие':['m7','m8']
  };
  const weakModuleIds=[];
  weakStages.forEach(s=>{if(topicMap[s])weakModuleIds.push(...topicMap[s])});
  const uniqueWeakMods=[...new Set(weakModuleIds)].slice(0,3);
  const weakModules=uniqueWeakMods.map(mid=>{
    for(const lv of LEARN_LEVELS){const m=lv.modules.find(m=>m.id===mid);if(m)return{...m,levelId:lv.id}}
    return null;
  }).filter(Boolean);

  $('sc-result').innerHTML=`<div>
    <!-- Total score -->
    <div class="total-score-box">
      <div class="total-score-lbl">Общий балл</div>
      <div class="total-score-num">${scRes.total}<span style="font-size:36px;color:var(--t2)">/10</span></div>
      <div class="xp-earned">+${tot} XP заработано</div>
      <div class="xp-parts"><span class="xpp">База: <span>+${base}</span></span><span class="xpp">Балл: <span>+${sb}</span></span>${wb?`<span class="xpp">Продажа: <span>+${wb}</span></span>`:''}</div>
    </div>
    ${up?`<div class="rup on"><div class="rup-t">${nr.emoji} НОВОЕ ЗВАНИЕ: ${nr.name.toUpperCase()}!</div></div>`:''}

    <!-- 5 scores -->
    <div class="res-scores">${Object.entries(stages).map(([k,v],i)=>`
      <div class="rsc"><div class="rsc-v" style="color:${sc2[i]}">${v}</div><div class="rsc-l">${sl[k]||k}</div>
      <div class="rsc-bar"><div class="rsc-f" style="width:${v*10}%;background:${sc2[i]}"></div></div></div>`).join('')}</div>

    <!-- Verdict -->
    <div class="res-verd ${isWin?'win':'lose'}">
      <div class="vhd"><span style="font-size:20px">${isWin?'🏆':'📚'}</span><span class="vtt">${scRes.verdict}</span></div>
      <div style="font-size:13px;line-height:1.6;color:var(--t2)">${scRes.summary}</div>
    </div>

    <!-- Moments -->
    <div class="mom-grid">
      <div class="mc best"><div class="mc-lbl">✅ Лучший момент</div><div class="mc-txt">"${scRes.best_moment||'—'}"</div></div>
      <div class="mc worst"><div class="mc-lbl">⚠️ Зона роста</div><div class="mc-txt">${scRes.worst_moment||'—'}</div></div>
    </div>

    <!-- Phrases saved -->
    ${scRes.phrases&&scRes.phrases.length?`<div class="phrases-box">
      <div class="phrases-title">💬 Фразы добавлены в Копилку</div>
      ${scRes.phrases.map(p=>`<div class="phrase-item"><div style="flex:1"><div class="phrase-cat">${p.cat}</div><div class="phrase-text">"${p.text}"</div></div></div>`).join('')}
      <div style="margin-top:10px;padding:9px 12px;background:rgba(79,142,247,.08);border:1px solid rgba(79,142,247,.2);border-radius:8px;font-size:12px;color:var(--acc);text-align:center;cursor:pointer" onclick="goTab('phrases',document.querySelectorAll('.nt')[4])">
        ⭐ Все ваши фразы и избранное → раздел <b>💬 Фразы</b>
      </div>
    </div>`:`<div style="margin:0 0 12px;padding:11px 14px;background:rgba(79,142,247,.06);border:1px solid rgba(79,142,247,.15);border-radius:10px;font-size:13px;color:var(--t2);text-align:center">
      💬 Полезные фразы для продаж собираются в разделе <b style="color:var(--acc)">Фразы</b> — загляни туда после тренировки
    </div>`}

    <!-- Advice -->
    <div class="adv-card">
      <div class="adv-title">📡 Приказ тренера</div>
      ${(scRes.top_advice||[]).map((a,i)=>`<div class="adv-item"><div class="adv-n">${i+1}</div><div>${highlightAdvice(a)}</div></div>`).join('')}
    </div>

    <!-- Study recommendations -->
    ${weakModules.length?`<div class="study-recs">
      <div class="study-recs-title">📚 Рекомендуем изучить</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:10px">По результатам тренировки — эти темы помогут вырасти:</div>
      ${weakModules.map(m=>`<div class="study-rec-item" onclick="goToModule('${m.levelId}','${m.id}')">
        <div class="study-rec-icon">📖</div>
        <div class="study-rec-info">
          <div class="study-rec-topic">${m.title}</div>
          <div class="study-rec-sub">Открыть урок в разделе Учёба</div>
        </div>
        <div class="study-rec-arr">›</div>
      </div>`).join('')}
    </div>`:''}

    <!-- Export -->
    <div class="exp-row">
      <button type="button" class="eb sh" onclick="openSheets('sc')">📊 Google Sheets</button>
      <button type="button" class="eb tg" onclick="openTg('sc')">✈️ Telegram</button>
    </div>
    <button type="button" class="gold-btn" style="margin-top:0" onclick="resetSC()">⚔️ СЛЕДУЮЩАЯ МИССИЯ</button>
  </div>`;
}

function goToModule(levelId, moduleId){
  // Navigate to learn tab and open specific module
  document.querySelectorAll('.nt').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.nt')[3].classList.add('on');
  $('tab-learn').classList.add('on');
  renderLearn();
  // Expand the level and module
  setTimeout(()=>{
    const lhdr=$('lhdr-'+levelId);
    const mwrap=$('mwrap-'+levelId);
    if(lhdr&&mwrap&&!mwrap.classList.contains('open')){
      mwrap.classList.add('open');
      const arr=lhdr.querySelector('.level-arr');
      if(arr)arr.classList.add('open');
    }
    const mdet=$('mdet-'+moduleId);
    if(mdet&&!mdet.classList.contains('open')){
      mdet.classList.add('open');
      setTimeout(()=>mdet.scrollIntoView({behavior:'smooth',block:'start'}),200);
    }
  },100);
}


function highlightAdvice(text) {
  var G = "color:var(--gold);font-weight:700";
  var B = "color:var(--acc);font-weight:700";
  var A = "color:var(--amb);font-weight:700";
  // Wrap anything in quotes (various styles) with gold highlight
  // Use charCode approach to avoid unicode literal issues in script
  var laq = String.fromCharCode(171);  // «
  var raq = String.fromCharCode(187);  // »
  var ldq = String.fromCharCode(8220); // "
  var rdq = String.fromCharCode(8221); // "
  var lsq = String.fromCharCode(8216); // '
  var rsq = String.fromCharCode(8217); // '
  // Replace angle quotes
  var re1 = new RegExp(laq + "(.{3,80})" + raq, "g");
  text = text.replace(re1, function(m,p1){ return "<b style='" + G + "'>" + laq + p1 + raq + "</b>"; });
  // Replace curly double quotes
  var re2 = new RegExp(ldq + "(.{3,80})" + rdq, "g");
  text = text.replace(re2, function(m,p1){ return "<b style='" + G + "'>" + ldq + p1 + rdq + "</b>"; });
  // Replace curly single quotes
  var re3 = new RegExp(lsq + "(.{4,80})" + rsq, "g");
  text = text.replace(re3, function(m,p1){ return "<b style='" + G + "'>" + lsq + p1 + rsq + "</b>"; });
  // Action verbs -> blue
  var verbs = ["спросите","уточните","скажите","добавьте","используйте","начните","закройте","предложите","задайте","покажите","спроси","уточни","скажи","добавь","используй","начни","закрой","предложи","задай","покажи"];
  for (var i = 0; i < verbs.length; i++) {
    text = text.replace(new RegExp(verbs[i], "gi"), function(m){ return "<b style='" + B + "'>" + m + "</b>"; });
  }
  // Negative -> amber
  var negs = ["не называйте","не говорите","не давите","не торопитесь","не называть","не говорить","не спешите"];
  for (var j = 0; j < negs.length; j++) {
    text = text.replace(new RegExp(negs[j], "gi"), function(m){ return "<b style='" + A + "'>" + m + "</b>"; });
  }
  return text;
}



var _confirmCallback=null;
function showConfirm(text,yesLabel,cb){
  $('confirmText').textContent=text;
  $('confirmYesBtn').textContent=yesLabel||'Да';
  _confirmCallback=cb;
  $('confirmModal').classList.add('on');
}
function doConfirm(){
  $('confirmModal').classList.remove('on');
  if(_confirmCallback)_confirmCallback();
  _confirmCallback=null;
}
function closeConfirm(){
  $('confirmModal').classList.remove('on');
  _confirmCallback=null;
}
function confirmCancelSC(){
  showConfirm('Прервать тренировку и вернуться к настройкам?','Прервать',function(){
    stopTimer();
    stopVoice('sc');
    $('sc-chat').style.display='none';
    $('sc-result').style.display='none';
    $('sc-setup').style.display='block';
    scHist=[];scTurns=0;scRes=null;
    if($('coachPanel'))$('coachPanel').classList.remove('on');
    if($('scInp')){$('scInp').value='';$('scInp').disabled=false;}
    if($('scMsgs'))$('scMsgs').innerHTML='';
  });
}

function resetSC(){$('sc-setup').style.display='block';$('sc-chat').style.display='none';$('sc-result').style.display='none';scHist=[];scTurns=0;scRes=null}

/* ═══════════════════
   LEARN
═══════════════════ */
function renderLearn(){
  if(!gs)return;
  const curRank=getRank(gs.xp);
  const rankOrder=RANKS.map(r=>r.id);
  const totalMods=LEARN_LEVELS.reduce((a,l)=>a+l.modules.length,0);
  const doneMods=(gs.doneModules||[]).length;
  $('learnXpFill').style.width=Math.round(doneMods/totalMods*100)+'%';
  $('learnXpLbl').textContent=doneMods+' / '+totalMods+' модулей пройдено';

  $('levelsWrap').innerHTML=LEARN_LEVELS.map(lv=>{
    const locked=false;
    const lvDone=lv.modules.filter(m=>(gs.doneModules||[]).includes(m.id)).length;
    const lvTotal=lv.modules.length;
    const modules=lv.modules.map(m=>{
      const done=(gs.doneModules||[]).includes(m.id);
      return`<div class="module-item ${done?'done':''}" onclick="toggleModule('${m.id}')">
        <div class="module-check ${done?'done':''}">${done?'✓':''}</div>
        <div class="module-title">${m.title}</div>
        <div class="module-xp">+${m.xp} XP</div>
      </div>
      <div class="module-detail" id="mdet-${m.id}">${buildModuleDetail(m,done)}</div>`;
    }).join('');
    return`<div class="level-card">
      <div class="level-header ${locked?'locked':''}" id="lhdr-${lv.id}" onclick="${locked?'showLockMsg()':'toggleLevel(\''+lv.id+'\')'}">
        <div class="level-emoji">${lv.emoji}</div>
        <div class="level-info">
          <div class="level-name">${lv.name}</div>
          <div class="level-sub">${lv.sub}</div>
        </div>
        <div class="level-progress">${lvDone}/${lvTotal}</div>
        ${locked?`<div class="level-lock">🔒</div>`:`<div class="level-arr" id="larr-${lv.id}">›</div>`}
      </div>
      <div class="modules-wrap" id="mwrap-${lv.id}">${modules}</div>
    </div>`;
  }).join('');
}

function buildModuleDetail(m, done){
  const t=m.tip;
  const qHtml=m.quiz.map((q,qi)=>`
    <div class="quiz-card" id="qcard-${m.id}-${qi}" data-mid="${m.id}" data-qi="${qi}" data-correct="${q.correct}" data-exp="${encodeURIComponent(q.exp)}">
      <div class="quiz-q">${qi+1}. ${q.q}</div>
      <div class="quiz-opts" id="qopts-${m.id}-${qi}">
        ${q.opts.map((o,oi)=>`<button type="button" class="quiz-opt" data-oi="${oi}" onclick="answerQuiz(this)">${o}</button>`).join('')}
      </div>
      <div class="quiz-explain" id="qexp-${m.id}-${qi}"></div>
    </div>`).join('');
  return`
    <div class="tip-card">
      <div class="tip-label">💡 Совет</div>
      <div class="tip-text">${t.text}</div>
      <div class="tip-example">
        <div class="tip-ex-lbl">Пример диалога:</div>
        <div class="tip-ex-bad"><div class="tip-ex-tag">❌ Плохо</div>${t.bad}</div>
        <div class="tip-ex-good"><div class="tip-ex-tag">✅ Хорошо</div>${t.good}</div>
      </div>
    </div>
    ${qHtml}
    <button type="button" class="module-done-btn" id="mbtn-${m.id}" ${done?'disabled':''} onclick="completeModule('${m.id}',${m.xp})">
      ${done?'✓ ПРОЙДЕНО':'ОТМЕТИТЬ КАК ПРОЙДЕНО'}
    </button>`;
}

function toggleLevel(id){
  const wrap=$('mwrap-'+id),arr=$('larr-'+id);
  wrap.classList.toggle('open');arr.classList.toggle('open');
}
function toggleModule(id){
  const det=$('mdet-'+id);det.classList.toggle('open');
}
function showLockMsg(){alert('🔒 Этот уровень откроется с повышением звания. Продолжай тренировки!')}

function answerQuiz(btn){
  const card=btn.closest(".quiz-card");
  if(!card)return;
  const mId=card.dataset.mid;
  const qIdx=parseInt(card.dataset.qi);
  const correct=parseInt(card.dataset.correct);
  const exp=decodeURIComponent(card.dataset.exp);
  const chosen=parseInt(btn.dataset.oi);
  const opts=card.querySelectorAll(".quiz-opt");
  opts.forEach((b,i)=>{b.disabled=true;if(i===correct)b.classList.add("correct");if(i===chosen&&chosen!==correct)b.classList.add("wrong")});
  const expEl=document.getElementById("qexp-"+mId+"-"+qIdx);
  if(expEl){expEl.textContent=exp;expEl.classList.add("on");}
}

function completeModule(id,xp){
  if(!gs.doneModules)gs.doneModules=[];
  if(gs.doneModules.includes(id))return;
  gs.doneModules.push(id);
  gs.learnModules=(gs.learnModules||0)+1;
  gs.xp+=xp;
  const nw=checkAch();save();
  nw.forEach((a,i)=>setTimeout(()=>showAchPop(a),300+i*4000));
  showAchPop({ic:'📚',nm:'Модуль пройден!',ds:`+${xp} XP получено`});
  renderProfile();updateNavRank();renderLearn();
}

/* ═══════════════════
   PHRASES
═══════════════════ */
function showPhrases(mode,el){
  phrasesMode=mode;
  document.querySelectorAll('.ptab').forEach(t=>t.classList.remove('on'));
  el.classList.add('on');renderPhrases();
}

function renderPhrases(){
  const list=phrasesMode==='fav'?phrases.filter(p=>p.fav):phrases;
  if(!list.length){
    $('phrasesBody').innerHTML=`<div class="phrases-empty">${phrasesMode==='fav'?'Нажмите ⭐ на фразе чтобы добавить в избранное':'Фразы появятся после тренировок. Проведи тренировку! ⚔️'}</div>`;
    return;
  }
  // Group by cat
  const cats={};list.forEach((p,realIdx)=>{
    const idx=phrases.indexOf(p);
    if(!cats[p.cat])cats[p.cat]=[];
    cats[p.cat].push({...p,idx});
  });
  $('phrasesBody').innerHTML=Object.entries(cats).map(([cat,items])=>`
    <div style="margin-bottom:14px">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--t3);margin-bottom:8px">${cat}</div>
      ${items.map(p=>`<div class="phrase-item">
        <div style="flex:1"><div class="phrase-text">"${p.text}"</div><div style="font-size:10px;color:var(--t3);margin-top:3px">${new Date(p.date).toLocaleDateString('ru')}</div></div>
        <button type="button" class="phrase-fav ${p.fav?'on':''}" onclick="toggleFav(${p.idx})" title="${p.fav?'Убрать из избранного':'В избранное'}">${p.fav?'⭐':'☆'}</button>
      </div>`).join('')}
    </div>`).join('');
}

function toggleFav(idx){
  if(phrases[idx])phrases[idx].fav=!phrases[idx].fav;
  save();renderPhrases();
}

function copyPhrases(){
  const favs=phrases.filter(p=>p.fav);
  if(!favs.length){alert('Сначала добавьте фразы в избранное нажав ⭐');return}
  const cats={};favs.forEach(p=>{if(!cats[p.cat])cats[p.cat]=[];cats[p.cat].push(p.text)});
  const text=Object.entries(cats).map(([c,ts])=>`📌 ${c}:\n${ts.map(t=>`• "${t}"`).join('\n')}`).join('\n\n');
  navigator.clipboard.writeText(text).then(()=>{
    const b=document.querySelector('.copy-all-btn');b.textContent='✅ Скопировано!';setTimeout(()=>b.textContent='📋 Скопировать избранное для WhatsApp',2000);
  });
}

/* ── VOICE ── */
function toggleV(mode){
  if(!('webkitSpeechRecognition'in window)&&!('SpeechRecognition'in window)){alert('Голосовой ввод — только Chrome');return}
  if(mode==='iq'){iqRec2?stopVoice('iq'):startVoice('iq')}else{scRec2?stopVoice('sc'):startVoice('sc')}
}
function startVoice(mode){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const r=new SR();r.lang='ru-RU';r.continuous=false;r.interimResults=true;
  const inpId=mode==='iq'?'iqInp':'scInp';
  const btnId=mode==='iq'?'iqVBtn':'scVBtn';
  const stId=mode==='iq'?'iqVSt':'scVSt';
  r.onstart=()=>{$(btnId).classList.add('rec');$(stId).classList.add('on');if(mode==='iq')iqRec2=true;else scRec2=true};
  r.onresult=e=>{let t='';for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;$(inpId).value=t;ar($(inpId))};
  r.onend=()=>{$(btnId).classList.remove('rec');$(stId).classList.remove('on');if(mode==='iq')iqRec2=false;else scRec2=false};
  r.onerror=()=>stopVoice(mode);r.start();
  if(mode==='iq')iqRec=r;else scRec=r;
}
function stopVoice(mode){
  if(mode==='iq'&&iqRec)iqRec.stop();
  if(mode==='sc'&&scRec)scRec.stop();
  iqRec2=false;scRec2=false;
}

/* ── MODALS ── */
const SHEETS_CODE=`function doPost(e){
  try{
    const d=JSON.parse(e.postData.contents);
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    let sh=ss.getSheetByName('Results')||ss.insertSheet('Results');
    if(sh.getLastRow()===0){
      sh.appendRow(['Дата','Имя','TG','Команда','Модуль','Продукт','Сложность','Балл','Исход','XP','Оценки по критериям','Лучший момент','Худший момент','Рекомендации','Диалог']);
      sh.getRange(1,1,1,15).setBackground('#13151f').setFontColor('#f0b429').setFontWeight('bold');
      sh.setColumnWidth(11,220);sh.setColumnWidth(12,300);sh.setColumnWidth(13,300);sh.setColumnWidth(14,350);sh.setColumnWidth(15,500);
    }
    sh.appendRow([new Date(d.date),d.name,d.tg,d.team,d.module,d.product,d.diff,d.total,d.outcome,d.xp,d.scores||'—',d.best||'—',d.worst||'—',d.advice||'—',d.dialog||'—']);
    // Wrap text in detail columns
    const lr=sh.getLastRow();
    sh.getRange(lr,11,1,5).setWrap(true).setVerticalAlignment('top');
    let sv=ss.getSheetByName('Supervisor')||ss.insertSheet('Supervisor');
    if(sv.getLastRow()===0){
      sv.appendRow(['Менеджер','TG','Команда','Тренировок','Ср.балл','Продаж','XP','Последняя активность']);
      sv.getRange(1,1,1,8).setBackground('#13151f').setFontColor('#f0b429').setFontWeight('bold');
    }
    const all=sh.getDataRange().getValues().slice(1).filter(r=>r[1]===d.name);
    const avg=all.reduce((a,r)=>a+(r[7]||0),0)/(all.length||1);
    const wins=all.filter(r=>r[8]==='Продажа').length;
    const txp=all.reduce((a,r)=>a+(r[9]||0),0);
    const svd=sv.getDataRange().getValues();
    let mr=-1;for(let i=1;i<svd.length;i++){if(svd[i][0]===d.name){mr=i+1;break}}
    const row=[d.name,d.tg,d.team,all.length,Math.round(avg*10)/10,wins,txp,new Date(d.date)];
    if(mr>0)sv.getRange(mr,1,1,8).setValues([row]);else sv.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){return ContentService.createTextOutput(JSON.stringify({err:err.toString()})).setMimeType(ContentService.MimeType.JSON)}
}`;

let _sheetsMode='';
function openSheets(m){
  _sheetsMode=m;
  $('sheetsCode').textContent=SHEETS_CODE;
  // Pre-fill saved URL
  const saved=localStorage.getItem('sp_sheets_url');
  if(saved)$('sheetsUrl').value=saved;
  $('mSheets').classList.add('on');
}
async function sendSheets(){
  const url=$('sheetsUrl').value.trim();
  if(!url.startsWith('https://script.google.com')){alert('Введите корректный URL');return}
  // Save URL for future auto-sends
  localStorage.setItem('sp_sheets_url',url);
  await doSendSheets(url,_sheetsMode);
  closeM('mSheets');
}
async function doSendSheets(url,m){
  try{
    const r=m==='iq'?iqResult:scRes;
    const lastH=gs.history[gs.history.length-1];
    const lastDetail=sessionDetails[sessionDetails.length-1];

    // Format dialog
    const dialogText=lastDetail?.dialog?.length
      ? lastDetail.dialog.map(msg=>{
          const who=msg.role==='manager'||msg.role==='mgr'?(user.name||'Менеджер'):'Клиент';
          return `[${who}]: ${msg.content}`;
        }).join('\n')
      : '—';

    // Format scores breakdown
    const scLabel={opening:'Открытие',questions:'Вопросы',pitch:'Презентация',objections:'Возражения',close:'Закрытие'};
    const stages=m==='sc'?(r?.stages||{}):(r?.scores||{});
    const scoresText=Object.entries(stages)
      .map(([k,v])=>`${scLabel[k]||k}: ${v}/10`).join('\n');

    // Format recommendations
    const adviceArr=m==='sc'?(r?.top_advice||[]):(r?.growth||[]);
    const adviceText=adviceArr.length ? adviceArr.map((a,i)=>`${i+1}. ${a}`).join('\n') : '—';

    // Best/worst moment
    const bestMoment=r?.best||'—';
    const worstMoment=r?.worst||'—';

    const payload={
      date:Date.now(),
      name:user.name, tg:user.tg, team:user.team,
      module:m==='iq'?'SalesIQ':'SalesCoach',
      product:m==='iq'?iqRpProduct:scCfg?.product||'—',
      diff:m==='iq'?'—':DLBL[scDiff]||'—',
      total:r?.total||0,
      outcome:r?.verdict||lastH?.outcome||'—',
      xp:lastH?.xp||0,
      scores:scoresText,
      dialog:dialogText,
      advice:adviceText,
      best:bestMoment,
      worst:worstMoment
    };
    await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    return true;
  }catch(e){return false;}
}
// Auto-send to Sheets only if user configured their own URL via the modal
async function autoSendSheets(m){
  const url=localStorage.getItem('sp_sheets_url');
  if(!url) return;
  await doSendSheets(url,m);
}

let _tgMode='';
function openTg(m){
  _tgMode=m;
  const r=m==='iq'?iqResult:scRes;
  const rk=getRank(gs.xp);
  const lastH=gs.history[gs.history.length-1];
  const prod=m==='iq'?iqRpProduct:scCfg.product;
  const diff=m==='iq'?'—':DLBL[scDiff];
  const stages=m==='iq'?Object.entries(r?.scores||{}).map(([k,v])=>`• ${k}: ${v}/10`).join('\n'):Object.entries(r?.stages||{}).map(([k,v])=>{const l={opening:'Открытие',questions:'Вопросы',pitch:'Презентация',objections:'Возражения',close:'Закрытие'};return`• ${l[k]||k}: ${v}/10`}).join('\n');
  const txt=`🎖️ ОТЧЁТ — SalesPRO\n\n👤 ${user.name}\n🔖 ${user.tg} · ${user.team}\n⭐ ${rk.emoji} ${rk.name} (${gs.xp} XP)\n\n📌 ${m==='iq'?'SalesIQ 🔍':'SalesCoach ⚔️'}\n📦 ${prod}\n🎯 ${diff}\n🤝 ${r?.verdict||'—'}\n\n📊 Оценки:\n${stages}\n📈 Общий балл: ${r?.total||'—'}/10\n\n💡 Совет:\n${(m==='iq'?r?.growth?.[0]:r?.top_advice?.[0])||'—'}\n\n✨ XP: +${lastH?.xp||0}\n🏋️ Тренировок: ${gs.sessions}\n\n#SalesPRO #${user.team?.replace(/\s/g,'')||'team'}`;
  $('tgText').textContent=txt;$('mTg').classList.add('on');
}
function copyTg(){navigator.clipboard.writeText($('tgText').textContent).then(()=>{const b=document.querySelector('#mTg .mbtn');b.textContent='✅ Скопировано!';setTimeout(()=>b.textContent='Скопировать',2000)})}
function closeM(id){$(id).classList.remove('on')}
