const input = document.getElementById("achievement-input");
const button = document.getElementById("post-btn");
const feed = document.getElementById("feed");

// last achievements
let achievements = JSON.parse(localStorage.getItem("achievify_data")) || [];

// vis achievements
function renderFeed() {
  feed.innerHTML = "";
  achievements.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.className = "feed-item";
    li.innerHTML = `
      ${item.text}
      <small>${item.date}</small>
    `;
    feed.appendChild(li);
  });
}

// post achievement
button.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  const item = {
    text,
    date: new Date().toLocaleString()
  };

  achievements.push(item);
  localStorage.setItem("achievify_data", JSON.stringify(achievements));

  input.value = "";
  renderFeed();
});

// initial visning
renderFeed();
