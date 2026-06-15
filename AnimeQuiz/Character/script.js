var CurrentCharacter = null;
var OkayToFetch = true;
var OkayInterval = null;
var Interval = null;

async function fetchData(request) {

    while(!OkayToFetch) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
        OkayToFetch = false;
        OkayInterval = setInterval(() => {
            OkayToFetch = true;
            clearInterval(OkayInterval);
        }, 1000);

        const response = await fetch(`https://api.jikan.moe/v4/${request}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return data;
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }

}

async function fetchTopAnime(page){
        
    const data = await fetchData(`top/anime?min_score=7&page=${page}`);
    return data;

}

async function fetchRandomTopAnimeCharacter() {

    const data = await fetchTopAnime(Math.floor(Math.random() * 40));
    const anime = data.data[Math.floor(Math.random() * data.data.length)];

    const characterData = await fetchData(`anime/${anime.mal_id}/characters`);
    CurrentCharacter = characterData.data[Math.floor(Math.random() * 4)];


    document.getElementById('characterImage').src = CurrentCharacter.character.images.jpg.image_url;
    document.getElementById('characterImage').style.display = 'block';

}

function GuessCharacter() {

    const characterName = document.getElementById('characterName').value.toLowerCase();

    if (CurrentCharacter && CurrentCharacter.character.name.toLowerCase() === characterName) {
        alert('Correct!');
        fetchRandomTopAnimeCharacter();
        document.getElementById('characterName').value = '';
    } else {
        alert('Try again!');
    }
}

function OnKeyPress(event) {
        
    if (event.key === 'Enter') {
        GuessCharacter();
        return;
    }

    if (OkayToFetch) {
        UpdateOptions();
    } 
    else {
        clearInterval(Interval);
        Interval = setInterval(() => {
            if(OkayToFetch) {
                UpdateOptions();
                clearInterval(Interval);
            }
        }, 100);
    }
}

async function UpdateOptions() {

    const characterName = document.getElementById('characterName').value.toLowerCase();

    const data = await fetchData(`characters?q=${characterName}&min_score=7&limit=4`);

    var choices = document.getElementsByClassName('choice');

    for (let i = 0; i < choices.length; i++) {
        if (data.data[i]) {
            choices[i].textContent = data.data[i].name;
        } else {
            choices[i].textContent = '';
            choices[i].style.display = 'none';
        }
    }
    
}

function chooseOption(index) {

    const characterName = document.getElementsByClassName('choice')[index].textContent;
    document.getElementById('characterName').value = characterName;

}

fetchRandomTopAnimeCharacter();