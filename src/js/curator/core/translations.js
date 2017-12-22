

function _k (o, key, val) {
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

const landData = `
id,en,de,it
load-more,Load more,Mehr anzeigen,Di più
minutes-ago.1,{n} minute ago,Vor einer Minute,Un minuto fa
minutes-ago.n,{n} minutes ago,Vor {n} Minuten,{n} minuti fa
hours-ago.1,{n} hour ago,Vor einer Stunde,Un'ora fa
hours-ago.n,{n} hours ago,Vor {n} Stunden,{n} ore fa
days-ago.1,{n} day ago,Vor einem Tag,Un giorno fa
days-ago.n,{n} days ago,Vor {n} Tagen,{n} giorni fa
weeks-ago.1,{n} week ago,Vor einer Woche,Una settimana fa
weeks-ago.n,{n} weeks ago,Vor {n} Wochen,{n} settimane fa
months-ago.1,{n} month ago,Vor einem Monat,Un mese fa
months-ago.n,{n} months ago,Vor {n} Monaten,{n} mesi
yesterday,Yesterday,Gestern,Leri
just-now,Just now,Eben,Appena
previous,Previous,Zurück,Indietro
next,Next,Weiter,Più
`;

let langs = {};
let langDataLines = landData.split('\n');

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