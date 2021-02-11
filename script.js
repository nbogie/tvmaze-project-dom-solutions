//a cache of the downloaded episode list, for filtering
let allEpisodes;
let allShows = getAllShows();
let selectedShow;

function setup() {
    document
        .getElementById("searchInput")
        .addEventListener("input", makePageForMatchingEpisodes);

    document.getElementById("showsSearchInput").addEventListener("input", makePageForMatchingShows);
    document.getElementById("listShowsLink").addEventListener("click", switchToShowsListing);

    sortShowsByName(allShows);
    switchToShowsListing();
}

function switchToShowsListing() {
    document.getElementById("showsPage").hidden = false;
    document.getElementById("episodesPage").hidden = true;
    makePageForShows(allShows);
}
function sortShowsByName(allShows) {
    //assumes all shows have a name.
    allShows.sort((a, b) => a.name.localeCompare(b.name));
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

function makePageForMatchingShows(event) {
    const query = document.getElementById("showsSearchInput").value;
    const filtered = allShows.filter(show =>
        tvShowMatchesQuery(show, query)
    );
    makePageForShows(filtered);
}

function contains(inspectStr, targetStr) {
    return inspectStr && targetStr && -1 !== inspectStr.toLowerCase().indexOf(targetStr.toLowerCase());
}

function episodeMatchesQuery(episode, query) {
    return !query || contains(episode.name, query) || contains(episode.summary, query);
}


function tvShowMatchesQuery(show, query) {
    return (
        !query
        || contains(show.name, query)
        || show.genres.some(genre => contains(genre, query))
        || contains(show.summary, query)
    );
}

function handleChosenEpisode(event) {
    let opts = event.target.selectedOptions;
    if (opts.length !== 1) {
        return;
    }
    let id = opts[0].value;
    document.location.assign(`#${id}`);
}

function handleChosenShowFromSelect(event) {
    let opts = event.target.selectedOptions;
    if (opts.length !== 1) {
        return;
    }
    let id = opts[0].value;
    let showName = opts[0].dataset.title;
    handleChosenShow(id, showName);
}

function handleChosenShow(id, showName) {
    fetchEpisodesForShow(Number(id));
    document.getElementById("showTitleHeader").textContent = showName;
    document.getElementById("episodesPage").hidden = false;
    document.getElementById("showsPage").hidden = true;
}

function makeShowSelector(shows) {
    const selectElem = document.getElementById("showSelect");
    selectElem.textContent = ""; //empty it
    selectElem.onchange = handleChosenShowFromSelect;
    shows.forEach(show => {
        //e.g. <option value="82">Game Of Thrones</option>;
        const optionElem = document.createElement("option");
        optionElem.setAttribute("value", show.id);
        optionElem.setAttribute("data-title", show.name);
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

function makePageForShows(json) {
    console.log("making page for shows");
    makeShowSelector(json);
    document.getElementById("filterSummary").textContent = json.length.toString();

    const showsListElem = document.getElementById("showsList");

    showsListElem.textContent = ""; //wipe previous content

    json.forEach(show => {
        const card = makeCardForShow(show);
        showsListElem.appendChild(card);
    });
}

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function makeCardForShow(show) {
    //--- Containing... ---
    //Title - linking to episodes view
    //Image
    //Summary
    // (and in info panel)...
    //Genre
    //Rating
    //status

    const li = document.createElement("li");
    li.classList.add("show");

    const aWithTitle = appendNewChild(li, "a");
    //aWithTitle.setAttribute("href", `https://www.tvmaze.com/shows/${show.id}`)
    aWithTitle.addEventListener("click", () => handleChosenShow(show.id, show.name));
    appendNewChild(aWithTitle, "h1").textContent = show.name;

    const div3 = appendNewChild(li, "div");
    div3.classList.add("three-panels");
    const figure = appendNewChild(div3, "figure");
    figure.classList.add("panel", "panel-one");
    const img = appendNewChild(figure, "img");
    img.setAttribute(
        "src",
        show.image ? show.image.medium : "https://placekitten.com/300/200"
    );

    const divMiddle = appendNewChild(div3, "div");
    divMiddle.classList.add("panel", "panel-two");
    divMiddle.textContent = stripTags(show.summary);

    const divRight = appendNewChild(div3, "div");
    divRight.classList.add("panel", "panel-three");
    [{ title: "Rated", fn: show => show.rating.average },
    { title: "Genres", fn: show => show.genres.join(" | ") },
    { title: "Status", fn: show => show.status },
    { title: "Runtime", fn: show => show.runtime }
    ].forEach(info => {
        const p = appendNewChild(divRight, "p");
        const span = appendNewChild(p, "span");
        span.classList.add("info-key");
        span.textContent = info.title + ": ";
        p.appendChild(document.createTextNode(info.fn(show)))
    });

    return li;
}

function appendNewChild(parent, elementType) {
    return parent.appendChild(document.createElement(elementType));
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
    h1.classList.add("episodeTitle");
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
    // <
    // / (optional)
    // a sequence of at least one alphabet character (case insensitive)
    // >
    return str.replace(/<\/?[a-z]+>/gi, "");
}
window.onload = setup;
