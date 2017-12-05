let predict = require('predict-next-word');
var readline = require('readline');
var levenshtein = require('fast-levenshtein');
var rl = readline.createInterface(process.stdin, process.stdout);
var fs = require('fs');
var path = require('path');

/*
var data = fs.readFileSync(__dirname + "/input.txt").toString().split('\n');

for (let d = 0; d < data.length; d++) {
    let line = data[d];
    console.log("line " + d);
    predict.ingest(line);
}
*/

let satz = ""
let lastLastWord = "";
let lastWord = ""

let recentWords = [];

function isRecentWord(word) {
    if (recentWords.indexOf(word.text) != -1) {
        return true;
    }
    return false;
}

function recentWord(word) {
    if (recentWords.length >= 7) {
        recentWords.shift();
    }
    recentWords.push(word);
}

function sortByFrequency(a, b) {
    if (a.frequency > b.frequency) {
        return -1;
    }
    if (a.frequency < b.frequency) {
        return 1;
    }
    if (a.frequency == b.frequency) {
        return 0;
    }
}

rl.on('line', function (line) {
    line = line.toLowerCase();

    if (line === "exit" || line === "clear") {
        rl.close();
        return;
    }

    if (line.trim() === ".") {
        satz = satz.slice(0, -1);
        satz += ". ";
        recentWords = [];
        return;
    }

    lastLastWord = lastWord;
    lastWord = line;
    recentWord(line);
    satz += lastWord + " ";

    if (!fs.existsSync(path.join(__dirname, "node_modules", "predict-next-word", "dict", line + ".json"))) {
        return;
    }

    for (let i = 0; i < 3; i++) {

        let lookup = predict.lookupWord(lastWord);
        let words = lookup[lastWord].nextWords;

        let wordsArr = [];
        for (let j = 0; j < Object.keys(words).length; j++) {
            let key = Object.keys(words)[j];
            wordsArr.push({text: key, frequency: words[key].frequency});
        }

        wordsArr = wordsArr.sort(sortByFrequency);

        let wordsToDelete = [];

        let maxFrequency = 0;
        for (let j = 0; j < wordsArr.length; j++) {
            let word = wordsArr[j];
            if (word.frequency > maxFrequency) {
                maxFrequency = word.frequency;
            }
            if (word.text === "undefined") {
                wordsToDelete.push(word);
            } else if (isRecentWord(word)) {
                wordsToDelete.push(word);
                console.log("recent " + JSON.stringify(word));
            } else if (levenshtein.get(word.text, lastWord) < 2) {
                wordsToDelete.push(word);
                console.log("distance " + JSON.stringify(word));
            } else if (word.frequency < (maxFrequency * 0)) {
                wordsToDelete.push(word);
                console.log("freq " + JSON.stringify(word));
            }
        }
        for (let j = 0; j < wordsToDelete.length; j++) {
            if (wordsArr.indexOf(wordsToDelete[j]) !== -1) {
                wordsArr.splice(wordsArr.indexOf(wordsToDelete[j]));
            }
        }

        delete wordsToDelete;

        let w = wordsArr[Math.floor(Math.random() * wordsArr.length)];

        if (!w) {
            break;
        }

        console.log("winner " + JSON.stringify(w, null, 4));

        lastLastWord = lastWord;
        lastWord = w.text
        recentWord(w.text);
        satz += lastWord + " ";
    }

    console.log(satz);
}).on('close', function () {
    process.exit(0);
});