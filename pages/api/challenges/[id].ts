import { deleteOne, getOne } from 'lib/db/challenges'
import clientPromise from 'lib/db/mongodb'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const dbClient = await clientPromise
  const challenges = dbClient.db(process.env.MONGODB_DB).collection('challenges')

  const {
    query: { id },
    method,
  } = req
  switch (method) {
    case 'GET':
      const document = await getOne(challenges, id.toString())
      if (document === null) {
        res.status(500).json({ error: `could not get challenge with id ${id}` })
      }
      res.status(200).json(document)
      break
    case 'DELETE':
      const result = await deleteOne(challenges, id.toString())
      if (result === 0) {
        res.status(500).json({ error: `could not delete challenge with id ${id}` })
      }
      res.status(200).json({ message: `challenge with id ${id.toString} successfully deleted` })
      break
    default:
      if (process.env.NODE_ENV === 'production') {
        dbClient.close()
      }
      res.setHeader('Allow', ['GET', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}