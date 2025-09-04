document.addEventListener("DOMContentLoaded", () => {
  const courses = Array.from(document.querySelectorAll(".course"));
  const byId = Object.fromEntries(courses.map(c => [c.id, c]));

  // dependientes
  const dependents = {};
  courses.forEach(c => {
    const req = c.dataset.prereq;
    if (req) {
      req.split(",").forEach(r => {
        r = r.trim();
        if (!dependents[r]) dependents[r] = [];
        dependents[r].push(c.id);
      });
    }
  });

  // cargar progreso
  const saved = JSON.parse(localStorage.getItem("malla") || "[]");
  saved.forEach(id => {
    const el = byId[id];
    if (el) {
      el.classList.add("approved");
      el.disabled = false;
    }
  });

  // actualizar locks al inicio
  courses.forEach(c => refreshLock(c.id));

  courses.forEach(c => {
    c.addEventListener("click", () => {
      if (c.disabled) return;

      c.classList.toggle("approved");
      if (!c.classList.contains("approved")) {
        // si desapruebo, bloqueo descendientes
        lockDescendants(c.id);
      }
      updateDependents(c.id);
      save();
    });
  });

  function refreshLock(id) {
    const el = byId[id];
    if (!el) return;
    const reqs = (el.dataset.prereq || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (reqs.length === 0) {
      el.disabled = false;
      return;
    }

    const allApproved = reqs.every(r => byId[r] && byId[r].classList.contains("approved"));
    const wasDisabled = el.disabled;
    el.disabled = !allApproved;

    if (wasDisabled && !el.disabled) {
      el.classList.add("unlocked");
      setTimeout(() => el.classList.remove("unlocked"), 600);
    }

    if (el.disabled) {
      el.classList.remove("approved");
    }
  }

  function updateDependents(source) {
    (dependents[source] || []).forEach(id => refreshLock(id));
  }

  function lockDescendants(source) {
    (dependents[source] || []).forEach(id => {
      const el = byId[id];
      if (!el) return;
      el.disabled = true;
      el.classList.remove("approved");
      lockDescendants(id);
    });
  }

  function save() {
    const approved = courses.filter(c => c.classList.contains("approved")).map(c => c.id);
    localStorage.setItem("malla", JSON.stringify(approved));
  }
});
