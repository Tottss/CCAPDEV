const slotList = document.getElementById("slotList");

function addSlot(lab, time, date) {
    const li = document.createElement("li");
    li.className = "flex items-center px-3 py-2 rounded bg-white";

    const removeBtn = document.createElement("span");
    removeBtn.className = "text-[#A2F1B6] bg-white rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold mr-2 cursor-pointer";
    removeBtn.textContent = "×";

    removeBtn.addEventListener("click", () => {
    li.remove();
  });

  const text = document.createElement("span");
  text.className = "text-sm font-bold";
  text.textContent = `${lab} | ${time} | ${date}`;

  li.appendChild(removeBtn);
  li.appendChild(text);
  slotList.appendChild(li);

  const scrollContainer = document.getElementById("slotScroll");
  scrollContainer.scrollTop = scrollContainer.scrollHeight;
}
document.addEventListener("DOMContentLoaded", () => {
  

  // For testing: add a sample slot
  addSlot("G202", "0815 - 0845", "07/20/25");
});