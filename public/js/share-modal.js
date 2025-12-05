// Safe share modal handler
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("share-btn");
  const modal = document.getElementById("share-modal");
  const closeBtn = document.getElementById("share-close");

  if (btn && modal) {
    btn.addEventListener("click", () => {
      modal.classList.remove("hidden");
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }
});
