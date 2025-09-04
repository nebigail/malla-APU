document.addEventListener("DOMContentLoaded", () => {
  const courses = document.querySelectorAll(".course");

  courses.forEach(course => {
    course.addEventListener("click", () => {
      // no hacer nada si está bloqueado
      if (course.classList.contains("locked")) return;

      // marcar/desmarcar aprobado
      course.classList.toggle("approved");

      // si desbloquea otro
      const unlockId = course.dataset.unlocks;
      if (!unlockId) return;

      const next = document.getElementById(unlockId);
      if (!next) return;

      // si recién se aprobó, desbloquear el siguiente
      if (course.classList.contains("approved")) {
        next.classList.remove("locked");
      } else {
        // si se desmarca, volver a bloquear y quitar aprobado al siguiente
        next.classList.add("locked");
        next.classList.remove("approved");
      }
    });
  });
});
