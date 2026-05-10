const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '../src/locales');
const baseRegions = require('../regions_base.json');

// --- Dictionaries ---

const ruToUa = {
  "Адыгея": "Адигея", "Башкортостан": "Башкортостан", "Бурятия": "Бурятія", "Республика Алтай": "Республіка Алтай",
  "Дагестан": "Дагестан", "Ингушетия": "Інгушетія", "Кабардино-Балкария": "Кабардино-Балкарія", "Калмыкия": "Калмикія",
  "Карачаево-Черкесия": "Карачаєво-Черкесія", "Карелия": "Карелія", "Республика Коми": "Республіка Комі", "Марий Эл": "Марій Ел",
  "Мордовия": "Мордовія", "Саха (Якутия)": "Саха (Якутія)", "Северная Осетия": "Північна Осетія", "Татарстан": "Татарстан",
  "Тыва": "Тива", "Удмуртия": "Удмуртія", "Хакасия": "Хакасія", "Чувашия": "Чувашія",
  "Москва": "Москва", "Санкт-Петербург": "Санкт-Петербург",
  "Севастополь": "Севастополь", "Республика Крым": "Республіка Крим"
};

const uaToRu = {
  "Київ": "Киев",
  "Вінницька область": "Винницкая область",
  "Волинська область": "Волынская область",
  "Дніпропетровська область": "Днепропетровская область",
  "Донецька область": "Донецкая область",
  "Київська область": "Киевская область",
  "Житомирська область": "Житомирская область",
  "Закарпатська область": "Закарпатская область",
  "Запорізька область": "Запорожская область",
  "Івано-Франківська область": "Ивано-Франковская область",
  "Харківська область": "Харьковская область",
  "Кіровоградська область": "Кировоградская область",
  "Луганська область": "Луганская область",
  "Львівська область": "Львовская область",
  "Миколаївська область": "Николаевская область",
  "Одеська область": "Одесская область",
  "Полтавська область": "Полтавская область",
  "Рівненська область": "Ровенская область",
  "Сумська область": "Сумская область",
  "Тернопільська область": "Тернопольская область",
  "Херсонська область": "Херсонская область",
  "Хмельницька область": "Хмельницкая область",
  "Черкаська область": "Черкасская область",
  "Чернігівська область": "Черниговская область",
  "Чернівецька область": "Черновицкая область",
  "Севастополь": "Севастополь",
  "АР Крим": "АР Крым"
};

const czToRu = {
  "Praha": "Прага",
  "Jihomoravský kraj (Brno)": "Южноморавский край (Брно)",
  "Jihočeský kraj (České Budějovice)": "Южночешский край (Ческе-Будеёвице)",
  "Pardubický kraj (Pardubice)": "Пардубицкий край (Пардубице)",
  "Královéhradecký kraj (Hradec Králové)": "Краловеградецкий край (Градец-Кралове)",
  "Kraj Vysočina (Jihlava)": "Край Высочина (Йиглава)",
  "Karlovarský kraj (Karlovy Vary)": "Карловарский край (Карловы Вары)",
  "Liberecký kraj (Liberec)": "Либерецкий край (Либерец)",
  "Olomoucký kraj (Olomouc)": "Оломоуцкий край (Оломоуц)",
  "Plzeňský kraj (Plzeň)": "Пльзенский край (Пльзень)",
  "Středočeský kraj (Praha-venkov)": "Среднечешский край (Прага-восток)",
  "Moravskoslezský kraj (Ostrava)": "Моравскосилезский край (Острава)",
  "Ústecký kraj (Ústí nad Labem)": "Устецкий край (Усти-над-Лабем)",
  "Zlínský kraj (Zlín)": "Злинский край (Злин)"
};

const czToUa = {
  "Praha": "Прага",
  "Jihomoravský kraj (Brno)": "Південноморавський край (Брно)",
  "Jihočeský kraj (České Budějovice)": "Південночеський край (Чеське Будейовіце)",
  "Pardubický kraj (Pardubice)": "Пардубицький край (Пардубице)",
  "Královéhradecký kraj (Hradec Králové)": "Краловоградецький край (Градець-Кралове)",
  "Kraj Vysočina (Jihlava)": "Край Височина (Їглава)",
  "Karlovarský kraj (Karlovy Vary)": "Карловарський край (Карлові Вари)",
  "Liberecký kraj (Liberec)": "Ліберецький край (Ліберець)",
  "Olomoucký kraj (Olomouc)": "Оломоуцький край (Оломоуць)",
  "Plzeňský kraj (Plzeň)": "Пльзенський край (Пльзень)",
  "Středočeský kraj (Praha-venkov)": "Середньочеський край (Прага)",
  "Moravskoslezský kraj (Ostrava)": "Моравсько-Сілезький край (Острава)",
  "Ústecký kraj (Ústí nad Labem)": "Устецький край (Усті-над-Лабем)",
  "Zlínský kraj (Zlín)": "Злінський край (Злін)"
};

