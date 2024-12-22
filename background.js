chrome.runtime.onInstalled.addListener(() => {
    // Create context menu item when extension is installed
    chrome.contextMenus.create({
        id: "copySelectedText",
        title: "Copy Selected Text",
        contexts: ["selection"]
    });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "copySelectedText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                const selectedText = window.getSelection().toString();
                if (selectedText) {
                    navigator.clipboard.writeText(selectedText)
                        .then(() => {
                            console.log('Text copied to clipboard');
                            // Send message to background to update storage and popup
                            chrome.runtime.sendMessage({ text: selectedText });
                        })
                        .catch(err => {
                            console.error('Failed to copy: ', err);
                        });
                }
            }
        });
    }
});

// Listen for command (shortcut key)
chrome.commands.onCommand.addListener((command) => {
    if (command === "copy-selected-text") {
        // Execute on the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    const selectedText = window.getSelection().toString();
                    if (selectedText) {
                        navigator.clipboard.writeText(selectedText)
                            .then(() => {
                                console.log('Text copied to clipboard');
                                // Send message to background to update storage and popup
                                chrome.runtime.sendMessage({ text: selectedText });
                            })
                            .catch(err => {
                                console.error('Failed to copy: ', err);
                            });
                    }
                }
            });
        });
    }
});

// Listen for messages from the popup or context menu actions to update storage
chrome.runtime.onMessage.addListener((message) => {
    if (message.text) {
        chrome.storage.local.get("copiedItems", (data) => {
            let items = data.copiedItems || [];
            if (!items.includes(message.text)) {
                items.push(message.text);
                chrome.storage.local.set({ copiedItems: items }, () => {
                    // Send message to popup to update the list
                    chrome.runtime.sendMessage({ updatePopup: true });
                });
            } else {
                // If it's a duplicate, still tell the popup to update so it doesn't get out of sync
                chrome.runtime.sendMessage({ updatePopup: true });
            }
        });
    } else if (message.action === "clearAll") {
        chrome.storage.local.set({ copiedItems: [] }, () => {
            chrome.runtime.sendMessage({ updatePopup: true });
        });
    }
});
