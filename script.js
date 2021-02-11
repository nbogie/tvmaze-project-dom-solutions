//a cache of the downloaded episode list, for filtering
let allEpisodes;

function setup() {
    document
        .getElementById("searchInput")
        .addEventListener("input", makePageForMatchingEpisodes);

    fetch("https://api.tvmaze.com/shows")
        .then(resp => resp.json())
        .then(handleShowsJSONResponse);
}

function sortShowsByName(allShows) {
    //assumes all shows have a name.
    allShows.sort((a, b) => a.name.localeCompare(b.name));
}

function handleShowsJSONResponse(json) {
    const allShows = json;
    sortShowsByName(allShows);
    makeShowSelector(allShows);
    fetchEpisodesForShow(allShows[0].id);
}

function fetchEpisodesForShow(showId) {
    fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
        .then(resp => resp.json())
        .then(handleEpisodesJSONResponse);
}

function handleEpisodesJSONResponse(json) {
    //we cache the episode list locally for further filtering
    allEpisodes = json;
    makePageForEpisodes(allEpisodes);
}

function makePageForMatchingEpisodes(event) {
    const query = document.getElementById("searchInput").value;
    const filtered = allEpisodes.filter(episode =>
        episodeMatchesQuery(episode, query)
    );
    makePageForEpisodes(filtered);
}

function contains(inspectStr, targetStr) {
    return -1 !== inspectStr.toLowerCase().indexOf(targetStr.toLowerCase());
}

function episodeMatchesQuery(episode, query) {
    return contains(episode.name, query) || contains(episode.summary, query);
}

function handleChosenEpisode(event) {
    let opts = event.target.selectedOptions;
    if (opts.length !== 1) {
        return;
    }
    let id = opts[0].value;
    document.location.assign(`#${id}`);
}

function handleChosenShow(event) {
    let opts = event.target.selectedOptions;
    if (opts.length !== 1) {
        return;
    }
    let id = opts[0].value;
    fetchEpisodesForShow(Number(id));
}

function makeShowSelector(shows) {
    const selectElem = document.getElementById("showSelect");
    selectElem.textContent = ""; //empty it
    selectElem.onchange = handleChosenShow;
    shows.forEach(show => {
        //e.g. <option value="82">Game Of Thrones</option>;
        const optionElem = document.createElement("option");
        optionElem.setAttribute("value", show.id);
        optionElem.textContent = show.name;
        selectElem.appendChild(optionElem);
    });
}

function makeEpisodeSelector(episodes) {
    const selectElem = document.getElementById("episodeSelect");
    selectElem.textContent = ""; //empty it
    selectElem.onchange = handleChosenEpisode;
    episodes.forEach(episode => {
        //<option value="S01E01">S01E01 Winter is Coming</option>;
        const optionElem = document.createElement("option");
        const code = makeEpisodeCode(episode);
        optionElem.setAttribute("value", code);
        optionElem.textContent = `${code} - ${episode.name}`;
        selectElem.appendChild(optionElem);
    });
}

function pad(num) {
    return num.toString().padStart(2, "0");
}

function makeEpisodeCode(episode) {
    return `S${pad(episode.season)}E${pad(episode.number)}`;
}

function makePageForEpisodes(json) {
    makeEpisodeSelector(json);

    document.getElementById(
        "countDisplay"
    ).textContent = `Displaying ${json.length}/${allEpisodes.length} episodes.`;

    const container = document.getElementById("episodes");
    container.textContent = ""; //wipe previous content
    json.forEach(episode => {
        const card = makeCardForEpisode(episode);
        container.appendChild(card);
    });
}

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function makeCardForEpisode(episode) {
    //--- Containing... ---
    //Title,
    //Image
    //Code (S02E07) and scroll-to-top link
    //Summary (cleaned)   
    const code = makeEpisodeCode(episode);

    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("id", code);

    const h1 = document.createElement("h1");
    h1.textContent = `${episode.name} - ${code}`; //` `;

    const img = document.createElement("img");
    img.setAttribute(
        "src",
        episode.image ? episode.image.medium : "https://placekitten.com/300/200"
    );

    const p = document.createElement("p");
    p.textContent = stripTags(episode.summary);

    card.appendChild(h1);
    card.appendChild(img);
    card.appendChild(p);
    return card;
}

//Remove tags by replacing the matched expression with an empty string.
//This function uses a regular expression.  It is NOT important to learn these on the course.
function stripTags(str) {
    if (!str) {
        return str;
    }
    //regex components:
    // <       literal <
    // / ?     literal /  (zero or one occurrences)
    // [a-z]+  a sequence of at least one alphabet character (case insensitive)
    // >       literal >
    // gi      global and case-insensitive flags
    //Further regex breakdown at https://regexr.com/532tm
    return str.replace(/<\/?[a-z]+>/gi, "");
}
window.onload = setup;
