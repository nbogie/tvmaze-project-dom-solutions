function setup() {
    const episodes = getAllEpisodes();
    makePageForEpisodes(episodes);
}


function makePageForEpisodes(episodeList) {
    const container = document.getElementById("episodes");

    episodeList.forEach((episode) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const h1 = document.createElement("h1");
        h1.textContent = `${episode.name} - ${makeEpisodeCode(episode)}`;

        const img = document.createElement("img");
        img.setAttribute("src", episode.image.medium);

        const p = document.createElement("p");
        p.textContent = episode.summary;

        container.appendChild(card);
        card.appendChild(h1);
        card.appendChild(img);
        card.appendChild(p);
    });
}


function makeEpisodeCode(episode) {
    return `S${pad(episode.season)}E${pad(episode.number)}`;
}


function pad(num) {
    return num.toString().padStart(2, "0");
}


window.onload = setup;
