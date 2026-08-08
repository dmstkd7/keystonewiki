(function () {
  const dataEl = document.getElementById("wiki-data");
  const siteData = JSON.parse(dataEl.textContent || "{}");

  const welcome = document.getElementById("welcome");
  const entriesEl = document.getElementById("entries");
  const titleEl = document.getElementById("current-category-title");
  const descEl = document.getElementById("current-category-desc");
  const links = document.querySelectorAll(".nav-item");

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function renderEntries(catKey, subKey) {
    const cat = siteData[catKey];
    if (!cat) return;
    const items = (cat.subcategories && cat.subcategories[subKey]) || [];

    titleEl.innerText = `${cat.category} · ${subKey}`;
    descEl.innerText = `${items.length}건의 정리된 정보`;

    // 최신 갱신순 정렬
    const sorted = [...items].sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));

    if (sorted.length === 0) {
      entriesEl.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open"></i>
          <h3>해당 카테고리에 수집된 정보가 없습니다.</h3>
          <p>AI 툴에게 "keystonewiki에 올려줘"라고 요청하면 자동으로 정리되어 쌓입니다.</p>
        </div>`;
    } else {
      entriesEl.innerHTML = sorted.map((item) => {
        const tags = (item.tags || []).map((t) => `<span class="tag-chip">${escapeHtml(t)}</span>`).join("");
        const sources = (item.sources || [])
          .map((s) => `<a href="${escapeHtml(s)}" target="_blank" rel="noopener">${escapeHtml(s)}</a>`)
          .join("<br>");
        const contributors = (item.contributors || []).join(", ");

        return `
          <div class="item-card">
            <div class="card-top">
              <h3 class="card-title">${escapeHtml(item.title)}</h3>
              <span class="updated-tag">${escapeHtml(item.updated)}</span>
            </div>
            ${item.summary ? `<div class="card-summary">${escapeHtml(item.summary)}</div>` : ""}
            <div class="card-description">${escapeHtml(item.body)}</div>
            ${tags ? `<div class="tags-row">${tags}</div>` : ""}
            <div class="meta-box">
              <div class="meta-row"><strong>기여자</strong>${escapeHtml(contributors)}</div>
              ${sources ? `<div class="meta-row"><strong>출처</strong>${sources}</div>` : ""}
            </div>
          </div>`;
      }).join("");
    }

    welcome.style.display = "none";
    entriesEl.style.display = "grid";
  }

  links.forEach((link) => {
    link.addEventListener("click", () => {
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
