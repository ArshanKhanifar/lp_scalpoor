import axios from "axios";

export const postMessageToTelegram = async (message: string) => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHANNEL_CHAT_ID;
  const MESSAGE_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const url = `${MESSAGE_API}?chat_id=${CHAT_ID}&text=${message}&parse_mode=HTML`;
  try {
    await axios.get(url);
  } catch (e) {
    console.error("error sending telegram message", e);
  }
};
