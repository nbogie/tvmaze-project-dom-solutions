//a cache of the downloaded episode list, for filtering
let allEpisodes;

function setup() {
    document
        .getElementById("searchInput")
        .addEventListener("input", makePageForMatchingEpisodes);

    //we cache the episode list locally for further filtering
    allEpisodes = getAllEpisodes();
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

function pad(num) {
    return num.toString().padStart(2, "0");
}

function makeEpisodeCode(episode) {
    return `S${pad(episode.season)}E${pad(episode.number)}`;
}

function makePageForEpisodes(json) {
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

function makeCardForEpisode(episode) {
    //--- Containing... ---
    //Title - Code (S02E07)
    //Image
    //Summary (cleaned)   
    const code = makeEpisodeCode(episode);

    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("id", code);

    const h1 = document.createElement("h1");
    h1.textContent = `${episode.name} - ${code}`;

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
