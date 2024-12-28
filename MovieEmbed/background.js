let socket = null;

function connectToDiscord() {
  socket = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");

  socket.onopen = () => {
    console.log("Connected to Discord.");
    const identifyPayload = {
      op: 2,
      d: {
        token: "", 
        intents: 0,
        properties: {
          os: "windows",
          browser: "chrome",
          device: "pc"
        }
      }
    };
    socket.send(JSON.stringify(identifyPayload));
  };

  socket.onerror = (error) => console.error("Discord WebSocket error:", error);
  socket.onclose = () => console.log("Discord WebSocket closed.");
}
function updatePresence(tabTitle) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const presencePayload = {
        op: 3,
        d: {
          since: null,
          activities: [
            {
              name: "Nunflix",
              type: 3, 
              details: "Browsing Nunflix",
              state: tabTitle || "Enjoying content on nunflix.org"
            }
          ],
          status: "online",
          afk: false
        }
      };
      socket.send(JSON.stringify(presencePayload));
      console.log("Presence updated with state:", tabTitle);
    }
  }
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("nunflix.org") && changeInfo.title) {
      console.log("Nunflix detected, updating Discord presence with title:", changeInfo.title);
      updatePresence(changeInfo.title);
    }
  });
  
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab.url && tab.url.includes("nunflix.org")) {
        console.log("Nunflix detected in active tab, updating Discord presence with title:", tab.title);
        updatePresence(tab.title);
      }
    });
  });
  
  connectToDiscord();
