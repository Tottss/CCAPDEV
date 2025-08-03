export async function loadHeaderPfp() {
  const headerImg = document.getElementById("headerPfp");
  if (!headerImg) return;           

  try {
    const res = await fetch('/api/user/me', { credentials: 'include' });

    if (!res.ok) {
      headerImg.src = "user.jpg";
      return;
    }

    const user = await res.json();

    headerImg.src = user.profilePicture
      ? `/uploads/${user.profilePicture}?t=${Date.now()}`
      : "user.jpg";
  } catch (err) {
    console.error("Couldn’t load profile picture:", err);
    headerImg.src = "user.jpg";
  }
}