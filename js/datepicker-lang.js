(function(factory) {
    factory($.fn.datepicker);
}(function(datepicker) {

    datepicker.language.en = {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        today: "Today",
        clear: "Done",
        firstDay: 1
    };
    datepicker.language.ar = {
        days: [ "Ø§Ù„Ø£Ø­Ø¯", "Ø§Ù„Ø§Ø«Ù†ÙŠÙ†", "Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡", "Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡", "Ø§Ù„Ø®Ù…ÙŠØ³", "Ø§Ù„Ø¬Ù…Ø¹Ø©", "Ø§Ù„Ø³Ø¨Øª" ],
        daysShort: [ "Ø£Ø­Ø¯", "Ø§Ø«Ù†ÙŠÙ†", "Ø«Ù„Ø§Ø«Ø§Ø¡", "Ø£Ø±Ø¨Ø¹Ø§Ø¡", "Ø®Ù…ÙŠØ³", "Ø¬Ù…Ø¹Ø©", "Ø³Ø¨Øª" ],
        daysMin: [ "Ø­", "Ù†", "Ø«", "Ø±", "Ø®", "Ø¬", "Ø³" ],
        months: [ "ÙŠÙ†Ø§ÙŠØ±", "ÙØ¨Ø±Ø§ÙŠØ±", "Ù…Ø§Ø±Ø³", "Ø£Ø¨Ø±ÙŠÙ„", "Ù…Ø§ÙŠÙˆ", "ÙŠÙˆÙ†ÙŠÙˆ", "ÙŠÙˆÙ„ÙŠÙˆ", "Ø£ØºØ³Ø·Ø³", "Ø³Ø¨ØªÙ…Ø¨Ø±", "Ø£ÙƒØªÙˆØ¨Ø±", "Ù†ÙˆÙÙ…Ø¨Ø±", "Ø¯ÙŠØ³Ù…Ø¨Ø±" ],
        monthsShort: [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12" ],
        today: "Ø§Ù„ÙŠÙˆÙ…",
        clear: "Ø¥ØºÙ„Ø§Ù‚",
        firstDay: 1
    };
    datepicker.language.nl = {
        days: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
        daysShort: ["zon", "maa", "din", "woe", "don", "vri", "zat"],
        daysMin: ["zo", "ma", "di", "wo", "do", "vr", "za"],
        months: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
        monthsShort: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
        today: "Vandaag",
        clear: "Sluiten",
        firstDay: 1
    };
    datepicker.language.fr = {
        days: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
        daysShort: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
        daysMin: ["D", "L", "M", "M", "J", "V", "S"],
        months: ["janvier", "fÃ©vrier", "mars", "avril", "mai", "juin", "juillet", "aoÃ»t", "septembre", "octobre", "novembre", "dÃ©cembre"],
        monthsShort: ["janv.", "fÃ©vr.", "mars", "avr.", "mai", "juin", "juil.", "aoÃ»t", "sept.", "oct.", "nov.", "dÃ©c."],
        today: "Aujourd'hui",
        clear: "Fermer",
        firstDay: 1
    };
    datepicker.language.it = {
        days: ["Domenica", "LunedÃ¬", "MartedÃ¬", "MercoledÃ¬", "GiovedÃ¬", "VenerdÃ¬", "Sabato"],
        daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
        daysMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
        months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
        monthsShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
        today: "Oggi",
        clear: "Chiudi",
        firstDay: 1
    };
    datepicker.language.pl = {
        days: ["Niedziela", "PoniedziaÅ‚ek", "Wtorek", "Åšroda", "Czwartek", "PiÄ…tek", "Sobota"],
        daysShort: ["Nie", "Pn", "Wt", "Åšr", "Czw", "Pt", "So"],
        daysMin: ["N", "Pn", "Wt", "Åšr", "Cz", "Pt", "So"],
        months: ["StyczeÅ„", "Luty", "Marzec", "KwiecieÅ„", "Maj", "Czerwiec", "Lipiec", "SierpieÅ„", "WrzesieÅ„", "PaÅºdziernik", "Listopad", "GrudzieÅ„"],
        monthsShort: ["Sty", "Lu", "Mar", "Kw", "Maj", "Cze", "Lip", "Sie", "Wrz", "Pa", "Lis", "Gru"],
        today: "DziÅ›",
        clear: "Zamknij",
        firstDay: 1
    };
    datepicker.language.de = {
        days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
        daysShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        daysMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        months: ["Januar", "Februar", "MÃ¤rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
        monthsShort: ["Jan", "Feb", "MÃ¤r", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
        today: "Heute",
        clear: "SchlieÃŸen",
        firstDay: 1
    };
    datepicker.language.es = {
        days: ["domingo", "lunes", "martes", "miÃ©rcoles", "jueves", "viernes", "sÃ¡bado"],
        daysShort: ["dom", "lun", "mar", "miÃ©", "jue", "vie", "sÃ¡b"],
        daysMin: [ "D", "L", "M", "X", "J", "V", "S"],
        months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
        monthsShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
        today: "Hoy",
        clear: "Cerrar",
        firstDay: 1
    };
    datepicker.language.no = {
        days: ["SÃ¸ndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "LÃ¸rdag"],
        daysShort: ["SÃ¸n", "Man", "Tir", "Ons", "Tor", "Fre", "LÃ¸r"],
        daysMin: [ "SÃ¸", "Ma", "Ti", "On", "To", "Fr", "LÃ¸"],
        months: ["Januar", "Februar", "Mars", "April", "Kan", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"],
        monthsShort: ["jan", "feb", "mar", "apr", "kan", "jun", "jul", "aug", "sep", "okt", "nov", "des"],
        today: "I dag",
        clear: "Ferdig",
        firstDay: 1
    };
    datepicker.language.sv = {
        days: ["SÃ¶ndag", "MÃ¥ndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "LÃ¶rdag"],
        daysShort: ["dom", "lun", "mar", "miÃ©", "jue", "vie", "sÃ¡b"],
        daysMin: [ "D", "L", "M", "X", "J", "V", "S"],
        months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
        monthsShort: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
        today: "I dag",
        clear: "Gjort",
        firstDay: 1
    };
    datepicker.language.cs = {
        days            : ["nedÄ›le", "pondÄ›lÃ­", "ÃºterÃ½", "stÅ™eda", "Ätvrtek", "pÃ¡tek", "sobota"],
        daysShort       : ["ne", "po", "Ãºt", "st", "Ät", "pÃ¡", "so" ],
        daysMin         : ["ne", "po", "Ãºt", "st", "Ät", "pÃ¡", "so"],
        months          : ["leden", "Ãºnor", "bÅ™ezen", "duben", "kvÄ›ten", "Äerven", "Äervenec", "srpen", "zÃ¡Å™Ã­", "Å™Ã­jen", "listopad", "prosinec"],
        monthsShort     : ["led", "Ãºno", "bÅ™e", "dub", "kvÄ›", "Äer", "Ävc", "srp", "zÃ¡Å™", "Å™Ã­j", "lis", "pro"],
        today           : "NynÃ­",
        clear           : "ZavÅ™Ã­t",
        firstDay        : 1
    };
    datepicker.language.el = {
        days            : ["ÎšÏ…ÏÎ¹Î±ÎºÎ®", "Î”ÎµÏ…Ï„Î­ÏÎ±", "Î¤ÏÎ¯Ï„Î·", "Î¤ÎµÏ„Î¬ÏÏ„Î·", "Î Î­Î¼Ï€Ï„Î·", "Î Î±ÏÎ±ÏƒÎºÎµÏ…Î®", "Î£Î¬Î²Î²Î±Ï„Î¿"],
        daysShort       : [ "ÎšÏ…Ï", "Î”ÎµÏ…", "Î¤ÏÎ¹", "Î¤ÎµÏ„", "Î ÎµÎ¼", "Î Î±Ï", "Î£Î±Î²"],
        daysMin         : [ "ÎšÏ…", "Î”Îµ", "Î¤Ï", "Î¤Îµ", "Î Îµ", "Î Î±", "Î£Î±" ],
        months          : ["Î™Î±Î½Î¿Ï…Î¬ÏÎ¹Î¿Ï‚", "Î¦ÎµÎ²ÏÎ¿Ï…Î¬ÏÎ¹Î¿Ï‚", "ÎœÎ¬ÏÏ„Î¹Î¿Ï‚", "Î‘Ï€ÏÎ¯Î»Î¹Î¿Ï‚", "ÎœÎ¬Î¹Î¿Ï‚", "Î™Î¿ÏÎ½Î¹Î¿Ï‚", "Î™Î¿ÏÎ»Î¹Î¿Ï‚", "Î‘ÏÎ³Î¿Ï…ÏƒÏ„Î¿Ï‚", "Î£ÎµÏ€Ï„Î­Î¼Î²ÏÎ¹Î¿Ï‚", "ÎŸÎºÏ„ÏŽÎ²ÏÎ¹Î¿Ï‚", "ÎÎ¿Î­Î¼Î²ÏÎ¹Î¿Ï‚", "Î”ÎµÎºÎ­Î¼Î²ÏÎ¹Î¿Ï‚"],
        monthsShort     : ["Î™Î±Î½", "Î¦ÎµÎ²", "ÎœÎ±Ï", "Î‘Ï€Ï", "ÎœÎ±Î¹", "Î™Î¿Ï…Î½", "Î™Î¿Ï…Î»", "Î‘Ï…Î³", "Î£ÎµÏ€", "ÎŸÎºÏ„", "ÎÎ¿Îµ", "Î”ÎµÎº" ],
        today           : "Î£Î®Î¼ÎµÏÎ±",
        clear           : "ÎšÎ»ÎµÎ¯ÏƒÎ¹Î¼Î¿",
        firstDay        : 1
    };
    datepicker.language.jp = {
        days            : ["æ—¥æ›œæ—¥", "æœˆæ›œæ—¥", "ç«æ›œæ—¥", "æ°´æ›œæ—¥", "æœ¨æ›œæ—¥", "é‡‘æ›œæ—¥", "åœŸæ›œæ—¥"],
        daysShort       : [ "æ—¥", "æœˆ", "ç«", "æ°´", "æœ¨", "é‡‘", "åœŸ"],
        daysMin         : [ "æ—¥", "æœˆ", "ç«", "æ°´", "æœ¨", "é‡‘", "åœŸ" ],
        months          : ["1æœˆ", "2æœˆ", "3æœˆ", "4æœˆ", "5æœˆ", "6æœˆ", "7æœˆ", "8æœˆ", "9æœˆ", "10æœˆ", "11æœˆ", "12æœˆ"],
        monthsShort     : ["1æœˆ", "2æœˆ", "3æœˆ", "4æœˆ", "5æœˆ", "6æœˆ", "7æœˆ", "8æœˆ", "9æœˆ", "10æœˆ", "11æœˆ", "12æœˆ"],
        today           : "ä»Šæ—¥",
        clear           : "é–‰ã˜ã‚‹",
        firstDay        : 0
    };


    datepicker.language.pt = {
        days            : ["Domingo", "Segunda-feira", "TerÃ§a-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "SÃ¡bado"],
        daysShort       : ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "SÃ¡b"],
        daysMin         : ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "SÃ¡b"],
        months          : ["Janeiro", "Fevereiro", "MarÃ§o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        monthsShort     : ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        today           : "Hoje",
        clear           : "Fechar",
        firstDay        : 1
    };

    datepicker.language.tr = {
        days            : ["Pazar", "Pazartesi", "SalÄ±", "Ã‡arÅŸamba", "PerÅŸembe", "Cuma", "Cumartesi"],
        daysShort       : ["Pz", "Pt", "Sa", "Ã‡a", "Pe", "Cu", "Ct"],
        daysMin         : ["Pz", "Pt", "Sa", "Ã‡a", "Pe", "Cu", "Ct"],
        months          : ["Ocak", "Åžubat", "Mart", "Nisan", "MayÄ±s", "Haziran", "Temmuz", "AÄŸustos", "EylÃ¼l", "Ekim", "KasÄ±m", "AralÄ±k"],
        monthsShort     : ["Oca", "Åžub", "Mar", "Nis", "May", "Haz", "Tem", "AÄŸu", "Eyl", "Eki", "Kas", "Ara"],
        today           : "bugÃ¼n",
        clear           : "kapat",
        firstDay        : 1
    };
    datepicker.language.th = {
        days            : ["à¸­à¸²à¸—à¸´à¸•à¸¢à¹Œ","à¸ˆà¸±à¸™à¸—à¸£à¹Œ","à¸­à¸±à¸‡à¸„à¸²à¸£","à¸žà¸¸à¸˜","à¸žà¸¤à¸«à¸±à¸ªà¸šà¸”à¸µ","à¸¨à¸¸à¸à¸£à¹Œ","à¹€à¸ªà¸²à¸£à¹Œ"],
        daysShort       : ["à¸­à¸².","à¸ˆ.","à¸­.","à¸ž.","à¸žà¸¤.","à¸¨.","à¸ª."],
        daysMin         : ["à¸­à¸².","à¸ˆ.","à¸­.","à¸ž.","à¸žà¸¤.","à¸¨.","à¸ª."],
        months          : ["à¸¡à¸à¸£à¸²à¸„à¸¡","à¸à¸¸à¸¡à¸ à¸²à¸žà¸±à¸™à¸˜à¹Œ","à¸¡à¸µà¸™à¸²à¸„à¸¡","à¹€à¸¡à¸©à¸²à¸¢à¸™","à¸žà¸¤à¸©à¸ à¸²à¸„à¸¡","à¸¡à¸´à¸–à¸¸à¸™à¸²à¸¢à¸™", "à¸à¸£à¸à¸Žà¸²à¸„à¸¡","à¸ªà¸´à¸‡à¸«à¸²à¸„à¸¡","à¸à¸±à¸™à¸¢à¸²à¸¢à¸™","à¸•à¸¸à¸¥à¸²à¸„à¸¡","à¸žà¸¤à¸¨à¸ˆà¸´à¸à¸²à¸¢à¸™","à¸˜à¸±à¸™à¸§à¸²à¸„à¸¡"],
        monthsShort     : ["à¸¡.à¸„.","à¸.à¸ž.","à¸¡à¸µ.à¸„.","à¹€à¸¡.à¸¢.","à¸ž.à¸„.","à¸¡à¸´.à¸¢.", "à¸.à¸„.","à¸ª.à¸„.","à¸.à¸¢.","à¸•.à¸„.","à¸ž.à¸¢.","à¸˜.à¸„."],
        today           : "à¸§à¸±à¸™à¸™à¸µà¹‰",
        clear           : "à¸›à¸´à¸”",
        firstDay        : 0
    };
    datepicker.language.hi = {
        days: ["à¤°à¤µà¤¿à¤µà¤¾à¤°", "à¤¸à¥‹à¤®à¤µà¤¾à¤°", "à¤®à¤‚à¤—à¤²à¤µà¤¾à¤°", "à¤¬à¥à¤§à¤µà¤¾à¤°", "à¤—à¥à¤°à¥à¤µà¤¾à¤°", "à¤¶à¥à¤•à¥à¤°à¤µà¤¾à¤°", "à¤¶à¤¨à¤¿à¤µà¤¾à¤°"],
        daysShort: ["à¤°à¤µà¤¿", "à¤¸à¥‹à¤®", "à¤®à¤‚à¤—à¤²", "à¤¬à¥à¤§", "à¤—à¥à¤°à¥", "à¤¶à¥à¤•à¥à¤°", "à¤¶à¤¨à¤¿"],
        daysMin: ["à¤°à¤µà¤¿", "à¤¸à¥‹à¤®", "à¤®à¤‚à¤—à¤²", "à¤¬à¥à¤§", "à¤—à¥à¤°à¥", "à¤¶à¥à¤•à¥à¤°", "à¤¶à¤¨à¤¿"],
        months: ["à¤œà¤¨à¤µà¤°à¥€ ","à¤«à¤°à¤µà¤°à¥€","à¤®à¤¾à¤°à¥à¤š","à¤…à¤ªà¥à¤°à¥‡à¤²","à¤®à¤ˆ","à¤œà¥‚à¤¨", "à¤œà¥‚à¤²à¤¾à¤ˆ","à¤…à¤—à¤¸à¥à¤¤ ","à¤¸à¤¿à¤¤à¤®à¥à¤¬à¤°","à¤…à¤•à¥à¤Ÿà¥‚à¤¬à¤°","à¤¨à¤µà¤®à¥à¤¬à¤°","à¤¦à¤¿à¤¸à¤®à¥à¤¬à¤°"],
        monthsShort: ["à¤œà¤¨", "à¤«à¤°", "à¤®à¤¾à¤°à¥à¤š", "à¤…à¤ªà¥à¤°à¥‡à¤²", "à¤®à¤ˆ", "à¤œà¥‚à¤¨", "à¤œà¥‚à¤²à¤¾à¤ˆ", "à¤…à¤—", "à¤¸à¤¿à¤¤", "à¤…à¤•à¥à¤Ÿ", "à¤¨à¤µ", "à¤¦à¤¿"],
        today: "à¤†à¤œ",
        clear: "à¤¬à¤‚à¤¦",
        firstDay: 1
    };
    datepicker.language.vi = {
        days: ["Chá»§ Nháº­t", "Thá»© Hai", "Thá»© Ba", "Thá»© TÆ°", "Thá»© NÄƒm", "Thá»© SÃ¡u", "Thá»© Báº£y"],
        daysShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        daysMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        months: ["ThÃ¡ng Má»™t", "ThÃ¡ng Hai", "ThÃ¡ng Ba", "ThÃ¡ng TÆ°", "ThÃ¡ng NÄƒm", "ThÃ¡ng SÃ¡u", "ThÃ¡ng Báº£y", "ThÃ¡ng TÃ¡m", "ThÃ¡ng ChÃ­n", "ThÃ¡ng MÆ°á»i", "ThÃ¡ng MÆ°á»i Má»™t", "ThÃ¡ng MÆ°á»i Hai"],
        monthsShort: ["ThÃ¡ng 1", "ThÃ¡ng 2", "ThÃ¡ng 3", "ThÃ¡ng 4", "ThÃ¡ng 5", "ThÃ¡ng 6", "ThÃ¡ng 7", "ThÃ¡ng 8", "ThÃ¡ng 9", "ThÃ¡ng 10", "ThÃ¡ng 11", "ThÃ¡ng 12"],
        today: "HÃ´m nay",
        clear: "ÄÃ³ng",
        firstDay: 0
    };
    datepicker.language.ko = {
        days: ["ì¼ìš”ì¼","ì›”ìš”ì¼","í™”ìš”ì¼","ìˆ˜ìš”ì¼","ëª©ìš”ì¼","ê¸ˆìš”ì¼","í† ìš”ì¼"],
        daysShort: ["ì¼","ì›”","í™”","ìˆ˜","ëª©","ê¸ˆ","í† "],
        daysMin: ["ì¼","ì›”","í™”","ìˆ˜","ëª©","ê¸ˆ","í† "],
        months: ["1ì›”","2ì›”","3ì›”","4ì›”","5ì›”","6ì›”", "7ì›”","8ì›”","9ì›”","10ì›”","11ì›”","12ì›”"],
        monthsShort: ["1ì›”","2ì›”","3ì›”","4ì›”","5ì›”","6ì›”", "7ì›”","8ì›”","9ì›”","10ì›”","11ì›”","12ì›”"],
        today: "ì˜¤ëŠ˜",
        clear: "ë‹«ê¸°",
        firstDay: 0
    };
    datepicker.language.ms = {
        days: ["Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu"],
        daysShort: ["Aha","Isn","Sel","Rab","kha","Jum","Sab"],
        daysMin: ["Ah","Is","Se","Ra","Kh","Ju","Sa"],
        months: ["Januari","Februari","Mac","April","Mei","Jun", "Julai","Ogos","September","Oktober","November","Disember"],
        monthsShort: ["Jan","Feb","Mac","Apr","Mei","Jun", "Jul","Ogo","Sep","Okt","Nov","Dis"],
        today: "hari ini",
        clear: "Tutup",
        firstDay: 0
    };
        return datepicker.language.de;
}
));