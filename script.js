document.addEventListener("DOMContentLoaded", () => {
  const courses = document.querySelectorAll(".course");

  courses.forEach(course => {
    course.addEventListener("click", () => {
      if (course.classList.contains("locked")) return;

      // Marcar aprobado
      course.classList.toggle("approved");

      // Desbloquear ramos dependientes si aprobado
      if (course.classList.contains("approved")) {
        const unlockId = course.dataset.unlocks;
        if (unlockId) {
          const next = document.getElementById(unlockId);
          if (next) {
            next.classList.remove("locked");
          }
        }
      } else {
        // Si se desmarca, volver a bloquear
        const unlockId = course.dataset.unlocks;
        if (unlockId) {
          const next = document.getElementById(unlockId);
          if (next) {
            next.classList.add("locked");
            next.classList.remove("approved");
          }
        }
      }
    });
  });
});
