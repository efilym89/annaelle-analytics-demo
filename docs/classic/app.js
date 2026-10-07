'use strict';

// A browser-only prototype. Every person, object, amount and event is synthetic.
// No CRM credentials, API requests, messages or appointments are used or created.
const DISCLAIMER = 'Все данные — согласованные примеры интерфейса. Altegio и Kommo не подключены.';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = (value, digits = 0) => value == null ? '—' : new Intl.NumberFormat('ru-RU', {maximumFractionDigits:digits}).format(value);
const money = value => value == null ? '—' : num(value) + ' сум';
const pct = value => value == null ? '—' : num(value, 1) + '%';
const sum = (rows, key) => rows.reduce((total, row) => total + Number(typeof key === 'function' ? key(row) : row[key] || 0), 0);
const unique = values => Array.from(new Set(values));
const pad = value => String(value).padStart(3, '0');
const DAY = 86400000;
const TODAY = '2026-10-07';
const EPOCH = '2026-03-15';
const PALETTE = ['#B77A88','#B1B795','#915B69','#D5B39A','#798665'];
const epoch = day => Date.parse(day + 'T00:00:00Z');
const addDays = (day, amount) => new Date(epoch(day) + amount * DAY).toISOString().slice(0, 10);
const dayDiff = (a, b) => Math.round((epoch(a) - epoch(b)) / DAY);
const date = day => day ? day.slice(8,10) + '.' + day.slice(5,7) + '.' + day.slice(0,4) : '—';
const weekday = day => (new Date(epoch(day)).getUTCDay() + 6) % 7;
const median = values => {
  if (!values.length) return null;
  const ordered = values.slice().sort((a,b) => a-b), middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle-1] + ordered[middle]) / 2;
};
const branches = {shota:'Шота Руставели',karasu:'Карасу'};
const periods = {
  month:{start:'2026-09-01',end:'2026-09-30',label:'Сентябрь 2026'},
  october:{start:'2026-10-01',end:TODAY,label:'1–7 октября 2026'},
  week:{start:'2026-10-01',end:TODAY,label:'Последние 7 дней'},
  year:{start:EPOCH,end:TODAY,label:'15 марта — 7 октября 2026'}
};
const sections = [
  {id:'overview',title:'Обзор бизнеса',nav:'Обзор',group:'БИЗНЕС',subtitle:'Главные показатели, динамика и следующий шаг'},
  {id:'sales',title:'Продажи и поступления',nav:'Продажи',group:'БИЗНЕС',subtitle:'Деньги, оказанные услуги и первичные операции'},
  {id:'clients',title:'Клиенты и возвращаемость',nav:'Клиенты и когорты',group:'БИЗНЕС',subtitle:'Единый клиент сети, фактический возврат и следующая запись'},
  {id:'rfm',title:'RFM и клиентские сегменты',nav:'RFM-анализ',group:'БИЗНЕС',subtitle:'Давность визита, частота и реальные платежи'},
  {id:'memberships',title:'Абонементы и обязательства',nav:'Абонементы',group:'ОПЕРАЦИИ',subtitle:'Продажи, доплаты, списания и остаток процедур'},
  {id:'workload',title:'Расписание и загрузка',nav:'Загрузка и записи',group:'ОПЕРАЦИИ',subtitle:'Занятость внутри смен, свободное время и пересечения'},
  {id:'masters',title:'Мастера и эффективность',nav:'Мастера',group:'ОПЕРАЦИИ',subtitle:'Исполнитель процедуры и продавец курса — разные роли'},
  {id:'managers',title:'Команда и коммуникации',nav:'Менеджеры',group:'РОСТ',subtitle:'Подтверждённое авторство, ответы, записи и задачи'},
  {id:'marketing',title:'Маркетинг и воронка',nav:'Лиды и маркетинг',group:'РОСТ',subtitle:'Источник обращения, запись, явка и покупка'},
  {id:'cross',title:'Кросс-покупки и предложения',nav:'Кросс-покупки',group:'РОСТ',subtitle:'Приобретённые зоны и история клиента, без догадок о предложении'},
  {id:'finance',title:'Финансы и рентабельность',nav:'Финансы',group:'УПРАВЛЕНИЕ',subtitle:'Денежный поток отдельно от стоимости выполненных услуг'},
  {id:'planning',title:'План, факт и прогноз',nav:'Планирование',group:'УПРАВЛЕНИЕ',subtitle:'Явные демонстрационные цели, факт и расчёт до конца месяца'},
  {id:'inventory',title:'Склад и движение товаров',nav:'Склад',group:'УПРАВЛЕНИЕ',subtitle:'Начальный остаток, операции периода и контрольный баланс'},
  {id:'quality',title:'Источники и качество данных',nav:'Качество данных',group:'СИСТЕМА',subtitle:'Покрытие истории, неоднозначные связи и словарь метрик'},
  {id:'settings',title:'Настройки пространства',nav:'Настройки',group:'СИСТЕМА',subtitle:'Поведение интерфейса и границы демонстрации'}
];
const services = [
  {id:'bikini',name:'Бикини',zones:['Бикини'],value:190000,duration:25},
  {id:'underarms',name:'Подмышки',zones:['Подмышки'],value:110000,duration:20},
  {id:'legs',name:'Ноги полностью',zones:['Ноги'],value:330000,duration:45},
  {id:'complex',name:'Комплекс из 3 зон',zones:['Бикини','Подмышки','Ноги'],value:510000,duration:60}
];
const masters = [
  {id:'S1',branch:'shota',name:'Мастер-пример А'}, {id:'S2',branch:'shota',name:'Мастер-пример Б'},
  {id:'K1',branch:'karasu',name:'Мастер-пример В'}, {id:'K2',branch:'karasu',name:'Мастер-пример Г'}
];
const managers = [
  {id:'A1',name:'Менеджер-пример А'}, {id:'A2',name:'Менеджер-пример Б'}, {id:'A3',name:'Instagram · пример'}
];
const products = [
  {id:'P1',name:'Уходовый гель · пример',unit:'шт.',cost:40000,price:90000},
  {id:'P2',name:'Успокаивающий крем · пример',unit:'шт.',cost:55000,price:120000},
  {id:'P3',name:'Солнцезащитный уход · пример',unit:'шт.',cost:65000,price:145000},
  {id:'P4',name:'Мини-набор ухода · пример',unit:'шт.',cost:30000,price:70000},
  {id:'P5',name:'Расходный материал · пример',unit:'шт.',cost:1200,price:0}
];
const channelNames = {instagram:'Instagram',telegram:'Telegram',referral:'Рекомендация',direct:'Instagram напрямую'};
const statusNames = {completed:'Состоялся',planned:'Будущая запись',cancelled:'Отменён',noshow:'Неявка'};
const byId = (rows, id) => rows.find(row => row.id === id);
const branchName = branch => branches[branch] || 'Все филиалы';
const masterName = id => (byId(masters,id) || {}).name || '—';
const clientName = id => (byId(DATA.clients,id) || {}).name || 'Клиент-пример';
const serviceName = id => (byId(services,id) || {}).name || '—';

