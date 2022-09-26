// ==UserScript==
// @name         Woolies Cart Saver
// @version      1.0
// @description  Turns your Woolies shopping cart into text you can copy/paste.
// @match        https://www.woolworths.com.au/*
// @icon         https://cdn-icons-png.flaticon.com/512/263/263142.png
// @homepageURL  https://github.com/KingJesus6/Woolies-Cart-Saver
// @grant        none
// ==/UserScript==

// icon: Flaticon.com. The icon supplied is courtesy of Flaticon.com

(function() {
    const { wowAdaptive } = window;
    const baseUrl = "https://www.woolworths.com.au";
    const mainBtnId = "saveList-btn";

    wowAdaptive.mediator.subscribe("wx-msg-cart-open", async (event) => {
        if (!event.isCartOpen) return;

        let checkoutButtons = document.querySelector(".cart-checkout-content");

        // Element does not load instantly, so wait for it when necessary
        while (!checkoutButtons) {
            await sleep(100);

            checkoutButtons = document.querySelector(".cart-checkout-content");
        }

        // This is an attribute tag required for proper styling
        const stylingAttrName = Array.from(checkoutButtons.attributes)
            .find((attr) => attr.name.startsWith("_ngcontent-serverapp")).name;
        const extensionElement = document.createElement("div");

        extensionElement.innerHTML =
        `<div class="cart-checkout-button" ${stylingAttrName}="">
            <button class="button button--primary" id="${mainBtnId}">
                Copy List
            </button>
        </div>`;

        checkoutButtons.appendChild(extensionElement.firstChild);

        const mainBtn = document.querySelector(`#${mainBtnId}`);

        if (!mainBtn) {
            alert("Unable to find your cart! Please contact the developer!");
            return;
        }

        mainBtn.addEventListener("click", handleClick);
    });

    function handleClick() {
        const cartItems = document.getElementsByTagName("wow-cart-item");

        if (!cartItems) {
            alert("Unable to find cart items! Please contact the developer!");
            return;
        }

        const items = [];

        for (const item of cartItems) {
            /**
             * Returns the TOTAL price
             * Is NOT the price per each unit
             * Format of "$x.xx"
             */
            const priceEl = item.querySelector(".price")?.textContent;
            const nameEl = item.querySelector(".cart-item-name");
            const quantity = item.querySelector("input[aria-label='Order quantity']")?.value;

            items.push({
                name: nameEl?.textContent || "Unknown name",
                url: nameEl.getAttribute("href") || "No URL available",
                quantity: quantity ? parseInt(quantity) : "Unknown quantity",
                totalPrice: priceEl ? parseFloat(priceEl.substring(1)) : "Unknown Price"
            });
        }

        const cartSummary = items.reduce((currSummary, currItem) => {
            const updatedSummary = {
                ...currSummary
            };

            updatedSummary.totalItems += currItem.quantity;
            updatedSummary.price += currItem.totalPrice;

            return updatedSummary;
        }, {
            totalItems: 0,
            price: 0
        });

        let list = items.map((item) => {
            return (
                `x${item.quantity} - ${item.name} | $${item.totalPrice}\
                \n(${baseUrl + item.url})`
            );
        }).join("\n\n");

        list +=
        `\n\n\nSummary:\
        \nUnique Items - ${items.length}\
        \nTotal Items - ${cartSummary.totalItems}\
        \nFinal Cost - $${cartSummary.price}`;

        navigator.clipboard.writeText(list).then(() => {
            alert("Your shopping list was successfully copied to your clipboard!");
        }).catch((err) => {
            alert("Failed to copy shopping list to your clipboard!", err.message);
        });
    }

    const sleep = (duration) => {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, duration);
        });
    };
})();
