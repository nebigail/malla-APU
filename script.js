// script.js
// Comportamiento:
// - en HTML las materias con prerrequisito vienen con `data-prereq="id1,id2"` y `disabled` (para que se vean bloqueadas al abrir).
// - localStorage guarda las materias aprobadas (ids).
// - al aprobar una materia (clic) actualiza dependientes; las materias desbloqueadas adquieren color (animación)
//   y quedan habilitadas para que el usuario las apruebe manualmente.

document.addEventListener('DOMContentLoaded', () => {
  const courses = Array.from(document.querySelectorAll('.course'));
  const byId = Object.fromEntries(courses.map(el => [el.id, el]));

  // construir índice de dependientes: prereqId -> [dependentId,...]
  const dependents = {};
  courses.forEach(el => {
    const prereqAttr = el.dataset.prereq;
    if (!prereqAttr) return;
    const reqs = prereqAttr.split(',').map(s => s.trim()).filter(Boolean);
    el.dataset.prereq = reqs.join(',');
    for (const r of reqs) {
      if (!dependents[r]) dependents[r] = [];
      dependents[r].push(el.id);
    }
  });

  // Cargar aprobados desde localStorage
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('malla-aprobados') || '[]');
    if (!Array.isArray(saved)) saved = [];
  } catch (e) {
    saved = [];
  }

  // Estado inicial:
  // - si el id está en saved => marcar aprobado y habilitar (por si estaba disabled en HTML)
  // - si tiene data-prereq y NO está en saved => dejar disabled (bloqueada)
  // - si no tiene data-prereq => habilitada
  for (const el of courses) {
    if (saved.includes(el.id)) {
      el.classList.add('approved');
      el.setAttribute('aria-pressed', 'true');
      el.disabled = false;
    } else {
      const hasPrereq = !!(el.dataset.prereq);
      if (hasPrereq) {
        el.disabled = true; // mantiene la apariencia gris del HTML
        el.setAttribute('aria-pressed', 'false');
        el.classList.remove('approved');
      } else {
        el.disabled = false;
        el.setAttribute('aria-pressed', 'false');
        el.classList.remove('approved');
      }
    }
  }

  // Tras aplicar aprobados iniciales, propagar desbloqueos según aprobados guardados
  for (const id of saved) {
    updateDependents(id, false);
  }

  // Evento click en materias
  courses.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return; // no hacer nada si está bloqueada

      const nowApproved = btn.classList.toggle('approved');
      btn.setAttribute('aria-pressed', nowApproved ? 'true' : 'false');

      // actualizar dependientes: si se aprobó -> pueden desbloquearse
      // si se des-aprobó -> se bloquea en cascada
      updateDependents(btn.id, true);

      saveProgress();
    });
  });

  // ---------- funciones auxiliares ----------

  function refreshCourseLock(targetId) {
    const el = byId[targetId];
    if (!el) return;
    const reqs = (el.dataset.prereq || '').split(',').map(s => s.trim()).filter(Boolean);
    if (reqs.length === 0) {
      // sin prereqs: siempre habilitada
      const wasDisabled = el.disabled;
      el.disabled = false;
      if (wasDisabled && !el.disabled) animateUnlock(el);
      return;
    }

    const allApproved = reqs.every(rid => byId[rid] && byId[rid].classList.contains('approved'));
    const wasDisabled = el.disabled;
    el.disabled = !allApproved;

    if (el.disabled) {
      // si queda bloqueada, quitar aprobado (consistencia)
      el.classList.remove('approved');
      el.setAttribute('aria-pressed', 'false');
    }

    // si pasó de bloqueada a habilitada -> animación
    if (wasDisabled && !el.disabled) {
      animateUnlock(el);
    }
  }

  function updateDependents(sourceId, cascade) {
    const hijos = dependents[sourceId] || [];
    for (const childId of hijos) {
      const beforeDisabled = byId[childId] && byId[childId].disabled;
      refreshCourseLock(childId);
      const afterDisabled = byId[childId] && byId[childId].disabled;

      // si quedó bloqueado y pedimos cascada, bloquear sus descendientes
      if (cascade && afterDisabled) {
        lockDescendants(childId);
      }

      // si quedó desbloqueado (beforeDisabled true, afterDisabled false) no habilitamos automáticamente (el usuario debe aprobarla).
      // simplemente dejamos que el usuario la apruebe cuando quiera.
    }
  }

  function lockDescendants(startId) {
    const queue = [startId];
    const seen = new Set();
    while (queue.length) {
      const curr = queue.shift();
      if (seen.has(curr)) continue;
      seen.add(curr);

      const el = byId[curr];
      if (!el) continue;

      el.disabled = true;
      el.classList.remove('approved');
      el.setAttribute('aria-pressed', 'false');

      const hijos = dependents[curr] || [];
      for (const h of hijos) queue.push(h);
    }
  }

  function animateUnlock(el) {
    el.classList.add('unlocked-animation');
    setTimeout(() => el.classList.remove('unlocked-animation'), 650);
  }

  function saveProgress() {
    const aprobados = courses.filter(c => c.classList.contains('approved')).map(c => c.id);
    try {
      localStorage.setItem('malla-aprobados', JSON.stringify(aprobados));
    } catch (e) {
      // si falla (ej: modo incógnito), no rompemos la UI
      console.warn('No se pudo guardar el progreso en localStorage', e);
    }
  }

});
