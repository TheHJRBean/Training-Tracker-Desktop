const http = require('http')

function waitForVite(retries = 50) {
  return new Promise((resolve, reject) => {
    const check = (attempt) => {
      http.get('http://localhost:5173', () => {
        resolve()
      }).on('error', () => {
        if (attempt >= retries) {
          reject(new Error('Vite dev server did not start'))
        } else {
          setTimeout(() => check(attempt + 1), 300)
        }
      })
    }
    check(0)
  })
}

waitForVite().then(() => {
  console.log('Vite dev server is ready')
}).catch((err) => {
  console.error(err.message)
  process.exit(1)
})
