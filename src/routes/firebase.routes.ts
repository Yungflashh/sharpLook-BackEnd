// routes/api/testPush.ts
import admin from '../utils/firebase';

export async function sendTestPush(req, res) {
  const { token } = req.body;

  try {
    const response = await admin.messaging().send({
      token,
      notification: {
        title: 'Test',
        body: 'This is a test push notification.',
      },
    });

    return res.json({ success: true, response });
  } catch (error) {
    console.error('Push error:', error);
    return res.status(500).json({ error: 'Push failed', details: error.message });
  }
}
