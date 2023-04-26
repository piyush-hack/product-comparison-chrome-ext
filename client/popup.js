document.getElementById("extractTextBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const params = ["#productTitle" , ".B_NuCI" , ".pdp-title" , ".pdp-name"]; // Replace with the desired class name

        const activeTab = tabs[0];

        console.log(tabs, activeTab)
        await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ['content.js']
        });

        chrome.tabs.sendMessage(activeTab.id, { action: "extractTextByClass", params: params }, (response) => {
            // Send extracted texts to the API
            let text = response.texts;
            text = encodeURI(text);

            // Send extracted texts to the API
            fetch("http://127.0.0.1:5000/api/scrape/site", { // Replace with your API endpoint URL
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "scrapeUrl": `https://www.google.com/search?q=${text}&tbm=shop`,
                    "section": {
                        "class": ".KZmu8e",
                        "children": {
                            ".sh-np__product-title": "title",
                            ".T14wmb b": "price",
                            ".sh-np__seller-container span": "siteName"
                        },
                        "img": true
                    }
                })
            }).then(async response => {
                const res = await response.json()
                const data = res.data;
                const cardContainer = document.getElementById('cardContainer');
                cardContainer.innerHTML = ''; // Clear the container

                data.forEach(item => {
                    const card = createCard(item);
                    cardContainer.appendChild(card);
                });
            }).catch(error => {
                // Handle errors
            });
        });
    });
});


function createCard(data) {
    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    img.src = data.img[0];
    card.appendChild(img);

    const title = document.createElement('h4');
    title.textContent = data.title;
    card.appendChild(title);

    const price = document.createElement('p');
    price.textContent = data.price;
    card.appendChild(price);

    const siteName = document.createElement('p');
    siteName.textContent = data.siteName;
    card.appendChild(siteName);

    const link = document.createElement('a');
    link.href = data.href;
    link.target = '_blank';
    link.textContent = 'View Product';
    card.appendChild(link);

    return card;
}



