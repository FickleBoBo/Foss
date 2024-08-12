import axios from 'axios';

interface NotificationResponse {
  content: string;
  targetUrl: string;
  isRead: boolean;
  createdDate: string;
}

const AllNotification = async (token: any): Promise<NotificationResponse[]> => {
  try {
    const response = await axios.get('https://i11a705.p.ssafy.io/api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

export default AllNotification;