function createDataset() {
  const data = {clients:[],records:[],payments:[],memberships:[],expenses:[],transfers:[],leads:[],messages:[],tasks:[],moves:[],shifts:[]};
  const shiftMaster = (branch, day) => (branch === 'shota' ? 'S' : 'K') + (dayDiff(day,EPOCH) % 2 + 1);
  for (let i = 1; i <= 60; i++) {
    const id = 'C' + pad(i), branch = i % 3 ? 'shota' : 'karasu', first = addDays(EPOCH,i*3);
    const channel = ['instagram','telegram','referral','direct'][i%4];
    data.clients.push({id,name:'Клиент-пример ' + pad(i),branch,created:first,channel});
    let course = null, used = 0;
    if (i % 5 === 0) {
      const units = i % 10 === 0 ? 9 : 5;
      course = {id:'AB' + pad(i),clientId:id,branch,soldAt:first,units,price:units*280000,
        expires:addDays(first,180),sellerId:shiftMaster(branch,first),frozen:i%15===0,
        frozenAt:addDays(first,3*(24+i%3*4)+1),type:units+' процедур · комплекс'};
      data.memberships.push(course);
      const firstPayment = Math.round(course.price*.7);
      data.payments.push({id:'PAY-AB-'+i+'-1',date:first,branch,clientId:id,kind:'payment',category:'Абонемент',amount:firstPayment,courseId:course.id,masterId:course.sellerId});
      if (i % 15 !== 0 && addDays(first,25) <= TODAY) {
        data.payments.push({id:'PAY-AB-'+i+'-2',date:addDays(first,25),branch,clientId:id,kind:'payment',category:'Доплата по абонементу',amount:course.price-firstPayment,courseId:course.id,masterId:course.sellerId});
      }
    }
    for (let j = 0; j < 4+i%5; j++) {
      const day = addDays(first,j*(24+i%3*4));
      if (day > '2026-10-31') continue;
      const visitBranch = i % 7 === 0 && j > 1 ? (branch==='shota'?'karasu':'shota') : branch;
      const service = course ? services[3] : services[(i+j)%4];
      const status = day>TODAY ? 'planned' : j===2 && i%17===0 ? 'cancelled' : j===2 && i%19===0 ? 'noshow' : 'completed';
      const covered = !!course && used < course.units;
      const visit = {id:'V'+pad(i)+'-'+j,clientId:id,date:day,branch:visitBranch,masterId:shiftMaster(visitBranch,day),
        serviceId:service.id,zones:service.zones.slice(),duration:service.duration,start:9*60+(i+j)%9*60+(i%2)*15,
        status,value:covered?280000:service.value,courseId:covered?course.id:null,channel};
      data.records.push(visit);
      if (status !== 'completed') continue;
      if (covered) used++;
      else {
        data.payments.push({id:'PAY-'+visit.id,date:day,branch:visitBranch,clientId:id,kind:'payment',category:'Разовая процедура',
          amount:visit.value,visitId:visit.id,masterId:visit.masterId});
        if (i%13===0 && j===1 && addDays(day,2)<=TODAY) data.payments.push({id:'REF-'+visit.id,date:addDays(day,2),branch:visitBranch,
          clientId:id,kind:'refund',category:'Частичный возврат',amount:-Math.floor(visit.value/2),visitId:visit.id,masterId:visit.masterId});
      }
      data.moves.push({id:'USE-'+visit.id,date:day,branch:visitBranch,productId:'P5',kind:'use',quantity:-1,visitId:visit.id});
      if (i%6===0 && j%2===1) {
        const product = products[(i+j)%4];
        data.moves.push({id:'SALE-'+visit.id,date:day,branch:visitBranch,productId:product.id,kind:'sale',quantity:-1,clientId:id,masterId:visit.masterId});
        data.payments.push({id:'PAY-P-'+visit.id,date:day,branch:visitBranch,clientId:id,kind:'payment',category:'Товар',
          amount:product.price,productId:product.id,visitId:visit.id,masterId:visit.masterId});
      }
    }
    data.leads.push({id:'L'+pad(i),date:addDays(first,-3),branch,clientId:id,channel,managerId:'A'+(i%3+1),booked:true,attended:true,purchased:true,
      fields:i%8===0?2:3,required:3,campaign:channel==='instagram'?'Кампания-пример '+(i%2+1):'Без кампании'});
  }
  for (let i=1;i<=18;i++) data.leads.push({id:'LX'+pad(i),date:addDays('2026-09-02',i*2),branch:i%2?'shota':'karasu',clientId:null,
    channel:['instagram','telegram','referral','direct'][i%4],managerId:'A'+(i%3+1),booked:i%3===0,attended:false,purchased:false,
    fields:i%3,required:3,campaign:'Кампания-пример '+(i%2+1)});
  data.leads.forEach((lead,i) => {
    const authorId = lead.channel==='direct' && i%3===0 ? null : lead.managerId, delay = 2+i%7;
    data.messages.push({id:'MSG-'+lead.id+'-IN',leadId:lead.id,date:lead.date,branch:lead.branch,clientId:lead.clientId,direction:'incoming',authorType:'external',authorId:null,minute:600});
    if (i%6===0) data.messages.push({id:'MSG-'+lead.id+'-BOT',leadId:lead.id,date:lead.date,branch:lead.branch,direction:'outgoing',authorType:'bot',authorId:null,minute:601});
    data.messages.push({id:'MSG-'+lead.id+'-OUT',leadId:lead.id,date:lead.date,branch:lead.branch,clientId:lead.clientId,direction:'outgoing',
      authorType:'internal',authorId,minute:600+delay,replyMinutes:delay});
    data.tasks.push({id:'TASK-'+lead.id,date:lead.date,due:addDays(lead.date,2),branch:lead.branch,managerId:lead.managerId,leadId:lead.id,done:i%5!==0});
  });
  for (let month=3;month<=10;month++) {
    const first='2026-'+String(month).padStart(2,'0')+'-01';
    for (const branch of Object.keys(branches)) {
      const amounts = branch==='shota' ? [1200000,600000,3400000] : [900000,350000,2000000];
      ['Аренда','Реклама','Зарплата'].forEach((category,index) => {
        const day=addDays(first,[0,4,20][index]);
        if (day>=EPOCH && day<=TODAY) data.expenses.push({id:'EXP-'+branch+'-'+month+'-'+index,date:day,branch,category,amount:amounts[index]});
      });
    }
  }
  data.transfers.push({id:'TR-S',date:'2026-09-20',branch:'shota',category:'Перевод между своими кассами',amount:-900000},
    {id:'TR-K',date:'2026-09-20',branch:'karasu',category:'Перевод между своими кассами',amount:900000});
  for (const branch of Object.keys(branches)) for (const product of products) {
    data.moves.push({id:'OPEN-'+branch+'-'+product.id,date:EPOCH,branch,productId:product.id,kind:'opening',quantity:product.id==='P5'?250:80});
    data.moves.push({id:'BUY-'+branch+'-'+product.id,date:'2026-08-10',branch,productId:product.id,kind:'purchase',quantity:product.id==='P5'?100:20});
  }
  for (let day=EPOCH;day<='2026-10-31';day=addDays(day,1)) for (const branch of Object.keys(branches))
    data.shifts.push({id:'SH-'+branch+'-'+day,date:day,branch,masterId:shiftMaster(branch,day),start:540,end:1140,minutes:600});
  return data;
}
const DATA = createDataset();
let saved = {};
try { saved = JSON.parse(localStorage.getItem('annaelle-demo-ui-v2') || '{}'); } catch { /* Optional browser preferences. */ }
const state = {page:'overview',branch:'all',period:'month',compare:saved.compare!==false,reduced:!!saved.reduced,
  viewState:'ready',query:'',sort:'',descending:false,pageNumber:1,master:'all',service:'all',channel:'all',tab:'',plans:saved.plans||{}};
let currentModel, lastFocus, toastTimer, queryTimer, lastRoute = '';
const branchMatches = row => state.branch==='all' || row.branch===state.branch;
const period = () => periods[state.period];
const inPeriod = row => row.date>=period().start && row.date<=period().end;
const humanTime = minutes => String(Math.floor(minutes/60)).padStart(2,'0') + ':' + String(minutes%60).padStart(2,'0');
const nameText = row => [row.name,row.id,row.clientId&&clientName(row.clientId),row.branch&&branchName(row.branch),
  row.category,row.serviceId&&serviceName(row.serviceId),row.channel&&channelNames[row.channel],row.type,row.segment,
  row.masterId&&masterName(row.masterId),row.sellerId&&masterName(row.sellerId),row.managerId&&(byId(managers,row.managerId)||{}).name].filter(Boolean).join(' ').toLowerCase();
const queryMatches = row => !state.query || nameText(row).includes(state.query.toLowerCase().trim());
const futureRecords = clientId => DATA.records.filter(row=>branchMatches(row)&&row.date>period().end&&
  !['cancelled','noshow'].includes(row.status)&&(!clientId||row.clientId===clientId));
function paymentMatches(row) {
  const visit=row.visitId&&byId(DATA.records,row.visitId), course=row.courseId&&byId(DATA.memberships,row.courseId), client=byId(DATA.clients,row.clientId);
  const serviceId=visit?visit.serviceId:course?'complex':null, channel=visit?visit.channel:client&&client.channel;
  return (state.master==='all'||row.masterId===state.master)&&(state.service==='all'||serviceId===state.service)&&
    (state.channel==='all'||channel===state.channel)&&queryMatches({...row,serviceId,channel});
}
function scope() {
  const masterOK = row => state.master==='all' || row.masterId===state.master;
  const serviceOK = row => state.service==='all' || row.serviceId===state.service;
  const channelOK = row => state.channel==='all' || row.channel===state.channel;
  const records=DATA.records.filter(row => branchMatches(row) && inPeriod(row) && masterOK(row) && serviceOK(row) && channelOK(row) && queryMatches(row));
  const payments=DATA.payments.filter(row => branchMatches(row) && inPeriod(row) && paymentMatches(row));
  const completed=records.filter(row=>row.status==='completed');
  const history=DATA.records.filter(row=>row.status==='completed' && row.date<=period().end);
  const leads=DATA.leads.filter(row=>branchMatches(row) && inPeriod(row) && channelOK(row) && queryMatches(row));
  const courses=DATA.memberships.filter(row=>branchMatches(row) && row.soldAt<=period().end &&
    (state.master==='all'||row.sellerId===state.master) && queryMatches(row));
  const expenses=DATA.expenses.filter(row=>branchMatches(row) && inPeriod(row) && (state.page==='masters'||queryMatches(row)));
  const moves=DATA.moves.filter(row=>branchMatches(row) && inPeriod(row));
  const shifts=DATA.shifts.filter(row=>branchMatches(row) && inPeriod(row) && masterOK(row) && (state.page!=='masters'||queryMatches(row)));
  const firstVisit=clientId=>DATA.records.filter(row=>row.clientId===clientId && row.status==='completed').sort((a,b)=>a.date.localeCompare(b.date))[0];
  const clientIds=unique(completed.map(row=>row.clientId));
  const clients=clientIds.map(id=>{
    const client=byId(DATA.clients,id), visits=completed.filter(row=>row.clientId===id), all=history.filter(row=>row.clientId===id);
    const next=futureRecords(id).sort((a,b)=>a.date.localeCompare(b.date))[0];
    return {...client,visits:visits.length,first:firstVisit(id).date,last:all[all.length-1].date,next:next?next.date:null,
      amount:sum(payments.filter(row=>row.clientId===id),'amount'),fresh:inPeriod(firstVisit(id))};
  });
  return {records,completed,payments,history,leads,courses,expenses,moves,shifts,clients,firstVisit};
}
function column(key,label,format,raw) { return {key,label,format,raw}; }
const clientColumn=column('clientId','Клиент',value=>value?'<button class="row-button" data-client="'+esc(value)+'">'+esc(clientName(value))+'</button>':'—',value=>value?clientName(value):'');
const branchColumn=column('branch','Филиал',value=>esc(branchName(value)),branchName);
const dateColumn=column('date','Дата',value=>esc(date(value)));
const amountColumn=column('amount','Сумма, сум',value=>esc(money(value)));
const visitColumns=[column('id','Визит'),clientColumn,dateColumn,branchColumn,column('serviceId','Услуга',value=>esc(serviceName(value)),serviceName),
  column('status','Статус',value=>'<span class="badge '+(value==='completed'?'green':value==='planned'?'rose':'amber')+'">'+esc(statusNames[value])+'</span>',value=>statusNames[value]),
  column('value','Стоимость услуги, сум',value=>esc(money(value)))];
const paymentColumns=[column('id','Операция'),clientColumn,dateColumn,branchColumn,column('category','Основание'),amountColumn];
const courseColumns=[column('id','Экземпляр'),clientColumn,branchColumn,column('type','Пакет'),column('soldAt','Продан',value=>esc(date(value))),
  column('price','Стоимость, сум',value=>esc(money(value))),column('paid','Оплачено, сум',value=>esc(money(value))),
  column('balance','Остаток, процедур'),column('debt','Долг, сум',value=>esc(money(value))),column('statusLabel','Статус')];
