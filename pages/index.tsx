import { useCallback, useEffect, useState } from 'react';
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

const Home = () => {
  const [data, setData] = useState([]);

  const updateData = useCallback(
    (updatedItem: any) => {
      setData((prevData: any) => {
        const updatedArray = prevData.map((item: any) => 
          item._id === updatedItem._id ? {...item, ...updatedItem} : item
        );
        return updatedArray;
      });
    },
    [],
  )

  useEffect(() => {
    const channel = pusher.subscribe('todos');
    channel.bind('change', (updatedItem: any) => {
      updateData(updatedItem)
    });
    // Fetch initial data
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => setData(data));

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);
  
  return (
    <div>
      <h1>Real-time Data</h1>
      <ul>
        {data.map((item: any) => (
          <li key={item._id}>{item.item}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
