import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para enviar/receber cookies
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se for um erro 401, pode ser que o cookie de sessão tenha expirado
    if (error.response && error.response.status === 401) {
      console.error('Erro de autenticação:', error.response.data)
    }
    return Promise.reject(error)
  }
)

export default api
