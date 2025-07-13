export async function loadHeaderPfp() {
  const headerImg = document.getElementById("headerPfp");
  if (!headerImg) return;           

  const logged = JSON.parse(localStorage.getItem("loggedIn"));
  if (!logged) {                   
    headerImg.src = "user.jpg";
    return;
  }

  try {
    const res  = await fetch(`/api/user/${logged._id}`);
    const user = await res.json();

    headerImg.src = user.profilePicture
      ? `/uploads/${user.profilePicture}?t=${Date.now()}` 
      : "user.jpg";
  } catch (err) {
    console.error("Couldn’t load profile picture:", err);
  }
}