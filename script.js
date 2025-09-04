document.addEventListener("DOMContentLoaded", () => {
  const courses = Array.from(document.querySelectorAll(".course"));
  const byId = Object.fromEntries(courses.map(el => [el.id, el]));

  // índice de dependientes
  const dependientes = {};
  for (const el of courses) {
    const prereq = el.dataset.prereq;
    if (!prereq) continue;
    const reqs = prereq.split(",").map(s => s.trim()).filter(Boolean);
    el.dataset.prereq = reqs.join(",");
    for (const r of reqs) {
      if (!dependientes[r]) dependientes[r] = [];
      dependientes[r].push(el.id);
    }
  }

  // cargar progreso de localStorage
  const saved = JSON.parse(localStorage.getItem("malla-aprobados") || "[]");
  for (const id of saved) {
    const el = byId[id];
    if (el && !el.disabled) {
      el.classList.add("approved");
      el.setAttribute("aria-pressed","true");
    }
  }
  // recalcular locks después de aplicar aprobados
  for (const el of courses) refreshCourseLock(el.id);

  courses.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;

      const approved = btn.classList.toggle("approved");
      btn.setAttribute("aria-pressed", approved ? "true" : "false");

      updateDependents(btn.id, true);

      saveProgress();
    });
  });

  function refreshCourseLock(targetId){
    const el = byId[targetId];
    if (!el) return;
    const reqs = (el.dataset.prereq || "").split(",").map(s=>s.trim()).filter(Boolean);
    if (reqs.length === 0) { el.disabled = false; return; }

    const allApproved = reqs.every(rid => byId[rid] && byId[rid].classList.contains("approved"));
    const wasDisabled = el.disabled;
    el.disabled = !allApproved;
    if (el.disabled) {
      el.classList.remove("approved");
      el.setAttribute("aria-pressed","false");
    }
    // animación al desbloquear
    if (wasDisabled && !el.disabled) {
      el.classList.add("unlocked-animation");
      setTimeout(()=>el.classList.remove("unlocked-animation"),600);
    }
  }

  function updateDependents(sourceId, cascade){
    const hijos = dependientes[sourceId] || [];
    for (const childId of hijos) {
      const before = byId[childId].disabled;
      refreshCourseLock(childId);
      const after = byId[childId].disabled;
      if (cascade && after) {
        lockDescendants(childId);
      }
    }
  }

  function lockDescendants(startId){
    const queue = [startId];
    const seen = new Set();
    while (queue.length){
      const curr = queue.shift();
      if (seen.has(curr)) continue;
      seen.add(curr);

      const el = byId[curr];
      if (!el) continue;

      el.disabled = true;
      el.classList.remove("approved");
      el.setAttribute("aria-pressed","false");

      const hijos = dependientes[curr] || [];
      for (const h of hijos) queue.push(h);
    }
  }

  function saveProgress(){
    const aprobados = courses.filter(c => c.classList.contains("approved")).map(c => c.id);
    localStorage.setItem("malla-aprobados", JSON.stringify(aprobados));
  }
});
