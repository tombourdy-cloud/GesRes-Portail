// Script de connexion

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  const errorDiv = document.getElementById('error-message')
  
  try {
    const response = await axios.post('/api/auth/login', {
      username,
      password
    })
    
    if (response.data.success) {
      // Rediriger vers l'admin
      window.location.href = '/admin'
    }
  } catch (error) {
    errorDiv.classList.remove('hidden')
    errorDiv.textContent = error.response?.data?.error || 'Erreur de connexion'
  }
})
