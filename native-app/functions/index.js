const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

exports.notifyNativeChatMessage = onDocumentCreated(
  { document: 'chats/{chatId}/messages/{messageId}', region: 'us-central1' },
  async (event) => {
    const message = event.data && event.data.data();
    if (!message || !message.senderId) return;
    const db = getFirestore();
    const chatSnap = await db.collection('chats').doc(event.params.chatId).get();
    if (!chatSnap.exists) return;
    const chat = chatSnap.data() || {};
    const participants = Array.isArray(chat.participants) ? chat.participants : [];
    const recipientUid = participants.find((uid) => uid !== message.senderId);
    if (!recipientUid) return;

    const tokenSnap = await db.collection('users').doc(recipientUid).collection('deviceTokens').get();
    const tokens = tokenSnap.docs.map((doc) => ({ id: doc.id, token: doc.get('token') })).filter((item) => typeof item.token === 'string' && item.token.length > 20);
    if (!tokens.length) return;

    const members = chat.members || {};
    const senderName = (members[message.senderId] && members[message.senderId].name) || 'Nuevo mensaje';
    let body = typeof message.text === 'string' ? message.text : '';
    if (!body && message.mediaType === 'image') body = '📷 Te enviaron una foto';
    if (!body && message.mediaType === 'video') body = '🎬 Te enviaron un video';
    if (!body && message.mediaType === 'audio') body = '🎤 Te enviaron una nota de voz';
    if (!body && (message.messageType === 'sticker' || message.stickerId)) body = '😊 Te enviaron un sticker';
    if (!body) body = 'Te enviaron un mensaje';

    const response = await getMessaging().sendEachForMulticast({
      tokens: tokens.map((item) => item.token),
      notification: { title: senderName, body },
      data: { chatId: event.params.chatId, messageId: event.params.messageId, type: 'chat_message' },
      android: { priority: 'high', notification: { channelId: 'sixseven-messages', color: '#ff2020', sound: 'default' } },
    });
    const removals = [];
    response.responses.forEach((result, index) => {
      if (!result.success && ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(result.error && result.error.code)) {
        removals.push(tokenSnap.docs.find((doc) => doc.id === tokens[index].id).ref.delete());
      }
    });
    await Promise.all(removals);
  }
);
