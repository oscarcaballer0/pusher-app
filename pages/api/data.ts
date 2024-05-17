import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../utils/mongodb';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.NEXT_PUBLIC_PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

let changeStreamInitialized = false;

const initializeChangeStream = async () => {
  const { db } = await connectToDatabase();
  if (!changeStreamInitialized) {
    const changeStream = db.collection('todos').watch();
    changeStream.on('change', (itemChanged: any) => {
      const item = {
        _id: itemChanged.documentKey._id,
        ...itemChanged.updateDescription.updatedFields
      }
      pusher.trigger('todos', 'change', item);
    });
    changeStreamInitialized = true;
  }
};


initializeChangeStream();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const data = await db.collection('todos').find({}).toArray();
  res.json(data);
};

export default handler;