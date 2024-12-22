document.addEventListener("DOMContentLoaded", () => {
  const copiedList = document.getElementById("copied-items-list");
  const clearButton = document.getElementById("clear-copied-items");

  function displayCopiedItems() {
    chrome.storage.local.get("copiedItems", (data) => {
      const items = data.copiedItems || [];
      copiedList.innerHTML = "";
      items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        copiedList.appendChild(li);
      });
    });
  }

  displayCopiedItems(); // Display items when popup opens

  clearButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "clearAll" }, () => {
      displayCopiedItems(); // Refresh the list after clearing
    });
  });

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.updatePopup) displayCopiedItems();
    }
  );
});