function metric(label,value,format,kind,rows,definition) { return {label,value,format:format||num,kind,rows:rows||[],definition:definition||label}; }
const metricHtml = (item,index) => '<button class="metric-card" data-metric="'+index+'"><span class="mini-label">'+esc(item.label)+'</span><strong>'+esc(item.format(item.value))+'</strong><small>'+esc(item.definition)+'</small><span class="trend">Разобрать показатель ↗</span></button>';
const notice = (message,warning=false) => '<div class="info-banner'+(warning?' warning':'')+'">'+esc(message)+'</div>';
const panel = (title,body,description='',wide=false) => '<section class="panel'+(wide?' wide-panel':'')+'"><div class="panel-title"><div><h2>'+esc(title)+'</h2>'+(description?'<p>'+esc(description)+'</p>':'')+'</div></div>'+body+'</section>';
function barList(items,format=num) {
  const max=Math.max(1,...items.map(item=>item.value));
  return '<div class="bar-list">'+items.map((item,i)=>'<div class="bar-row"><div><span>'+esc(item.label)+'</span><strong>'+esc(format(item.value))+'</strong></div><div class="bar-track"><span class="bar-fill" style="width:'+Math.max(0,item.value/max*100)+'%;background:'+PALETTE[i%PALETTE.length]+'"></span></div></div>').join('')+'</div>';
}
function chart(rows,secondary=[],title='Поступления',secondTitle='Оказанные услуги') {
  const buckets=state.period==='year'?unique(rows.concat(secondary).map(row=>row.date.slice(0,7))).sort():Array.from({length:dayDiff(period().end,period().start)+1},(_,i)=>addDays(period().start,i));
  if (!buckets.length) return '<div class="empty-state"><h3>Нет точек для графика</h3><p>Выберите другой период или филиал.</p></div>';
  const isYear=state.period==='year', key=row=>isYear?row.date.slice(0,7):row.date;
  const a=buckets.map(bucket=>sum(rows.filter(row=>key(row)===bucket),row=>row.amount==null?row.value:row.amount));
  const b=buckets.map(bucket=>sum(secondary.filter(row=>key(row)===bucket),row=>row.amount==null?row.value:row.amount));
  const maximum=Math.max(1,...a,...b), x=i=>42+(buckets.length===1?240:i/(buckets.length-1)*520), y=value=>185-value/maximum*145;
  const path=values=>values.map((value,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(value).toFixed(1)).join(' ');
  let svg='<svg class="chart-svg" viewBox="0 0 600 230" role="img" aria-label="'+esc(title+' и '+secondTitle+'; данные-примеры')+'">';
  for(let i=0;i<4;i++){const yy=40+i*48.333;svg+='<line x1="42" x2="562" y1="'+yy+'" y2="'+yy+'" stroke="#E8DFE1"/><text x="0" y="'+(yy+4)+'" fill="#756B6E" font-size="10">'+esc(num(maximum*(3-i)/3/1000000,1))+'</text>';}
  svg+='<path d="'+path(a)+' L '+x(a.length-1)+' 185 L '+x(0)+' 185 Z" fill="#B77A88" opacity=".07"/><path class="chart-line" pathLength="1" d="'+path(a)+'" stroke="#B77A88" fill="none" stroke-width="3"/>';
  if(secondary.length) svg+='<path d="'+path(b)+'" stroke="#798665" fill="none" stroke-width="2.5" stroke-dasharray="6 4"/>';
  buckets.forEach((bucket,i)=>{
    svg+='<circle class="chart-point" cx="'+x(i)+'" cy="'+y(a[i])+'" r="4" fill="#B77A88" tabindex="0" role="button" data-bucket="'+bucket+'" aria-label="'+esc(bucket+': '+money(a[i]))+'"><title>'+esc(bucket+' · '+money(a[i]))+'</title></circle>';
    if(i%Math.max(1,Math.ceil(buckets.length/6))===0||i===buckets.length-1) svg+='<text x="'+x(i)+'" y="216" text-anchor="middle" fill="#756B6E" font-size="10">'+esc(isYear?bucket.slice(5)+'.2026':date(bucket).slice(0,5))+'</text>';
  });
  return '<div class="chart">'+svg+'</svg><div class="legend"><span><i style="background:#B77A88"></i>'+esc(title)+'</span>'+(secondary.length?'<span><i style="background:#798665"></i>'+esc(secondTitle)+'</span>':'')+'<span>млн сум · нажмите точку</span></div></div>';
}
function donut(items) {
  const total=sum(items,'value'), radius=60, circumference=2*Math.PI*radius;
  let offset=0,svg='<svg class="donut-svg" viewBox="0 0 180 180" role="img" aria-label="Структура выборки — пример"><circle cx="90" cy="90" r="'+radius+'" stroke="#F3E4EA" stroke-width="16" fill="none"/>';
  items.forEach((item,i)=>{const arc=total?item.value/total*circumference:0;svg+='<circle cx="90" cy="90" r="'+radius+'" fill="none" stroke="'+PALETTE[i%PALETTE.length]+'" stroke-width="16" stroke-dasharray="'+arc+' '+(circumference-arc)+'" stroke-dashoffset="'+(-offset)+'" transform="rotate(-90 90 90)"/>';offset+=arc;});
  svg+='<text x="90" y="87" text-anchor="middle" fill="#231F20" font-size="24">'+esc(num(total))+'</text><text x="90" y="109" text-anchor="middle" fill="#756B6E" font-size="10">в выборке</text></svg>';
  return '<div class="donut">'+svg+'<div class="legend">'+items.map((item,i)=>'<span><i style="background:'+PALETTE[i%PALETTE.length]+'"></i>'+esc(item.label)+' · '+esc(num(item.value))+'</span>').join('')+'</div></div>';
}
function smallTable(rows,columns) {
  return '<div class="table-wrap"><table class="data-table"><thead><tr>'+columns.map(col=>'<th scope="col">'+esc(col.label)+'</th>').join('')+'</tr></thead><tbody>'+
    (rows.length?rows.map(row=>'<tr>'+columns.map(col=>'<td>'+(col.format?col.format(row[col.key],row):esc(row[col.key]==null?'—':row[col.key]))+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+columns.length+'">Нет строк для выбранных условий.</td></tr>')+'</tbody></table></div>';
}
function courseRows(s) {
  return s.courses.map(course=>{
    const usage=s.history.filter(visit=>visit.courseId===course.id), paid=sum(DATA.payments.filter(row=>row.courseId===course.id && row.date<=period().end),'amount');
    const balance=Math.max(0,course.units-usage.length);
    return {...course,paid,used:usage.length,balance,debt:Math.max(0,course.price-paid),
      soldInPeriod:course.soldAt>=period().start,statusLabel:!balance?'Завершён':course.expires<period().end?'Истёк':course.frozen&&course.frozenAt<=period().end?'Заморожен · пример':'Действует'};
  });
}
function rfmRows(s) {
  const ids=unique(s.history.filter(branchMatches).map(row=>row.clientId));
  return ids.map(id=>{
    const client=byId(DATA.clients,id), visits=s.history.filter(row=>row.clientId===id), last=visits.slice().sort((a,b)=>b.date.localeCompare(a.date))[0].date;
    const r=dayDiff(period().end,last), f=visits.length, m=sum(DATA.payments.filter(row=>row.clientId===id&&row.date<=period().end),'amount');
    const segment=r>120?'Спящие':r>75?'Под риском':f>=7&&r<=35?'Чемпионы':f>=3&&r<=55?'Лояльные':f===1&&r<=35?'Новички':'Нужно внимание';
    return {...client,last,r,f,m,segment,next:futureRecords(id).length?'Есть следующая запись':'Нет следующей записи'};
  }).filter(queryMatches);
}
function unionMinutes(records) {
  const intervals=records.map(row=>[row.start,row.start+row.duration]).sort((a,b)=>a[0]-b[0]);
  let total=0,start=null,end=null;
  for(const interval of intervals){if(start===null){[start,end]=interval;}else if(interval[0]<=end){end=Math.max(end,interval[1]);}else{total+=end-start;[start,end]=interval;}}
  return total+(start===null?0:end-start);
}
function workloadStats(s) {
  let busy=0, overlap=0;
  for(const shift of s.shifts){
    const occupied=s.records.filter(row=>row.masterId===shift.masterId&&row.date===shift.date&&['completed','planned'].includes(row.status));
    busy+=unionMinutes(occupied.map(row=>({...row,start:Math.max(shift.start,row.start),duration:Math.max(0,Math.min(shift.end,row.start+row.duration)-Math.max(shift.start,row.start))})));
    overlap+=Math.max(0,sum(occupied,'duration')-unionMinutes(occupied));
  }
  const capacity=sum(s.shifts,'minutes');
  return {busy,capacity,overlap,percent:capacity?busy/capacity*100:null,free:Math.max(0,capacity-busy)/60};
}
function heatmap(s) {
  let html='<div class="heatmap"><span></span>'+['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(day=>'<span class="heat-label">'+day+'</span>').join('');
  for(let hour=9;hour<19;hour++){
    html+='<span class="heat-label">'+hour+':00</span>';
    for(let day=0;day<7;day++){
      const shifts=s.shifts.filter(row=>weekday(row.date)===day), capacity=shifts.length*60;
      const visits=s.records.filter(row=>weekday(row.date)===day&&['completed','planned'].includes(row.status));
      let occupied=0;
      for(const shift of shifts) occupied+=unionMinutes(visits.filter(row=>row.date===shift.date&&row.masterId===shift.masterId).map(row=>({...row,start:Math.max(hour*60,row.start),
        duration:Math.max(0,Math.min((hour+1)*60,row.start+row.duration)-Math.max(hour*60,row.start))})).filter(row=>row.duration>0));
      const value=capacity?occupied/capacity*100:0;
      html+='<button class="heat-cell" data-heat="'+day+'|'+hour+'" style="background:rgba(177,183,149,'+(.12+Math.min(100,value)/130)+');color:#231F20" aria-label="'+['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'][day]+' '+hour+':00, '+pct(value)+'">'+pct(value)+'</button>';
    }
  }
  return html+'</div>';
}
const actionRow = (title,description,page) => '<button class="action-row" data-nav="'+page+'"><span><strong>'+esc(title)+'</strong><small>'+esc(description)+'</small></span><span>↗</span></button>';
function getModel() {
  const s=scope(), net=sum(s.payments,'amount'), value=sum(s.completed,'value'), fresh=s.clients.filter(row=>row.fresh), courses=courseRows(s);
  const model={id:state.page,scope:s,rows:[],columns:[],metrics:[],panels:'',description:'Данные-примеры · '+period().label,kind:'generic',tableTitle:'Состав отчёта',definition:''};
  const visitsMetric=metric('Состоявшиеся визиты',s.completed.length,num,'visit',s.completed,'Уникальные visit ID, не сумма зон');
  const netMetric=metric('Чистые поступления',net,money,'payment',s.payments,'Платежи минус возвраты; курсы не задвоены');
  const valueMetric=metric('Оказанные услуги',value,money,'visit',s.completed,'Стоимость состоявшихся процедур');
  switch(state.page) {
    case 'overview':
      model.rows=s.completed;model.columns=visitColumns;model.kind='visit';model.tableTitle='Визиты выбранного периода';
      model.metrics=[netMetric,visitsMetric,metric('Новые клиенты сети',fresh.length,num,'client',fresh,'Первый визит во всей истории'),metric('Активные клиенты',s.clients.length,num,'client',s.clients,'Один человек — один сетевой ID')];
      model.panels='<div class="overview-grid">'+panel('Динамика студии',chart(s.payments,s.completed),'Поступления и услуги — разные основания',true)+
        panel('Фокус внимания','<div class="action-list">'+actionRow('Продолжение курса',courses.filter(row=>row.balance>0&&!futureRecords(row.clientId).length).length+' курсов-примеров: проверить следующую запись','memberships')+
        actionRow('Качество обращений',s.leads.filter(row=>row.fields<row.required).length+' карточек-примеров с неполными полями','quality')+actionRow('Расписание',num(workloadStats(s).free,1)+' свободных часов в сменах · пример','workload')+'</div>')+
        panel('Клиенты',donut([{label:'Первый визит',value:fresh.length},{label:'Повторные',value:s.clients.length-fresh.length}]))+
        panel('Популярные услуги',barList(services.map(service=>({label:service.name,value:s.completed.filter(v=>v.serviceId===service.id).length}))))+
        panel('По филиалам',barList(Object.keys(branches).map(branch=>({label:branches[branch],value:sum(s.payments.filter(row=>row.branch===branch),'amount')})),money))+'</div>';
      break;
    case 'sales':
      model.rows=s.payments;model.columns=paymentColumns;model.kind='payment';model.tableTitle='Платежи и возвраты';
      model.metrics=[netMetric,valueMetric,metric('Средний платёж',s.payments.filter(row=>row.kind==='payment').length?sum(s.payments.filter(row=>row.kind==='payment'),'amount')/s.payments.filter(row=>row.kind==='payment').length:null,money,'payment',s.payments.filter(row=>row.kind==='payment'),'Положительные оплаты / число платежей'),
        metric('Возвраты',-sum(s.payments.filter(row=>row.kind==='refund'),'amount'),money,'payment',s.payments.filter(row=>row.kind==='refund'),'Возвраты отдельными операциями')];
      model.panels='<div class="section-grid">'+panel('Оплаты и оказание',chart(s.payments,s.completed),'Погашение процедуры курса не является новой оплатой')+
        panel('Основания поступлений',barList(unique(s.payments.map(row=>row.category)).map(category=>({label:category,value:sum(s.payments.filter(row=>row.category===category),'amount')})),money))+'</div>';
      model.definition='Средний платёж, стоимость визита и стоимость покупки имеют разные знаменатели.';
      break;
    case 'clients': {
      model.rows=s.clients;model.kind='client';model.tableTitle='Единые клиенты сети';
      model.columns=[column('id','Клиент',id=>'<button class="row-button" data-client="'+id+'">'+esc(clientName(id))+'</button>'),column('first','Первый визит',v=>date(v)),
        column('last','Последний визит',v=>date(v)),column('visits','Визитов за период'),column('amount','Оплаты периода, сум',v=>money(v)),column('next','Следующая запись',v=>date(v))];
      const returned=s.clients.filter(client=>s.history.filter(v=>v.clientId===client.id).length>1);
      model.metrics=[metric('Уникальные клиенты',s.clients.length,num,'client',s.clients,'Дедупликация между филиалами'),metric('Новые для сети',fresh.length,num,'client',fresh,'Первый состоявшийся визит'),
        metric('Фактически возвращались',returned.length,num,'client',returned,'Больше одного визита в истории'),metric('Есть будущая запись',s.clients.filter(row=>row.next).length,num,'client',s.clients.filter(row=>row.next),'Запись — ожидание, не возврат')];
      const cohorts=unique(s.history.filter(branchMatches).map(v=>s.firstVisit(v.clientId).date.slice(0,7))).sort().map(month=>{
        const ids=unique(s.history.filter(branchMatches).map(v=>v.clientId)).filter(id=>s.firstVisit(id).date.startsWith(month));
        const eligible=ids.filter(id=>dayDiff(period().end,s.firstVisit(id).date)>=30);
        const comeback=eligible.filter(id=>s.history.some(v=>v.clientId===id&&v.date>s.firstVisit(id).date&&dayDiff(v.date,s.firstVisit(id).date)<=30));
        return {month,total:ids.length,eligible:eligible.length,returned:comeback.length,rate:eligible.length?comeback.length/eligible.length*100:null};
      });
      model.panels='<div class="section-grid">'+panel('Первые и повторные',donut([{label:'Новые',value:fresh.length},{label:'Повторные',value:s.clients.length-fresh.length}]))+
        panel('Когорты · окно 30 дней',smallTable(cohorts,[column('month','Первый визит'),column('total','Клиентов'),column('eligible','Окно закрыто'),column('rate','Вернулись',v=>pct(v))]),'История до даты среза; незрелая когорта не равна нулевому возврату')+'</div>';
      break;
    }
    case 'rfm': {
      model.rows=rfmRows(s);model.kind='client';model.tableTitle='Сегменты на дату среза';
      model.columns=[column('id','Клиент',id=>'<button class="row-button" data-client="'+id+'">'+esc(clientName(id))+'</button>'),column('segment','Сегмент'),column('r','R, дней'),column('f','F, визитов'),column('m','M, сум',v=>money(v)),column('next','Следующая запись')];
      model.metrics=[metric('Клиентов в сегментации',model.rows.length,num,'client',model.rows,'На '+date(period().end)),metric('Лояльные и чемпионы',model.rows.filter(r=>['Лояльные','Чемпионы'].includes(r.segment)).length,num,'client',model.rows.filter(r=>['Лояльные','Чемпионы'].includes(r.segment)),'R и F · пример правил'),
        metric('Нужно вернуть внимание',model.rows.filter(r=>['Под риском','Спящие'].includes(r.segment)).length,num,'client',model.rows.filter(r=>['Под риском','Спящие'].includes(r.segment)),'Не является командой рассылки'),
        metric('Платежи этих клиентов',sum(model.rows,'m'),money,'client',model.rows,'Вся история до даты среза, без двойного учёта')];
      model.panels=window.renderRfmViews(model.rows,{num,money,esc});
      model.definition='R — дней от последнего состоявшегося визита; F — уникальные визиты; M — платежи минус возвраты по сети. Пороги сегментов демонстрационные, денежные пороги не утверждены.';
      break;
    }
    case 'memberships':
      model.rows=courses;model.columns=courseColumns;model.kind='course';model.tableTitle='Экземпляры курсов на дату среза';
      model.metrics=[metric('Продано за период',courses.filter(c=>c.soldInPeriod).length,num,'course',courses.filter(c=>c.soldInPeriod),'Продажа, а не создание карточки'),
        metric('Осталось процедур',sum(courses,'balance'),num,'course',courses,'Проданные единицы минус состоявшиеся списания'),metric('Обязательства по услугам',sum(courses,c=>c.balance*c.price/c.units),money,'course',courses,'Стоимость неоказанной части · пример'),
        metric('Неоплаченная часть',sum(courses,'debt'),money,'course',courses.filter(c=>c.debt>0),'Стоимость пакета минус платежи до среза')];
      model.panels='<div class="section-grid">'+panel('Статусы курсов',barList(unique(courses.map(c=>c.statusLabel)).map(label=>({label,value:courses.filter(c=>c.statusLabel===label).length}))))+
        panel('История использования',smallTable(s.completed.filter(v=>v.courseId),visitColumns),'Только состоявшиеся списания выбранного периода')+'</div>';
      model.definition='Продажа пакета, его оплата и использование процедур — три разных события. Для текущего остатка берётся история до среза.';
      break;
    case 'workload': {
      const load=workloadStats(s);model.rows=s.records;model.columns=visitColumns;model.kind='visit';model.tableTitle='Записи, составляющие загрузку';
      model.metrics=[metric('Плановая занятость',load.percent,pct,'shift',s.shifts,'Объединённые занятые интервалы / смены'),visitsMetric,metric('Свободное время',load.free,v=>num(v,1)+' ч','shift',s.shifts,'Внутри выбранных рабочих смен'),
        metric('Пересечения',load.overlap,v=>num(v)+' мин','visit',s.records,'Сумма интервалов минус их объединение')];
      model.panels=panel('Занятость по дням и часам',heatmap(s),'Нажмите ячейку: откроются только её записи. Отмены и неявки не занимают время.');
      model.definition='Один кабинет-пример на филиал. Время пересечений не удваивает занятую ёмкость; будущая запись не является неявкой.';
      break;
    }
    case 'masters': {
      model.rows=masters.filter(master=>branchMatches(master)&&(state.master==='all'||state.master===master.id)).map(master=>{
        const visits=s.completed.filter(v=>v.masterId===master.id), shifts=s.shifts.filter(v=>v.masterId===master.id), income=sum(visits,'value');
        const branchVisits=DATA.records.filter(v=>v.branch===master.branch&&inPeriod(v)&&v.status==='completed'), denominator=sum(branchVisits,'duration'), allocation=denominator?sum(s.expenses.filter(e=>e.branch===master.branch),'amount')*sum(visits,'duration')/denominator:0;
        const consumables=visits.length*1200;
        return {...master,visits:visits.length,clients:unique(visits.map(v=>v.clientId)).length,income,hours:sum(shifts,'minutes')/60,
          courses:courses.filter(c=>c.sellerId===master.id&&c.soldInPeriod).length,cost:allocation+consumables,profit:income-allocation-consumables,perHour:sum(shifts,'minutes')?income/(sum(shifts,'minutes')/60):null};
      }).filter(queryMatches);model.kind='master';
      model.columns=[column('name','Мастер'),branchColumn,column('visits','Визиты'),column('clients','Клиенты'),column('income','Оказано услуг, сум',v=>money(v)),
        column('courses','Продано курсов'),column('perHour','На час смены, сум',v=>money(v)),column('profit','Результат по услугам, сум',v=>money(v))];
      model.metrics=[visitsMetric,valueMetric,metric('Смены мастеров',s.shifts.length,num,'shift',s.shifts,'Фактическая ёмкость из реестра-примера'),
        metric('Продававшие курсы',model.rows.filter(row=>row.courses>0).length,num,'master',model.rows.filter(row=>row.courses>0),'Продавец отличается от исполнителя')];
      model.panels=panel('Оказанные услуги по мастерам',barList(model.rows.map(r=>({label:r.name,value:r.income})),money));
      model.definition='Общие расходы-примеры распределяются внутри филиала пропорционально времени состоявшихся процедур; результат по услугам не включает товарную маржу.';
      break;
    }
    case 'managers': {
      const ids=new Set(s.leads.map(l=>l.id)), replies=DATA.messages.filter(m=>ids.has(m.leadId)&&m.authorType==='internal');
      model.rows=managers.map(manager=>{
        const own=replies.filter(m=>m.authorId===manager.id), leads=s.leads.filter(l=>l.managerId===manager.id), tasks=DATA.tasks.filter(t=>ids.has(t.leadId)&&t.managerId===manager.id);
        return {...manager,dialogs:unique(own.map(m=>m.leadId)).length,response:median(own.map(m=>m.replyMinutes)),bookings:leads.filter(l=>l.booked).length,
          tasks:tasks.length,done:tasks.filter(t=>t.done).length,quality:leads.length?sum(leads,'fields')/sum(leads,'required')*100:null};
      }).filter(queryMatches);model.kind='manager';
      model.columns=[column('name','Сотрудник'),column('dialogs','Диалоги с авторством'),column('response','Первый ответ, мин',v=>num(v,1)),column('bookings','Созданы записи'),column('done','Задачи выполнены'),column('quality','Поля этапа',v=>pct(v))];
      model.metrics=[metric('Ответы человека',replies.filter(m=>m.authorId).length,num,'message',replies.filter(m=>m.authorId),'Бот исключён'),metric('Неизвестный автор',replies.filter(m=>!m.authorId).length,num,'message',replies.filter(m=>!m.authorId),'Не назначаем по ответственному сделки'),
        metric('Созданные записи',sum(model.rows,'bookings'),num,'lead',s.leads.filter(l=>l.booked),'Отдельная роль создателя · пример'),metric('Выполненные задачи',sum(model.rows,'done'),num,'task',DATA.tasks.filter(t=>ids.has(t.leadId)&&t.done),'Исходные task ID · пример')];
      model.panels=panel('Подтверждённые диалоги',barList(model.rows.map(row=>({label:row.name,value:row.dialogs}))));
      model.definition='Ответы-примеры происходят в рабочих часах 09:00–19:00. Для неизвестного автора нет персонального рейтинга; сообщения из Instagram не назначаются человеку автоматически.';
      break;
    }
    case 'marketing': {
      model.rows=s.leads;model.kind='lead';model.tableTitle='Обращения и их исход';
      model.columns=[column('id','Обращение'),dateColumn,branchColumn,column('channel','Канал',v=>esc(channelNames[v]),v=>channelNames[v]),column('campaign','Кампания'),
        column('booked','Запись',v=>v?'Да':'Нет'),column('attended','Явка',v=>v?'Да':'Нет'),column('purchased','Покупка',v=>v?'Да':'Нет')];
      model.metrics=[metric('Обращения',s.leads.length,num,'lead',s.leads,'По дате создания обращения'),metric('Обращение → запись',s.leads.length?s.leads.filter(l=>l.booked).length/s.leads.length*100:null,pct,'lead',s.leads.filter(l=>l.booked),'Знаменатель — все обращения выборки'),
        metric('Явки',s.leads.filter(l=>l.attended).length,num,'lead',s.leads.filter(l=>l.attended),'Проверенная связь с состоявшимся визитом'),metric('Покупки',s.leads.filter(l=>l.purchased).length,num,'lead',s.leads.filter(l=>l.purchased),'Покупка, а не прогноз по этапу')];
      model.panels='<div class="section-grid">'+panel('Воронка выборки',barList([{label:'Обращения',value:s.leads.length},{label:'Запись',value:s.leads.filter(l=>l.booked).length},{label:'Явка',value:s.leads.filter(l=>l.attended).length},{label:'Покупка',value:s.leads.filter(l=>l.purchased).length}]))+
        panel('Источники обращений',barList(Object.keys(channelNames).map(channel=>({label:channelNames[channel],value:s.leads.filter(l=>l.channel===channel).length}))))+'</div>';
      model.definition='Когорты обращений считаются по дате обращения; последующие события наблюдаются до даты среза. Данные этой воронки не подменяют кассовый отчёт.';
      break;
    }
    case 'finance': {
      const transfers=DATA.transfers.filter(row=>branchMatches(row)&&inPeriod(row)&&queryMatches(row)), consumables=s.moves.filter(m=>m.kind==='use').length*1200;
      const goods=s.payments.filter(p=>p.category==='Товар'), goodsCost=s.moves.filter(m=>m.kind==='sale').reduce((t,m)=>t+-m.quantity*byId(products,m.productId).cost,0);
      model.rows=s.payments.concat(s.expenses.map(row=>({...row,amount:-row.amount,clientId:null,kind:'expense'})),transfers.map(row=>({...row,kind:'transfer',clientId:null}))).sort((a,b)=>a.date.localeCompare(b.date));
      model.columns=[column('id','Операция'),dateColumn,branchColumn,column('kind','Тип',v=>({payment:'Оплата',refund:'Возврат',expense:'Расход',transfer:'Внутренний перевод'}[v])),column('category','Статья'),amountColumn];model.kind='flow';
      const pnl=value+sum(goods,'amount')-sum(s.expenses,'amount')-consumables-goodsCost;
      model.metrics=[netMetric,metric('Денежный поток',sum(model.rows,'amount'),money,'flow',model.rows,'Включает движения между кассами филиалов'),
        metric('Управленческий результат',pnl,money,'flow',model.rows,'Оказание + товары − расходы и себестоимость'),metric('Расходы по операциям',sum(s.expenses,'amount'),money,'expense',s.expenses,'Аренда, зарплата, реклама · примеры')];
      const pnlRows=[{name:'Оказанные услуги',amount:value},{name:'Продажа товаров',amount:sum(goods,'amount')},{name:'Расходы',amount:-sum(s.expenses,'amount')},
        {name:'Материалы и себестоимость товаров',amount:-consumables-goodsCost},{name:'Управленческий результат',amount:pnl}];
      model.panels='<div class="section-grid">'+panel('PnL · демонстрационная методика',smallTable(pnlRows,[column('name','Основание'),amountColumn]))+
        panel('Статьи расходов',barList(unique(s.expenses.map(e=>e.category)).map(label=>({label,value:sum(s.expenses.filter(e=>e.category===label),'amount')})),money))+'</div>';
      model.definition='Внутренние переводы не являются доходом сети. Для PnL использована стоимость оказания, для cashflow — реальные операции-примеры; неоказанный остаток курса не добавляется в выручку.';
      break;
    }
    case 'planning': {
      model.rows=Object.keys(branches).filter(branch=>state.branch==='all'||state.branch===branch).map(branch=>{
        const key=state.period+'-'+branch, fallback=state.period==='month'?(branch==='shota'?18000000:9000000):state.period==='year'?null:(branch==='shota'?6000000:3000000);
        const target=Object.prototype.hasOwnProperty.call(state.plans,key)?state.plans[key]:fallback, fact=sum(s.payments.filter(p=>p.branch===branch),'amount');
        const elapsed=dayDiff(period().end,period().start)+1, monthly=state.period!=='year', daysInMonth=new Date(Date.UTC(2026,Number(period().start.slice(5,7)),0)).getUTCDate();
        return {id:branch,branch,target,fact,rate:target?fact/target*100:null,gap:target==null?null:Math.max(0,target-fact),forecast:monthly?fact/elapsed*daysInMonth:null};
      });model.kind='plan';
      model.columns=[branchColumn,column('target','План-пример, сум',v=>money(v)),column('fact','Факт, сум',v=>money(v)),column('rate','Выполнение',v=>pct(v)),
        column('gap','Осталось до цели, сум',v=>money(v)),column('forecast','Прогноз месяца, сум',v=>money(v)),column('id','Изменить',v=>'<button class="row-button" data-plan="'+v+'">Цель-пример ↗</button>')];
      const hasTarget=model.rows.some(r=>r.target!=null);
      model.metrics=[metric('План-пример',hasTarget?sum(model.rows,r=>r.target||0):null,money,'plan',model.rows,'Явная демонстрационная цель'),netMetric,
        metric('До цели',hasTarget?sum(model.rows,r=>r.gap||0):null,money,'plan',model.rows,'Без цели показываем «План не задан»'),metric('Записи после среза',futureRecords().length,num,'visit',futureRecords(),'Следующая запись не равна поступлению')];
      model.panels=panel('План и факт по филиалам',barList(model.rows.map(r=>({label:branchName(r.branch)+' · факт',value:r.fact})),money));
      model.definition='Прогноз — линейная экстраполяция выбранных дней до конца месяца, не обещание дохода. Цели редактируются только в браузере этого макета.';
      break;
    }
    case 'cross': {
      model.rows=s.clients.map(client=>{
        const visits=s.history.filter(v=>v.clientId===client.id), zones=unique(visits.flatMap(v=>v.zones));
        const bought=DATA.payments.filter(p=>p.clientId===client.id&&p.productId&&p.date<=period().end).length;
        return {...client,zones:zones.join(', '),zoneCount:zones.length,goods:bought,suggestion:zones.length<3?'Проверить интерес к другой зоне':'Уточнить продолжение курса'};
      });model.kind='client';
      model.columns=[column('id','Клиент',id=>'<button class="row-button" data-client="'+id+'">'+esc(clientName(id))+'</button>'),column('zones','Зоны в истории'),column('goods','Покупки товаров'),column('next','Следующая запись',v=>date(v)),column('suggestion','Возможный следующий шаг')];
      const cross=model.rows.filter(r=>r.zoneCount>1);
      model.metrics=[metric('Клиентов выборки',model.rows.length,num,'client',model.rows,'Состоявшийся визит в периоде'),metric('Несколько зон',cross.length,num,'client',cross,'Комплекс раскрывается на зоны'),
        metric('Доля нескольких зон',model.rows.length?cross.length/model.rows.length*100:null,pct,'client',cross,'Знаменатель — клиенты выборки'),metric('Покупали уход',model.rows.filter(r=>r.goods>0).length,num,'client',model.rows.filter(r=>r.goods>0),'Отдельная товарная покупка')];
      const zones=['Бикини','Подмышки','Ноги'], matrix=zones.map(zone=>({name:zone,...Object.fromEntries(zones.map((other,index)=>['z'+index,model.rows.filter(r=>r.zones.includes(zone)&&r.zones.includes(other)).length]))}));
      model.panels=panel('Матрица приобретённых зон',smallTable(matrix,[column('name','Зона'),...zones.map((z,i)=>column('z'+i,z))]),'Клиенты с обеими зонами в истории до среза; диагональ — охват зоны');
      model.definition='История покупки не доказывает, что сотрудник предлагал или не предлагал услугу. Макет не отправляет предложения клиентам.';
      break;
    }
    case 'inventory': {
      model.rows=Object.keys(branches).filter(b=>state.branch==='all'||state.branch===b).flatMap(branch=>products.map(product=>{
        const history=DATA.moves.filter(m=>m.branch===branch&&m.productId===product.id), moves=history.filter(m=>inPeriod(m)&&m.kind!=='opening');
        const opening=sum(history.filter(m=>m.date<period().start||(m.kind==='opening'&&m.date===period().start)),'quantity'), delta=sum(moves,'quantity');
        return {id:branch+'-'+product.id,branch,name:product.name,unit:product.unit,opening,incoming:sum(moves.filter(m=>m.quantity>0),'quantity'),
          outgoing:-sum(moves.filter(m=>m.quantity<0),'quantity'),closing:opening+delta,cost:(opening+delta)*product.cost};
      })).filter(queryMatches);model.kind='stock';
      model.columns=[column('name','Номенклатура'),branchColumn,column('unit','Единица'),column('opening','На начало'),column('incoming','Приход'),column('outgoing','Расход'),column('closing','На конец'),column('cost','Остаток по себестоимости, сум',v=>money(v))];
      model.metrics=[metric('Позиций на складах',model.rows.length,num,'stock',model.rows,'Товар × филиал'),metric('Приход, единиц',sum(model.rows,'incoming'),num,'stock',model.rows,'Единицы в колонке номенклатуры'),
        metric('Расход, единиц',sum(model.rows,'outgoing'),num,'stock',model.rows,'Продажи и материалы раздельными движениями'),metric('Остаток по себестоимости',sum(model.rows,'cost'),money,'stock',model.rows,'Начальный остаток + полное движение')];
      model.panels=panel('Изменение остатков',barList(model.rows.map(r=>({label:r.name+' · '+branchName(r.branch),value:r.closing}))));
      model.definition='Исторический остаток вычислен из начальных остатков-примеров и всех движений до даты среза; единицы измерения не скрываются.';
      break;
    }
    case 'quality': {
      const mappings=[['Altegio · клиенты',s.clients.length,'Сетевой ID'],['Altegio · записи',s.records.length,'visit ID и статус'],['Altegio · платежи',s.payments.length,'Отдельные возвраты'],
        ['Altegio · курсы',courses.length,'Экземпляр и списания'],['Altegio · смены',s.shifts.length,'Ёмкость расписания'],['Kommo · обращения',s.leads.length,'Исходные lead ID'],
        ['Kommo · сообщения',DATA.messages.filter(m=>s.leads.some(l=>l.id===m.leadId)).length,'Неизвестное авторство сохранено'],['Склад · движения',s.moves.length,'Начальные остатки есть']];
      model.rows=mappings.map((row,i)=>({id:'SOURCE-'+i,name:row[0],count:row[1],coverage:row[2],from:EPOCH,to:period().end,status:'Пример · API не подключён'})).filter(queryMatches);model.kind='source';
      model.columns=[column('name','Источник'),column('count','Строк выборки'),column('coverage','Контроль'),column('from','Граница примера',v=>date(v)),column('to','Дата среза',v=>date(v)),column('status','Режим')];
      const unknown=DATA.messages.filter(m=>s.leads.some(l=>l.id===m.leadId)&&m.authorType==='internal'&&!m.authorId);
      model.metrics=[metric('Источников-примеров',model.rows.length,num,'source',model.rows,'Не статус рабочих интеграций'),metric('Карточки требуют проверки',s.leads.filter(l=>l.fields<l.required).length,num,'lead',s.leads.filter(l=>l.fields<l.required),'Поля проверяются по требованиям этапа'),
        metric('Неизвестный автор',unknown.length,num,'message',unknown,'Не подменяется владельцем сделки'),metric('Версия правил',2,v=>'DEMO '+v,'source',model.rows,'Контрольные расчёты по единому реестру')];
      model.panels=panel('Словарь и границы',notice('Данные-примеры охватывают '+date(EPOCH)+' — '+date(TODAY)+'. Реальное покрытие CRM здесь не проверялось.')+
        '<div class="action-list">'+actionRow('Единица посещения','Визит — самостоятельный объект; комплекс может содержать несколько зон','workload')+actionRow('Денежный учёт','Платёж по курсу не повторяется при каждом списании','sales')+actionRow('Персональное авторство','Неизвестный автор исключён из персональной скорости ответа','managers')+'</div>');
      break;
    }
    case 'settings':
      model.rows=[{name:'Режим данных',value:'Только синтетические примеры'},{name:'Рабочие API',value:'Не подключены'},{name:'Филиалы',value:'Шота Руставели и Карасу'},
        {name:'Часовой пояс',value:'Asia/Tashkent'},{name:'Тема оформления',value:window.AnnaelleAppearance?.theme==='dark'?'Тёмная':'Светлая'},{name:'Уменьшить движение',value:state.reduced?'Да':'Нет'},{name:'Сравнение периодов',value:state.compare?'Да':'Нет'},{name:'Отправка сообщений / записи',value:'Недоступна'}].filter(queryMatches);
      model.columns=[column('name','Настройка'),column('value','Значение')];model.kind='setting';model.tableTitle='Конфигурация макета';
      model.panels='<div class="section-grid">'+panel('Комфорт интерфейса','<div class="setting-row"><div class="appearance-choice"><span class="appearance-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.5 13A8.6 8.6 0 0 1 11 3.5 8.6 8.6 0 1 0 20.5 13Z"/></svg></span><div><strong>Тёмная тема</strong><p>Мягкий свет, контрастные графики. Выбор сохраняется в этом браузере.</p></div></div><button class="switch" role="switch" aria-checked="'+(window.AnnaelleAppearance?.theme==='dark')+'" data-setting="theme" aria-label="Тёмная тема"></button></div><div class="setting-row"><div><strong>Уменьшить движение</strong><p>Учитывается и системная настройка. Счётчики не стартуют с нуля.</p></div><button class="switch" role="switch" aria-checked="'+state.reduced+'" data-setting="reduced" aria-label="Уменьшить движение"></button></div><div class="setting-row"><div><strong>Сравнивать периоды</strong><p>Сопоставление с таким же предшествующим окном.</p></div><button class="switch" role="switch" aria-checked="'+state.compare+'" data-setting="compare" aria-label="Сравнивать периоды"></button></div><button class="outline-button" data-reset-demo>Сбросить только макет</button>')+
        panel('Подключения','<div class="connection-row"><strong>Altegio</strong><span class="badge amber">Нет подключения</span><button class="link-button" data-connection="altegio">Границы ↗</button></div><div class="connection-row"><strong>Kommo</strong><span class="badge amber">Нет подключения</span><button class="link-button" data-connection="kommo">Границы ↗</button></div>'+notice('API-ключей в макете нет. Рабочие подключения настраиваются отдельно на сервере.'))+'</div>';
      break;
  }
  return model;
}

function persist() { try { localStorage.setItem('annaelle-demo-ui-v2',JSON.stringify({compare:state.compare,reduced:state.reduced,plans:state.plans})); } catch { /* Session still works. */ } }
function routeHash() {
  const params=new URLSearchParams({branch:state.branch,period:state.period});
  if(!state.compare) params.set('compare','0');
  if(state.master!=='all') params.set('master',state.master);
  if(state.service!=='all') params.set('service',state.service);
  if(state.channel!=='all') params.set('channel',state.channel);
  return '#'+state.page+'?'+params.toString();
}
function applyRoute() {
  const parts=location.hash.slice(1).split('?'), params=new URLSearchParams(parts[1]||'');
  state.page=sections.some(s=>s.id===parts[0])?parts[0]:'overview';
  state.branch=['all','shota','karasu'].includes(params.get('branch'))?params.get('branch'):'all';
  state.period=Object.keys(periods).includes(params.get('period'))?params.get('period'):'month';
  if(params.has('compare')) state.compare=params.get('compare')!=='0';
  state.master=masters.some(m=>m.id===params.get('master'))?params.get('master'):'all';
  state.service=services.some(s=>s.id===params.get('service'))?params.get('service'):'all';
  state.channel=Object.keys(channelNames).includes(params.get('channel'))?params.get('channel'):'all';
  state.query='';state.sort='';state.pageNumber=1;
}
const iconPaths = {search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
  overview:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5"/>',
  chart:'<path d="M4 19V5m0 14h16M8 15l4-5 4 3 4-7"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
  settings:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8m-8 12h4"/>'};
const icon = name => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(iconPaths[name]||iconPaths.chart)+'</svg>';
function navigation() {
  let group='';
  $('#navigation').innerHTML=sections.map(section=>{
    const heading=section.group!==group?'<div class="nav-group">'+section.group+'</div>':'';group=section.group;
    const symbol=section.id==='overview'?'overview':['clients','managers','masters','rfm'].includes(section.id)?'people':['workload','planning'].includes(section.id)?'calendar':['quality','settings'].includes(section.id)?'settings':'chart';
    return heading+'<button class="nav-item" data-nav="'+section.id+'">'+icon(symbol)+'<span>'+section.nav+'</span></button>';
  }).join('');
}
function extraFilters() {
  let html='';
  if(['masters','workload','sales'].includes(state.page)) html+='<label>Мастер <select data-filter="master" aria-label="Мастер"><option value="all">Все мастера</option>'+masters.filter(branchMatches).map(m=>'<option value="'+m.id+'"'+(state.master===m.id?' selected':'')+'>'+esc(m.name)+'</option>').join('')+'</select></label>';
  if(['sales','workload','clients'].includes(state.page)) html+='<label>Услуга <select data-filter="service" aria-label="Услуга"><option value="all">Все услуги</option>'+services.map(s=>'<option value="'+s.id+'"'+(state.service===s.id?' selected':'')+'>'+esc(s.name)+'</option>').join('')+'</select></label>';
  if(['marketing','managers'].includes(state.page)) html+='<label>Канал <select data-filter="channel" aria-label="Канал"><option value="all">Все каналы</option>'+Object.keys(channelNames).map(key=>'<option value="'+key+'"'+(state.channel===key?' selected':'')+'>'+channelNames[key]+'</option>').join('')+'</select></label>';
  return html?'<div class="report-filters">'+html+'</div>':'';
}
function sortedRows() {
  const rows=currentModel.rows.slice(), col=currentModel.columns.find(c=>c.key===state.sort);
  if(col) rows.sort((a,b)=>{const av=a[col.key],bv=b[col.key];const order=typeof av==='number'&&typeof bv==='number'?av-bv:String(av||'').localeCompare(String(bv||''),'ru');return state.descending?-order:order;});
  return rows;
}
function reportTable() {
  const rows=sortedRows(), size=10, pages=Math.max(1,Math.ceil(rows.length/size));
  state.pageNumber=Math.min(pages,state.pageNumber);
  const visible=rows.slice((state.pageNumber-1)*size,state.pageNumber*size), cols=currentModel.columns;
  const table='<div class="table-wrap"><table class="data-table"><thead><tr>'+cols.map(col=>'<th scope="col"><button class="table-sort" data-sort="'+col.key+'">'+esc(col.label)+(state.sort===col.key?(state.descending?' ↓':' ↑'):'')+'</button></th>').join('')+
    '<th scope="col">Детали</th></tr></thead><tbody>'+(visible.length?visible.map(row=>'<tr>'+cols.map(col=>'<td>'+(col.format?col.format(row[col.key],row):esc(row[col.key]==null?'—':row[col.key]))+'</td>').join('')+
      '<td><button class="row-button" data-detail="'+esc(row.id||row.name)+'" aria-label="Открыть детали '+esc(row.id||row.name)+'">↗</button></td></tr>').join(''):'<tr><td colspan="'+(cols.length+1)+'">Нет строк. Уточните условия поиска.</td></tr>')+'</tbody></table></div>';
  return '<section class="panel table-panel"><div class="table-toolbar"><div><h2>'+esc(currentModel.tableTitle)+'</h2><p>'+num(rows.length)+' строк · текущие фильтры</p></div><input id="report-search" class="table-search" value="'+esc(state.query)+'" placeholder="Найти в отчёте…" aria-label="Поиск в выбранном отчёте"></div>'+
    table+'<div class="pagination"><span>Страница '+state.pageNumber+' из '+pages+'</span><div><button class="outline-button" data-page="-1"'+(state.pageNumber===1?' disabled':'')+'>Назад</button><button class="outline-button" data-page="1"'+(state.pageNumber===pages?' disabled':'')+'>Далее</button></div></div></section>';
}
function comparison() {
  if(!state.compare||['settings','quality','rfm','inventory','memberships'].includes(state.page)) return '';
  const length=dayDiff(period().end,period().start)+1, end=addDays(period().start,-1), start=addDays(end,1-length);
  const previous=DATA.payments.filter(row=>branchMatches(row)&&row.date>=start&&row.date<=end&&paymentMatches(row)), current=currentModel.scope.payments;
  return '<div class="report-meta">Сравнение: '+date(start)+' — '+date(end)+' · чистые поступления '+money(sum(previous,'amount'))+' → '+money(sum(current,'amount'))+
    ' <span class="badge rose">'+(sum(previous,'amount')?pct((sum(current,'amount')/sum(previous,'amount')-1)*100):'Нет базы сравнения')+'</span></div>';
}
function render(options={}) {
  const scroll=window.scrollY, focused=document.activeElement, isSearch=focused&&focused.id==='report-search', caret=isSearch?focused.selectionStart:null;
  currentModel=getModel();
  const section=sections.find(s=>s.id===state.page);
  $('#page-title').textContent=section.title;$('#page-subtitle').textContent=section.subtitle;
  if($('#breadcrumb-current')) $('#breadcrumb-current').textContent=section.nav;
  $('#branch-filter').value=state.branch;$('#period-filter').value=state.period;
  if($('#compare-toggle')) $('#compare-toggle').checked=state.compare;
  if($('#view-state')) $('#view-state').value=state.viewState;
  if($('#date-label')) $('#date-label').textContent=date(period().start)+' — '+date(period().end)+' · Ташкент, UTC+5';
  if($('#sync-summary')) $('#sync-summary').textContent=(state.viewState==='stale'?'Пример устаревшего среза · ':'Пример среза · ')+date(period().end)+' · API не подключены';
  $$('.nav-item').forEach(button=>{const active=button.dataset.nav===state.page;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  document.body.classList.toggle('reduced-motion',state.reduced);
  document.documentElement.classList.toggle('reduce-appearance-motion',state.reduced);
  let html='<div class="page-intro"><span class="kicker">ДЕМОНСТРАЦИОННЫЙ ОТЧЁТ</span><h2>'+esc(section.subtitle)+'</h2><p>'+esc(branchName(state.branch)+' · '+period().label)+'</p></div>'+extraFilters();
  if(state.viewState==='loading') html+='<div class="empty-state loading-preview" aria-busy="true">'+(window.AnnaelleAppearance?.loaderMarkup()||'')+'<h3>Подготавливаем отчёт</h3><p>Так будет выглядеть загрузка аналитики.<br>Сейчас это предпросмотр — запросов к CRM нет.</p><div class="loading-lines" aria-hidden="true"><span></span><span></span></div><button class="primary-button" data-retry>Показать готовый отчёт</button></div>';
  else if(state.viewState==='error') html+='<div class="empty-state"><h3>Пример ошибки источника</h3><p>Данные не заменены нулями. В рабочем интерфейсе здесь останется последний проверенный срез.</p><button class="primary-button" data-retry>Повторить демонстрацию</button></div>';
  else if(state.viewState==='empty') html+='<div class="empty-state"><h3>Пример пустой выборки</h3><p>Для выбранного сценария нет строк; это не сообщение об отсутствии данных в рабочей CRM.</p><button class="primary-button" data-retry>Вернуться к данным-примерам</button></div>';
  else {
    if(state.viewState==='stale') html+=notice('Пример устаревшего источника: показаны последние синтетические значения. Реальной синхронизации нет.',true);
    html+='<div class="metric-grid">'+currentModel.metrics.map(metricHtml).join('')+'</div>'+comparison()+(currentModel.definition?notice(currentModel.definition):'')+currentModel.panels+reportTable();
  }
  html+='<div class="report-meta">'+esc(DISCLAIMER)+' · Правила DEMO v2 · '+esc(currentModel.rows.length)+' строк в текущем отчёте</div>';
  $('#view').innerHTML=html;$('#view').setAttribute('aria-busy',String(state.viewState==='loading'));
  $('#export-button').disabled=['loading','empty','error'].includes(state.viewState);
  if(isSearch&&$('#report-search')) {$('#report-search').focus({preventScroll:true});$('#report-search').setSelectionRange(caret,caret);}
  if(!options.navigation) window.scrollTo({top:scroll,behavior:'instant'});
}
function navigate(page) {
  if(!sections.some(section=>section.id===page)) return;
  closeModal(false);state.page=page;state.query='';state.sort='';state.pageNumber=1;state.master='all';state.service='all';state.channel='all';
  history.pushState(null,'',routeHash());lastRoute=location.hash;
  $('#sidebar').classList.remove('open');$('#sidebar-backdrop').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');
  render({navigation:true});window.scrollTo({top:0,behavior:'instant'});
}
function toast(message) {clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
function closeModal(restore=true) {
  $('#drawer').hidden=true;$('#search-modal').hidden=true;$('#modal-backdrop').hidden=true;document.body.style.overflow='';
  if(restore&&lastFocus&&lastFocus.isConnected) lastFocus.focus({preventScroll:true});
}
function openDrawer(title,body) {
  if($('#drawer').hidden&&$('#search-modal').hidden) lastFocus=document.activeElement;
  $('#search-modal').hidden=true;$('#drawer-title').textContent=title;$('#drawer-content').innerHTML='<span class="badge rose">Данные-примеры</span>'+body+'<p>'+esc(DISCLAIMER)+'</p>';
  $('#modal-backdrop').hidden=false;$('#drawer').hidden=false;document.body.style.overflow='hidden';$('#drawer-close').focus({preventScroll:true});
}
function detailList(rows,kind) {
  let columns;
  if(kind==='visit') columns=visitColumns;
  else if(['payment','flow','expense'].includes(kind)) columns=paymentColumns;
  else if(kind==='course') columns=courseColumns;
  else if(kind==='client') columns=[column('id','Клиент',id=>'<button class="row-button" data-client="'+id+'">'+esc(clientName(id))+'</button>'),column('visits','Визиты периода'),column('amount','Оплаты периода, сум',v=>money(v))];
  else columns=Object.keys(rows[0]||{}).filter(k=>['id','name','date','branch','minutes','amount','authorId','authorType','leadId','done'].includes(k)).map(key=>column(key,{id:'ID',name:'Наименование',date:'Дата',branch:'Филиал',minutes:'Минут',amount:'Сумма',authorId:'Автор',authorType:'Тип автора',leadId:'Обращение',done:'Выполнено'}[key]));
  return smallTable(rows.slice(0,80),columns)+(rows.length>80?'<p>Первые 80 строк из '+rows.length+'. Полный текущий отчёт доступен в CSV.</p>':'');
}
function clientDrawer(id) {
  const client=byId(DATA.clients,id);if(!client) return;
  const visits=currentModel.scope.completed.filter(v=>v.clientId===id), payments=currentModel.scope.payments.filter(p=>p.clientId===id);
  const courses=courseRows(currentModel.scope).filter(c=>c.clientId===id);
  openDrawer(client.name,'<div class="detail-row"><span>Сетевой ID-пример</span><strong>'+id+'</strong></div><div class="detail-row"><span>Визиты выбранного периода</span><strong>'+visits.length+'</strong></div>'+
    '<div class="detail-row"><span>Чистые оплаты периода</span><strong>'+money(sum(payments,'amount'))+'</strong></div><h3>Состоявшиеся визиты · текущие фильтры</h3>'+detailList(visits,'visit')+
    '<h3>Оплаты и возвраты</h3>'+detailList(payments,'payment')+(courses.length?'<h3>Курсы до даты среза</h3>'+detailList(courses,'course'):'')+
    '<div class="drawer-note">Это вымышленная карточка. Здесь нет реального телефона, ссылок на клиента CRM или возможности отправить сообщение.</div>');
}
function inspectRow(id) {
  const row=currentModel.rows.find(r=>String(r.id||r.name)===id);if(!row) return;
  if(currentModel.kind==='client') return clientDrawer(row.id);
  const body=currentModel.columns.filter(c=>c.label!=='Изменить').map(col=>'<div class="detail-row"><span>'+esc(col.label)+'</span><strong>'+(col.format?col.format(row[col.key],row):esc(row[col.key]==null?'—':row[col.key]))+'</strong></div>').join('');
  let extra='';
  if(currentModel.kind==='course') extra='<h3>Использование до среза</h3>'+detailList(currentModel.scope.history.filter(v=>v.courseId===row.id),'visit');
  if(currentModel.kind==='master') extra='<h3>Процедуры выбранного периода</h3>'+detailList(currentModel.scope.completed.filter(v=>v.masterId===row.id),'visit');
  if(currentModel.kind==='manager') extra='<h3>Сообщения с подтверждённым авторством</h3>'+detailList(DATA.messages.filter(m=>m.authorId===row.id&&currentModel.scope.leads.some(l=>l.id===m.leadId)),'message');
  openDrawer(row.name||row.id||'Детали отчёта',body+extra);
}
function csvCell(value) {
  let text=String(value==null?'':value);
  if(typeof value==='string'&&/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text="'"+text;
  return '"'+text.replace(/"/g,'""')+'"';
}
function exportRows() {
  const section=sections.find(s=>s.id===state.page), rows=sortedRows();
  const result=[['ANNAELLE — ТОЛЬКО ПРИМЕРЫ, НЕ РЕАЛЬНЫЕ ДАННЫЕ'],['Отчёт',section.title],['Филиал',branchName(state.branch)],['Период',period().start,period().end],
    ['Дата среза-примера',period().end],['Состояние',state.viewState],['Поиск',state.query],['Мастер',state.master],['Услуга',state.service],['Канал',state.channel],[],
    ['Показатель','Значение','Определение'],...currentModel.metrics.map(m=>[m.label,m.value,m.definition]),[],currentModel.columns.filter(c=>c.label!=='Изменить').map(c=>c.label)];
  const columns=currentModel.columns.filter(c=>c.label!=='Изменить');
  rows.forEach(row=>result.push(columns.map(col=>col.raw?col.raw(row[col.key],row):row[col.key])));
  return result;
}
function exportCurrent() {
  if(['loading','empty','error'].includes(state.viewState)) return toast('Экспорт недоступен для этого демонстрационного состояния');
  const content='\uFEFF'+exportRows().map(row=>row.map(csvCell).join(';')).join('\r\n');
  const blob=new Blob([content],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='ANNAELLE-DEMO-'+state.page+'-'+state.branch+'-'+state.period+'.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Скачан только текущий отчёт с его фильтрами и отметкой DEMO');
}
function searchResults(query) {
  const q=query.toLowerCase().trim(), found=sections.filter(s=>(s.title+' '+s.nav).toLowerCase().includes(q));
  const clients=q?DATA.clients.filter(c=>(state.branch==='all'||DATA.records.some(v=>v.clientId===c.id&&v.branch===state.branch))&&nameText(c).includes(q)).slice(0,12):[];
  $('#search-results').innerHTML='<div class="search-result-count">РАЗДЕЛЫ И ДЕМО-КЛИЕНТЫ</div>'+found.map(s=>'<button class="search-result" data-search-nav="'+s.id+'">'+icon('chart')+esc(s.title)+'<small>Отчёт ↗</small></button>').join('')+
    clients.map(c=>'<button class="search-result" data-search-client="'+c.id+'">'+icon('people')+esc(c.name)+'<small>'+c.id+'</small></button>').join('')+
    (!found.length&&!clients.length?'<div class="empty-state"><p>Ничего не найдено. Попробуйте «финансы» или «Клиент-пример».</p></div>':'');
}
function openSearch() {lastFocus=document.activeElement;$('#drawer').hidden=true;$('#search-modal').hidden=false;$('#modal-backdrop').hidden=false;document.body.style.overflow='hidden';$('#global-search').value='';searchResults('');$('#global-search').focus();}
function help() {openDrawer('Как читать аналитику','<h3>Единая выборка</h3><p>Выберите филиал и период. Карточки, таблицы, детали и CSV используют один синтетический реестр.</p><h3>Правильные единицы</h3><p>Визит не равен зоне, поступление не равно оказанию, списание курса не является новой оплатой.</p><h3>Подробности и экспорт</h3><p>Карточка показателя раскрывает составляющие. Таблицы сортируются и листаются. CSV содержит только открытый отчёт с его фильтрами.</p><h3>Границы макета</h3><p>15 разделов полностью локальны. Состояния загрузки, ошибки, пустоты и устаревания — управляемые примеры, не статус рабочих API.</p>');}
function changeFilter(key,value) {
  state[key]=value;state.pageNumber=1;state.sort='';
  if(key==='branch'&&state.master!=='all'&&!masters.some(m=>m.id===state.master&&(value==='all'||m.branch===value))) state.master='all';
  history.replaceState(null,'',routeHash());lastRoute=location.hash;render();
}
function dispatch(event) {
  const target=event.target.closest('[data-nav],[data-metric],[data-client],[data-detail],[data-sort],[data-page],[data-heat],[data-bucket],[data-setting],[data-reset-demo],[data-connection],[data-retry],[data-search-nav],[data-search-client],[data-plan]');
  if(!target) return;
  const d=target.dataset;
  if(d.nav) navigate(d.nav);
  else if(d.metric!==undefined){const m=currentModel.metrics[Number(d.metric)];openDrawer(m.label,'<div class="drawer-number">'+esc(m.format(m.value))+'</div><div class="drawer-note">'+esc(m.definition)+'</div><p>'+esc(branchName(state.branch)+' · '+period().label)+'</p>'+detailList(m.rows,m.kind));}
  else if(d.client) clientDrawer(d.client);
  else if(d.detail) inspectRow(d.detail);
  else if(d.sort){state.descending=state.sort===d.sort?!state.descending:false;state.sort=d.sort;render();}
  else if(d.page){state.pageNumber+=Number(d.page);render();}
  else if(d.heat){const [day,hour]=d.heat.split('|').map(Number);openDrawer('Записи ячейки расписания',detailList(currentModel.scope.records.filter(v=>weekday(v.date)===day&&v.start<(hour+1)*60&&v.start+v.duration>hour*60&&['completed','planned'].includes(v.status)),'visit'));}
  else if(d.bucket){const rows=currentModel.scope.payments.filter(p=>p.date.startsWith(d.bucket));openDrawer('Поступления · '+d.bucket,detailList(rows,'payment'));}
  else if(d.setting){if(d.setting==='theme') window.AnnaelleAppearance.setTheme(window.AnnaelleAppearance.theme==='dark'?'light':'dark');else {state[d.setting]=!state[d.setting];persist();}document.documentElement.classList.toggle('reduce-appearance-motion',state.reduced);render();requestAnimationFrame(()=>document.querySelector('[data-setting="'+d.setting+'"]')?.focus({preventScroll:true}));toast('Настройка сохранена только в браузере');}
  else if(d.resetDemo!==undefined){Object.assign(state,{branch:'all',period:'month',master:'all',service:'all',channel:'all',query:'',compare:true,reduced:false,plans:{},pageNumber:1,viewState:'ready'});persist();history.replaceState(null,'',routeHash());render();toast('Сброшены только настройки макета');}
  else if(d.connection) openDrawer(d.connection==='altegio'?'Altegio · границы':'Kommo · границы','<div class="drawer-note">Здесь нет настоящего подключения. Будущий адаптер должен работать на сервере с отдельными правами чтения, журналом полноты и сверкой исходных объектов.</div><p>Ключи, токены и реальные клиентские данные в этот интерфейс не вводятся.</p>');
  else if(d.retry!==undefined){state.viewState='ready';render();}
  else if(d.searchNav){closeModal(false);navigate(d.searchNav);}
  else if(d.searchClient){closeModal(false);navigate('clients');clientDrawer(d.searchClient);}
  else if(d.plan){const row=currentModel.rows.find(r=>r.branch===d.plan);openDrawer('Демонстрационная цель · '+branchName(d.plan),'<form id="demo-plan-form" data-branch="'+d.plan+'"><p>Это локальный пример, не изменение бизнес-плана в рабочей системе. Пустое поле означает «План не задан».</p><label>План на выбранный период, сум<input class="table-search" id="demo-plan-value" type="number" min="0" max="1000000000" step="1000" value="'+(row.target==null?'':row.target)+'" aria-label="Демонстрационная цель в сумах"></label><div class="drawer-actions"><button class="primary-button" type="submit">Сохранить пример</button></div></form>');}
}
document.addEventListener('click',dispatch);
document.addEventListener('annaelle:rfm-viewchange',()=>{if(state.page==='rfm')render();});
document.addEventListener('change',event=>{if(event.target.dataset.filter) changeFilter(event.target.dataset.filter,event.target.value);});
document.addEventListener('input',event=>{
  if(event.target.id==='report-search'){clearTimeout(queryTimer);state.query=event.target.value;state.pageNumber=1;queryTimer=setTimeout(()=>render(),160);}
});
document.addEventListener('submit',event=>{
  if(event.target.id!=='demo-plan-form') return;
  event.preventDefault();const raw=$('#demo-plan-value').value, value=raw===''?null:Number(raw);
  if(value!==null&&(!Number.isFinite(value)||value<0||value>1000000000)) return toast('Введите цель от 0 до 1 млрд сум');
  state.plans[state.period+'-'+event.target.dataset.branch]=value;persist();closeModal();render();toast('Цель-пример сохранена в этом браузере');
});
$('#branch-filter').addEventListener('change',event=>changeFilter('branch',event.target.value));
$('#period-filter').addEventListener('change',event=>changeFilter('period',event.target.value));
$('#reset-filter').addEventListener('click',()=>{Object.assign(state,{branch:'all',period:'month',master:'all',service:'all',channel:'all',query:'',pageNumber:1});history.replaceState(null,'',routeHash());render();});
if($('#compare-toggle')) $('#compare-toggle').addEventListener('change',event=>{state.compare=event.target.checked;persist();history.replaceState(null,'',routeHash());render();});
if($('#view-state')) $('#view-state').addEventListener('change',event=>{state.viewState=event.target.value;render();});
$('#export-button').addEventListener('click',exportCurrent);
$('#search-button').addEventListener('click',openSearch);
$('#global-search').addEventListener('input',event=>searchResults(event.target.value));
$('#drawer-close').addEventListener('click',()=>closeModal());
$('#search-close').addEventListener('click',()=>closeModal());
$('#modal-backdrop').addEventListener('click',()=>closeModal());
$('#help-button').addEventListener('click',help);
$('.brand').addEventListener('click',event=>{event.preventDefault();navigate('overview');});
$('#profile-button').addEventListener('click',()=>openDrawer('Пространство ANNAELLE','<p>Демонстрационный интерфейс владельца. Права доступа к рабочим данным здесь не проверяются и не предоставляются.</p><div class="detail-row"><span>Режим</span><strong>Локальные данные-примеры</strong></div>'));
$('#notifications-button').addEventListener('click',()=>openDrawer('Примеры событий','<p>События сформированы из той же выбранной выборки. Это не уведомления рабочей CRM.</p><div class="action-list">'+actionRow('Курсы требуют внимания',courseRows(currentModel.scope).filter(c=>c.debt>0).length+' курсов-примеров с неоплаченной частью','memberships')+actionRow('Карточки обращений',currentModel.scope.leads.filter(l=>l.fields<l.required).length+' примеров неполных карточек','quality')+'</div>'));
$('#menu-button').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#sidebar-backdrop').hidden=!open;$('#menu-button').setAttribute('aria-expanded',String(open));});
$('#sidebar-backdrop').addEventListener('click',()=>{$('#sidebar').classList.remove('open');$('#sidebar-backdrop').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');});
document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openSearch();}
  if(event.key==='Escape'){closeModal();$('#sidebar').classList.remove('open');$('#sidebar-backdrop').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');}
  if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-bucket]')){event.preventDefault();dispatch(event);}
  if(event.key==='Tab'){
    const dialog=!$('#drawer').hidden?$('#drawer'):!$('#search-modal').hidden?$('#search-modal'):null;
    if(dialog){const controls=$$('button,a,input,select,[tabindex="0"]',dialog).filter(c=>!c.disabled&&c.getClientRects().length);
      const first=controls[0],last=controls[controls.length-1];if(!first)return;
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  }
});
function routeChanged(){if(lastRoute===location.hash)return;lastRoute=location.hash;closeModal(false);applyRoute();render({navigation:true});window.scrollTo({top:0,behavior:'instant'});}
window.addEventListener('popstate',routeChanged);window.addEventListener('hashchange',routeChanged);
$('#search-button').innerHTML=icon('search');$('#menu-button').innerHTML=icon('menu');$('#drawer-close').innerHTML=icon('close');
$('#search-field-icon').innerHTML=icon('search');$('#branch-icon').innerHTML=icon('people');$('#period-icon').innerHTML=icon('calendar');
$('#export-button').innerHTML=icon('download')+'<span>Экспорт отчёта</span>';$('#notifications-button').insertAdjacentHTML('afterbegin',icon('bell'));
$('#menu-button').setAttribute('aria-expanded','false');
applyRoute();navigation();history.replaceState(null,'',routeHash());lastRoute=location.hash;render();

// Small public diagnostic for browser QA; contains only synthetic consistency counts.
window.AnnaelleDemoAudit = () => ({
  clients:DATA.clients.length,records:DATA.records.length,payments:DATA.payments.length,courses:DATA.memberships.length,sections:sections.length,
  uniqueVisitIds:unique(DATA.records.map(row=>row.id)).length,networkClientIds:unique(DATA.clients.map(row=>row.id)).length,
  transferBalance:sum(DATA.transfers,'amount'),currentRows:currentModel.rows.length,currentReport:state.page,
  currentNetPayments:sum(currentModel.scope.payments,'amount'),currentCompletedVisits:currentModel.scope.completed.length,
  csvRows:exportRows().length,workingAPIsConnected:false
});
