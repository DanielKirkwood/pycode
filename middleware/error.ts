// middleware/error.ts
// if error occurs immedietly stop connection and return 500

export default async function onError(error, req, res) {
  console.error(error)
  res.status(500).end()
}
