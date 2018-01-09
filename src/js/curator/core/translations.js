

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
id,en,de,it,nl,es
load-more,Load more,Mehr anzeigen,Di più,Laad meer,Cargar más
minutes.1,{n} minute ago,Vor einer Minute,Un minuto fa,{n} minuut geleden,Hace un minuto
minutes.n,{n} minutes ago,Vor {n} Minuten,{n} minuti fa,{n} minuten geleden,Hace {n} minutos
hours-ago.1,{n} hour ago,Vor einer Stunde,Un'ora fa,{n} uur geleden,Hace una hora
hours-ago.n,{n} hours ago,Vor {n} Stunden,{n} ore fa,{n} uren geleden,Hace {n} horas
days-ago.1,{n} day ago,Vor einem Tag,Un giorno fa,{n} dag geleden,Hace un día
days-ago.n,{n} days ago,Vor {n} Tagen,{n} giorni fa,{n} dagen geleden,Hace {n} días
weeks-ago.1,{n} week ago,Vor einer Woche,Una settimana fa,{n} week geleden,Hace una semana
weeks-ago.n,{n} weeks ago,Vor {n} Wochen,{n} settimane fa,{n} weken geleden,Hace {n} semanas
months-ago.1,{n} month ago,Vor einem Monat,Un mese fa,{n} maand geleden,Hace un mes
months-ago.n,{n} months ago,Vor {n} Monaten,{n} mesi,{n} maanden geleden,Hace {n} meses
yesterday,Yesterday,Gestern,Leri,Gisteren,Ayer
just-now,Just now,Eben,Appena,Nu,Ahora
previous,Previous,Zurück,Indietro,Vorige,Anterior
next,Next,Weiter,Più,Volgende,Siguiente
comments,Comments,Kommentare,Commenti,Comments,Comentarios
likes,Likes,Gefällt mir,Mi piace,Likes,Me gusta
read-more,Read more,Weiterlesen,Di più,Lees meer,Leer más
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