(function () {
  const dataEl = document.getElementById("wiki-data");
  const siteData = JSON.parse(dataEl.textContent || "{}");

  const welcome = document.getElementById("welcome");
  const entriesEl = document.getElementById("entries");
  const links = document.querySelectorAll(".sub-link");

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function renderEntries(catKey, subKey) {
    const cat = siteData[catKey];
    if (!cat) return;
    const items = (cat.subcategories && cat.subcategories[subKey]) || [];

    entriesEl.innerHTML = `<h2>${escapeHtml(cat.category)} · ${escapeHtml(subKey)} (${items.length})</h2>`;

    if (items.length === 0) {
      entriesEl.innerHTML += `<p class="placeholder">아직 등록된 정보가 없습니다.</p>`;
    }

    // 최신 갱신순 정렬
    const sorted = [...items].sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));

    sorted.forEach((item) => {
      const tags = (item.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(" ");
      const sources = (item.sources || [])
        .map((s) => `<a href="${escapeHtml(s)}" target="_blank" rel="noopener">${escapeHtml(s)}</a>`)
        .join("<br>");
      const contributors = (item.contributors || []).join(", ");

      const card = document.createElement("div");
      card.className = "entry-card";
      card.innerHTML = `
        <h3>${escapeHtml(item.title)}</h3>
        <div class="entry-summary">${escapeHtml(item.summary)}</div>
        <div class="entry-body">${escapeHtml(item.body)}</div>
        <div class="entry-meta">
          <div class="tags">${tags}</div>
          <div class="sources">${sources}</div>
          <div>기여자: ${escapeHtml(contributors)}</div>
          <div>수정: ${escapeHtml(item.updated)}</div>
        </div>
      `;
      entriesEl.appendChild(card);
    });

    welcome.style.display = "none";
    entriesEl.style.display = "block";
  }

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      renderEntries(link.dataset.cat, link.dataset.sub);
      history.replaceState(null, "", `#${link.dataset.cat}/${link.dataset.sub}`);
    });
  });

  // 새로고침 시 해시로 상태 복원
  if (location.hash) {
    const [catKey, subKey] = location.hash.slice(1).split("/");
    const match = [...links].find((l) => l.dataset.cat === catKey && l.dataset.sub === subKey);
    if (match) match.click();
  }
})();