const czToEn = {
  "Praha": "Prague",
  "Jihomoravský kraj (Brno)": "South Moravian Region (Brno)",
  "Jihočeský kraj (České Budějovice)": "South Bohemian Region (Ceske Budejovice)",
  "Pardubický kraj (Pardubice)": "Pardubice Region",
  "Královéhradecký kraj (Hradec Králové)": "Hradec Kralove Region",
  "Kraj Vysočina (Jihlava)": "Vysocina Region (Jihlava)",
  "Karlovarský kraj (Karlovy Vary)": "Karlovy Vary Region",
  "Liberecký kraj (Liberec)": "Liberec Region",
  "Olomoucký kraj (Olomouc)": "Olomouc Region",
  "Plzeňský kraj (Plzeň)": "Plzen Region",
  "Středočeský kraj (Praha-venkov)": "Central Bohemian Region",
  "Moravskoslezský kraj (Ostrava)": "Moravian-Silesian Region (Ostrava)",
  "Ústecký kraj (Ústí nad Labem)": "Usti nad Labem Region",
  "Zlínský kraj (Zlín)": "Zlin Region"
};

// Simple transliteration
const ruEnTranslitMap = {
  'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'yo', 'ж':'zh', 'з':'z', 'и':'i', 'й':'y',
  'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f',
  'х':'kh', 'ц':'ts', 'ч':'ch', 'ш':'sh', 'щ':'shch', 'ъ':'', 'ы':'y', 'ь':'', 'э':'e', 'ю':'yu', 'я':'ya'
};

const uaEnTranslitMap = { ...ruEnTranslitMap, 'і':'i', 'ї':'yi', 'є':'ye', 'ґ':'g' };

function translit(str, map) {
  return str.split('').map(c => {
    const isUpper = c === c.toUpperCase();
    const l = c.toLowerCase();
    if (map[l]) {
      const trans = map[l];
      return isUpper ? trans.charAt(0).toUpperCase() + trans.slice(1) : trans;
    }
    return c;
  }).join('');
}

function ruToUaAuto(str) {
  if (ruToUa[str]) return ruToUa[str];
  let res = str;
  res = res.replace(/Республика /g, 'Республіка ');
  res = res.replace(/ автономный округ/g, ' автономний округ');
  res = res.replace(/ автономная область/g, ' автономна область');
  res = res.replace(/и/g, 'і').replace(/И/g, 'І').replace(/ы/g, 'и').replace(/Ы/g, 'И').replace(/э/g, 'е').replace(/Э/g, 'Е');
  res = res.replace(/скій /g, 'ський ');
  res = res.replace(/ская /g, 'ська ');
  res = res.replace(/скій$/g, 'ський');
  res = res.replace(/ская$/g, 'ська');
  res = res.replace(/ое$/g, 'е');
  return res;
}

function translateEn(str, isUa) {
  if (czToEn[str]) return czToEn[str];
  let res = str;
  res = res.replace(/ область/g, ' Oblast');
  res = res.replace(/ край/g, ' Krai');
  res = res.replace(/ автономный округ/g, ' Autonomous Okrug');
  res = res.replace(/ автономная область/g, ' Autonomous Oblast');
  res = res.replace(/Республика (.*)/g, '$1 Republic');
  return translit(res, isUa ? uaEnTranslitMap : ruEnTranslitMap);
}

function processLocale(lang) {
  const regions = { ru: {}, ua: {}, cz: {}, by: {} };
  
  for (const country in baseRegions) {
    for (const key in baseRegions[country]) {
      const native = baseRegions[country][key];
      let translated = native;

      if (lang === 'ru') {
        if (country === 'ua' && uaToRu[native]) translated = uaToRu[native];
        if (country === 'cz' && czToRu[native]) translated = czToRu[native];
      } 
      else if (lang === 'ua') {
        if (country === 'ru' || country === 'by') translated = ruToUaAuto(native);
        if (country === 'cz' && czToUa[native]) translated = czToUa[native];
      }
      else if (lang === 'en') {
        translated = translateEn(native, country === 'ua');
      }
      else if (lang === 'cz') {
        if (country !== 'cz') translated = translateEn(native, country === 'ua');
      }
      else if (lang === 'by') {
        if (country === 'ru') translated = native.replace(/и/g, 'і').replace(/о/g, 'а');
      }
      else if (lang === 'crh') {
        if (country !== 'cz') translated = translateEn(native, country === 'ua');
      }

      regions[country][key] = translated;
    }
  }
  return regions;
}

const langs = ['ru', 'en', 'ua', 'cz', 'by', 'crh'];
for (const lang of langs) {
  const p = path.join(localesPath, lang + '.json');
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    data.regions = processLocale(lang);
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
  }
}
console.log('Translated successfully.');
