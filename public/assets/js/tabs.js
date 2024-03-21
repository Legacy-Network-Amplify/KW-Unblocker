const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");

const input = document.querySelector("input");


class crypts {
    static encode(str) {
        return encodeURIComponent(
            str
                .toString()
                .split("")
                .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
                .join("")
        );
    }

    static decode(str) {
        if (str.charAt(str.length - 1) === "/") {
            str = str.slice(0, -1);
        }
        return decodeURIComponent(
            str
                .split("")
                .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
                .join("")
        );
    }
}

function search(input) {
    input = input.trim();
    const searchTemplate = localStorage.getItem('engine') || 'https://google.com/search?q=%s';

    try {
        return new URL(input).toString();
    } catch (err) {
        try {
            const url = new URL(`http://${input}`);
            if (url.hostname.includes(".")) {
                return url.toString();
            }
            throw new Error('Invalid hostname');
        } catch (err) {

            return searchTemplate.replace("%s", encodeURIComponent(input));
        }
    }
}

function ifUrl(val = "") {
    const urlPattern = /^(http(s)?:\/\/)?([\w-]+\.)+[\w]{2,}(\/.*)?$/;
    return urlPattern.test(val);
}

if ('serviceWorker' in navigator) {
    let proxySetting = localStorage.getItem('proxy') || 'uv';
    let swConfig = {
        'uv': { file: '/uv/sw.js', config: __uv$config }
    };

    let { file: swFile, config: swConfigSettings } = swConfig[proxySetting];

    navigator.serviceWorker.register(swFile, { scope: swConfigSettings.prefix })
        .then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                var encodedUrl = swConfigSettings.prefix + crypts.encode(search(address.value));

                const activeIframe = document.querySelector('iframe.iframe.active');
                if (activeIframe) {
                    activeIframe.src = encodedUrl;
                } else {
                    location.href = encodedUrl;
                }
            });
        })
        .catch((error) => {
            console.error('ServiceWorker registration failed:', error);
        });
}

let tabIndex = 0;

function createTab(encodedUrl) {
    const tabsContainer = document.getElementById('tabs');
    const tabContentContainer = document.getElementById('tab-content');
    const newTabId = 'tab-' + tabIndex;
    const newContentId = 'content-' + tabIndex;

    let newTab = document.createElement('div');
    newTab.classList.add('tab');
    newTab.id = newTabId;
    newTab.textContent = "New Tab"; // Replace this with the page title if available
    newTab.draggable = true;

    // Create the close button for the tab
    let closeButton = document.createElement('button');
    closeButton.classList.add('close-tab');
    closeButton.textContent = 'X'; // Again, consider using an icon for a better user experience
    closeButton.onclick = function (event) {
        // Close the tab
        newTab.remove();
        newContent.remove(); // The content pane associated with the tab
        event.stopPropagation(); // Prevent triggering the tab's click event
    };
    newTab.appendChild(closeButton);
    tabsContainer.appendChild(newTab);


    // Create the content pane
    let newContent = document.createElement('div');
    newContent.classList.add('tab-pane');
    newContent.id = newContentId;
    tabContentContainer.appendChild(newContent);

    // Create the iframe within the content pane
    let newIframe = document.createElement('iframe');
    if (!encodedUrl) {
        newIframe.setAttribute('src', "/learning");
    } else {
        newIframe.setAttribute('src', encodedUrl);
    }
    newIframe.setAttribute('name', 'New Tab');
    newIframe.style.width = '100%';
    newIframe.style.height = '80%'; // Customizable to suit your design
    newContent.appendChild(newIframe);

    // Event listener to make the tab active
    newTab.addEventListener('click', () => {
        document.querySelectorAll('.tab, .tab-pane').forEach(el => {
            el.classList.remove('active');
        });
        newTab.classList.add('active');
        newContent.classList.add('active');
    });

    newTab.click();

    // Increment the index for the next tab
    tabIndex++;
}

function backward() {
    document.querySelector('iframe.iframe.active').contentWindow.history.back();

};

function forward() {
    document.querySelector('iframe.iframe.active').contentWindow.history.forward();

};

function refresh() {
    document.querySelector('iframe.iframe.active').src = document.querySelector('iframe.iframe.active').src;

};

if (sessionStorage.encodedUrl) {
    createTab(sessionStorage.encodedUrl);
} else {
    createTab()
}
