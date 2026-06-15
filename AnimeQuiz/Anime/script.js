var CurrentAnime = null;
var OkayToFetch = true;
var OkayInterval = null;
var Interval = null;

let CurrentSuggestions = [];

async function fetchData(request) {
  while (!OkayToFetch) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  try {
    OkayToFetch = false;
    OkayInterval = setInterval(() => {
      OkayToFetch = true;
      clearInterval(OkayInterval);
    }, 1000);

    const response = await fetch(`https://api.jikan.moe/v4/${request}`);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchTopAnime(page) {
  const data = await fetchData(`top/anime?min_score=7&page=${page}`);
  return data;
}

async function fetchRandomTopAnime() {
  const data = await fetchTopAnime(Math.floor(Math.random() * 40));
  const anime = data.data[Math.floor(Math.random() * data.data.length)];
  document.getElementById("animeImage").src = anime.images.jpg.large_image_url;
  document.getElementById("animeImage").style.display = "block";
  CurrentAnime = anime;
}

function GuessAnime() {
  const animeName = document.getElementById("animeName").value.toLowerCase();
  var titles = [
    CurrentAnime.title,
    CurrentAnime.title_english,
    CurrentAnime.title_japanese,
    ...CurrentAnime.title_synonyms,
  ];

  if (
    CurrentAnime &&
    titles.some((title) => title.toLowerCase() === animeName)
  ) {
    alert("Correct!");
    fetchRandomTopAnime();
    document.getElementById("animeName").value = "";
  } else {
    alert("Try again!");
  }
}

function OnKeyPress(event) {
  if (event.key === "Enter") {
    GuessAnime();
    return;
  }

  if (OkayToFetch) {
    UpdateOptions();
  } else {
    clearInterval(Interval);
    Interval = setInterval(() => {
      if (OkayToFetch) {
        UpdateOptions();
        clearInterval(Interval);
      }
    }, 100);
  }
}

async function UpdateOptions() {
  const animeName = document.getElementById("animeName").value.toLowerCase();

  const list = document.getElementById("autocompleteList");

  if (!animeName) {
    list.style.display = "none";
    return;
  }

  const data = await fetchData(`anime?q=${animeName}&min_score=7&limit=4`);
  console.log(data);

  CurrentSuggestions = data.data || [];

  list.innerHTML = "";

  CurrentSuggestions.forEach((anime) => {
    const item = document.createElement("div");

    item.className = "autocomplete-item";
    item.value = anime.title;
    item.innerHTML = anime.title;

    item.addEventListener("click", () => {
      document.getElementById("animeName").value = anime.title;
      list.style.display = "none";
    });

    list.appendChild(item);
  });

  list.style.display = CurrentSuggestions.length > 0 ? "block" : "none";
}

document.addEventListener("click", (e) => {
  const input = document.getElementById("animeName");
  const list = document.getElementById("autocompleteList");

  if (e.target !== input && !list.contains(e.target)) {
    list.style.display = "none";
  }
});

function chooseOption(index) {
  const animeName =
    document.getElementsByClassName("choice")[index].textContent;
  document.getElementById("animeName").value = animeName;
}

fetchRandomTopAnime();

document.getElementById("animeName").addEventListener("input", OnKeyPress);
