// ==UserScript==
// @name         DinoCardian
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  try to save your cards!
// @author       Biosha
// @match        http://www.dinocard.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dinocard.net
// @downloadURL  https://github.com/Biosha/dinocardian/raw/master/dinocardian.user.js
// @updateURL    https://github.com/Biosha/dinocardian/raw/master/dinocardian.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

const serverURL = 'https://dinocard.eternaltwin.org/api/backup/save';
const userId = document.getElementById("usermenu").children[0].children[0].attributes.href.value.match(/id=(\d*)/)[1];
const userName = document.getElementById("usermenu").children[0].children[0].innerHTML;
console.log("[DinocardBackup] Hello " + userName);

let savedDeck = [];
let collectionHash;
GM.getValue('savedDeck').then((deck) => {
    if (deck) {
        savedDeck.push(...deck);
    }
});
GM.getValue('collection').then((col) => {
    if (col) {
        collectionHash = col;
    }
});

function hashCode(str)
{
    return Array.from(str)
        .reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);
}

function addButton()
{
    let update_external_tools_btn = document.getElementById('save');
    if (update_external_tools_btn) {
        return;
    }

    const usermenu = document.getElementById('usermenu');

    //Bouton save Collection
    if (window.location.pathname === '/card/viewAll') {
        const endcollect = document.getElementById('center').children[6]
        let btn = document.createElement('a');
        btn.innerHTML = 'Sauvegarder la collection'
        btn.id = 'save';
        btn.className = "button";
        btn.addEventListener("click", saveCollection);
        document.getElementById('center').insertBefore(btn, endcollect);
    }

    //Bouton save Deck
    if (window.location.pathname === '/pack/info') {
        const rightMenu = document.getElementById('rightMenu')
        let btn = document.createElement('a');
        btn.innerHTML = 'Sauvegarder le deck'
        btn.id = 'save';
        btn.className = "button";
        btn.addEventListener("click", saveDeck);
        rightMenu.appendChild(btn);
    }
}

function sendToServerJSON(data, dataType)
{
    console.log("Send Request to server");
    fetch(`${serverURL}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then((res) => {
        if (res.status == 200 && dataType == 'deck') {
            savedDeck.push(data.deck.name)
            GM.setValue('savedDeck', savedDeck)
            window.alert("Deck sauvegardé")
        } else if (res.status == 200) {
            GM.setValue('collection', dataType)
            collectionHash = dataType
            window.alert("Collection sauvegardée")
        }
    })
        .catch(err => Promise.reject(err));
}

function saveCollection()
{
    if (document.getElementById("folder2").classList[0] === 'disable') {
        window.alert("Mauvais onglet sélectionné\nMerci d'être en mode tableau");

        return;
    }
    let cardArray = []

    const collection = document.getElementById("superTab").children[0].children[0].children
    for (let index = 1; index < collection.length; index++) {
        const card = collection[index].getElementsByClassName("cardName")[0];
        const quantity = parseInt(card.innerText.match(/\d*/)[0]);
        const cardId = parseInt(card.children[0].attributes.id.value.match(/name(\d*)/)[1]);
        let newCard = {}
        newCard[cardId] = quantity
        cardArray.push(newCard);
    }
    const newHash = hashCode(JSON.stringify(cardArray))
    if (newHash === collectionHash) {
        window.alert("Votre collection a déjà été sauvegardée.")
    } else {
        sendToServerJSON({playerId: userId, playerName: userName, collection: cardArray}, newHash);
    }
}

function saveDeck()
{
    if (document.getElementById("folder2").classList[0] === 'disable') {
        window.alert("Mauvais onglet sélectionné\nMerci d'être en mode tableau");

        return;
    }
    let cardArray = []

    const collection = document.getElementById("superTab").children[0].children[0].children
    for (let index = 1; index < collection.length; index++) {
        const card = collection[index].getElementsByClassName("cardName")[0];
        const quantity = parseInt(card.innerText.match(/\d*/)[0]);
        const cardId = parseInt(card.children[0].attributes.href.value.match(/id=(\d*)/)[1]);
        let newCard = {}
        newCard[cardId] = quantity
        cardArray.push(newCard);
    }
    const infoPack = document.getElementsByClassName('infoPack')[0];
    const hiddenInfoPack = document.getElementById('fPackInfo');
    const deckInfo = {
        playerId: userId,
        playerName: userName,
        deckId: hiddenInfoPack.querySelector("[name='packId']"),
        level: parseInt(infoPack.getElementsByClassName('levelBox')[0].textContent),
        victory: parseInt(infoPack.getElementsByClassName('victoryBox')[0].textContent.match(/Victoire : (\d*)%/)[1]),
        experience: parseInt(infoPack.getElementsByClassName('xpBox')[0].textContent.match(/Expérience : (\d*)%/)[1]),
        totalCard: parseInt(infoPack.getElementsByClassName('packName')[0].innerText.match(/.*\[ (\d*) cartes \].*/)[1]),
        perception: parseInt(document.getElementById("4").innerText),
        strategy: parseInt(document.getElementById("3").innerText),
        bonus: parseInt(document.getElementById("1").innerText),
        life: parseInt(document.getElementById("2").innerText),
        description: document.getElementById("desc").innerText,
        dateCreated: infoPack.getElementsByClassName('packName')[0].getElementsByTagName('span')[1].innerText,
        name: infoPack.getElementsByClassName('packName')[0].getElementsByTagName('span')[0].innerText,
        cards: cardArray
    }

    if (savedDeck.some(d => d === deckInfo.name)) {
        window.alert("Ce deck a déjà été sauvegardé")
    } else {
        sendToServerJSON({playerId: userId, playerName: userName, deck: deckInfo}, 'deck');
    }
}

(function () {
    setTimeout(() => {
        addButton()
    }, 500);
})();
