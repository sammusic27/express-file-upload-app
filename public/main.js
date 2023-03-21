function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const auth = getCookie('auth');
if (auth) {
  document.getElementById('signup').remove();
  document.getElementById('signin').remove();
} else {
  document.getElementById('upload-file').remove();
  document.getElementById('logout').remove();
}
