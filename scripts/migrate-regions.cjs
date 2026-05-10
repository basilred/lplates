const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data.json');
const localesPath = path.join(__dirname, '../src/locales');

// Ukrainian translations (from Russian)
const uaTranslations = {
    "Киев": "Київ",
    "Винницкая область": "Вінницька область",
    "Волынская область": "Волинська область",
    "Днепропетровская область": "Дніпропетровська область",
    "Донецкая область": "Донецька область",
    "Киевская область": "Київська область",
    "Житомирская область": "Житомирська область",
    "Закарпатская область": "Закарпатська область",
    "Запорожская область": "Запорізька область",
    "Ивано-Франковская область": "Івано-Франківська область",
    "Харьковская область": "Харківська область",
    "Кировоградская область": "Кіровоградська область",
    "Луганская область": "Луганська область",
    "Львовская область": "Львівська область",
    "Николаевская область": "Миколаївська область",
    "Одесская область": "Одеська область",
    "Полтавская область": "Полтавська область",
    "Ровенская область": "Рівненська область",
    "Сумская область": "Сумська область",
    "Тернопольская область": "Тернопільська область",
    "Херсонская область": "Херсонська область",
    "Хмельницкая область": "Хмельницька область",
    "Черкасская область": "Черкаська область",
    "Черниговская область": "Чернігівська область",
    "Черновицкая область": "Чернівецька область",
    "Севастополь": "Севастополь",
    "АР Крым": "АР Крим"
};

const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
    'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    // Czech chars
    'á': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e', 'í': 'i', 'ň': 'n', 'ó': 'o', 'ř': 'r', 'š': 's',
    'ť': 't', 'ú': 'u', 'ů': 'u', 'ý': 'y', 'ž': 'z'
};

function transliterate(text) {
    return text.toLowerCase().split('').map(char => {
        return translitMap[char] !== undefined ? translitMap[char] : char;
    }).join('');
}

function toCamelCase(text) {
    return text
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .trim()
        .replace(/\s+(.)/g, (match, group1) => group1.toUpperCase())
        .replace(/\s/g, '');
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const newData = {};
const regionsI18n = {};

for (const country in data) {
    newData[country] = {};
    regionsI18n[country] = {};

    for (const originalKey in data[country]) {
        let nativeName = originalKey;
        if (country === 'ua' && uaTranslations[originalKey]) {
            nativeName = uaTranslations[originalKey];
        }

        const transliterated = transliterate(nativeName);
        let camelKey = toCamelCase(transliterated);

        // special case if starting with number
        if (/^\d/.test(camelKey)) {
            camelKey = 'region' + camelKey;
        }

        newData[country][camelKey] = data[country][originalKey];
        regionsI18n[country][camelKey] = nativeName;
    }
}

// Write new data.json
fs.writeFileSync(dataPath, JSON.stringify(newData, null, 2) + '\n');

// Update locale files
const localeFiles = fs.readdirSync(localesPath).filter(file => file.endsWith('.json'));

for (const file of localeFiles) {
    const filePath = path.join(localesPath, file);
    const localeData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!localeData.regions) {
        localeData.regions = {};
    }

    for (const country in regionsI18n) {
        if (!localeData.regions[country]) {
            localeData.regions[country] = {};
        }

        for (const camelKey in regionsI18n[country]) {
            // Keep existing translation if it exists, otherwise use nativeName
            if (!localeData.regions[country][camelKey]) {
                localeData.regions[country][camelKey] = regionsI18n[country][camelKey];
            }
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(localeData, null, 2) + '\n');
}

console.log('Migration complete!');
