import clientPromise from 'lib/db/mongodb'
import { getAllUsers } from 'lib/db/users'
import { ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const dbClient = await clientPromise
  const users = dbClient.db(process.env.MONGODB_DB).collection('users')

  const { method } = req
  switch (method) {
    case 'GET':
      const limit = !req.query.limit ? 50 : parseInt(req.query.limit as string, 10)
      const skip = !req.query.skip ? 0 : parseInt(req.query.skip as string, 10)
      const query = !req.query.search
        ? { _id: { $ne: ObjectId.createFromHexString('6182866e540bcdf031061884') } }
        : {
            nameSearch: { $regex: `${String(req.query.search)}`, $options: 'i' },
            _id: { $ne: ObjectId.createFromHexString('6182866e540bcdf031061884') },
          }

      const documents = await getAllUsers(users, query, limit, skip)

      if (documents === null) {
        res.status(500).json({
          success: false,
          payload: {
            error: {
              code: 500,
              message: 'There was a problem fetching users.',
            },
          },
          error: {
            code: 500,
            message: 'There was a problem fetching users.',
          },
        })
        break
      }

      const numDocuments = documents.length
      const totalDocuments = await users.countDocuments(query)
      const numDocumentsRemaining = (await users.countDocuments(query, { skip: skip })) - limit

      res.status(200).json({
        success: true,
        payload: {
          users: documents,
          numDocuments,
          totalDocuments,
          numDocumentsRemaining,
        },
      })
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
      break
  }
}
