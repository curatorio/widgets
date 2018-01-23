

function _k (o, key, val) {
    // console.log(key);
    let kPath = key.split('.');
    for (let i=0;i<kPath.length;i++) {
        let k = kPath[i];
        if (!o[k]) {
            o[k] = {};
        }
        if (i === kPath.length-1) {
            o[k] = val;
        } else {
            o = o[k];
        }
    }
}

const langsData = `
id,en,de,it,nl,es,fr,po,ru
load-more,Load more,Mehr anzeigen,Di più,Laad meer,Cargar más,Voir plus,Carregar Mais,Загрузить больше
minutes-ago.1,{n} minute ago,Vor einer Minute,Un minuto fa,{n} minuut geleden,Hace un minuto,Il y a {n} minute,Tem um minuto,Одну минуту назад
minutes-ago.n,{n} minutes ago,Vor {n} Minuten,{n} minuti fa,{n} minuten geleden,Hace {n} minutos,Il y a {n} minutes,Tem {n} minutos,{n} минут назад
hours-ago.1,{n} hour ago,Vor einer Stunde,Un'ora fa,{n} uur geleden,Hace una hora,Il y a {n} heure,Tem {n} hora,Один час назад
hours-ago.n,{n} hours ago,Vor {n} Stunden,{n} ore fa,{n} uren geleden,Hace {n} horas,Il y a {n} heures,Tem {n} horas,{n} часов назад
days-ago.1,{n} day ago,Vor einem Tag,Un giorno fa,{n} dag geleden,Hace un día,Il y a {n} jour,Faz um dia,Один день назад
days-ago.n,{n} days ago,Vor {n} Tagen,{n} giorni fa,{n} dagen geleden,Hace {n} días,Il y a {n} jours,Fazem {n} dias,{n} дней назад
weeks-ago.1,{n} week ago,Vor einer Woche,Una settimana fa,{n} week geleden,Hace una semana,Il y a {n} semaine,Faz uma semana,Одну неделю назад
weeks-ago.n,{n} weeks ago,Vor {n} Wochen,{n} settimane fa,{n} weken geleden,Hace {n} semanas,Il y a {n} semaines,Fazem {n} semanas,{n} недель назад
months-ago.1,{n} month ago,Vor einem Monat,Un mese fa,{n} maand geleden,Hace un mes,Il y a {n} mois,Tem um mês,Один месяц назад
months-ago.n,{n} months ago,Vor {n} Monaten,{n} mesi,{n} maanden geleden,Hace {n} meses,Il y a {n} mois,Tem {n} meses,{n} месяцев назад
yesterday,Yesterday,Gestern,Ieri,Gisteren,Ayer,Hier,Ontem,Вчера
just-now,Just now,Eben,Appena,Nu,Ahora,Il y a un instant,Agora,Только что
previous,Previous,Zurück,Indietro,Vorige,Anterior,Précédent,Anterior,Предыдущий
next,Next,Weiter,Più,Volgende,Siguiente,Suivant,Próximo,Следующий
comments,Comments,Kommentare,Commenti,Comments,Comentarios,Commentaires,Comentários,Комментарии
likes,Likes,Gefällt mir,Mi piace,Likes,Me gusta,J'aime,Curtir,Лайки
read-more,Read more,Weiterlesen,Di più,Lees meer,Leer más,En savoir plus,Leia mais,Подробнее
filter,Filter,Filtern,Filtrare,Filtreren,filtrar,Filtrer,Filtro,фильтровать
all,All,Alle,Tutti,Alle,Todas,Tout,Todos,все
`;


let langs = {};
let langDataLines = langsData.split('\n');

// Remove unused lines
for (let i = langDataLines.length-1 ; i>=0 ; i--) {
    if (!langDataLines[i]) {
        langDataLines.splice(i,1);
    }
}
let keys = langDataLines[0].split(',');

for (let i=1;i<langDataLines.length;i++) {
    let langDataCols = langDataLines[i].split(',');
    for (let j = 1;j < langDataCols.length;j++) {
        _k (langs, keys[j]+'.'+langDataCols[0], langDataCols[j]);
    }
}

export default langs;
