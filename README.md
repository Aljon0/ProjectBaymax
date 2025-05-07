# 🩺 BAYMAX – AI Health Companion

**BAYMAX** is an AI-powered health companion web application designed to assist users in checking symptoms, tracking emotions, logging health entries, and receiving medically-informed advice. It integrates **Mistral AI** with public medical APIs like **MedlinePlus** and the **National Library of Medicine (NLM)** to provide reliable and supportive health information.

> 🚨 *Note: This is an educational and inspirational project – not affiliated with Disney’s BAYMAX.*

---

## 🚀 Live Demo  
🔗 [https://projectbaymax.onrender.com/](https://projectbaymax.onrender.com/)

---

## 📌 Features

- 🔍 **Symptom Checker**  
  Input or speak symptoms and receive AI-generated possible conditions, severity analysis, and helpful advice based on real medical sources.

- 🧠 **Daily Emotional Check-In**  
  Track moods using a slider or emoji, and receive gentle responses or support from the AI.

- 📓 **Health Journaling + CBT Tool**  
  Log thoughts or feelings using a simple journaling interface inspired by Cognitive Behavioral Therapy principles.

- 💡 **Health Tips & Smart Reminders**  
  Get tips on hydration, exercise, and sleep, plus optional push notifications to build healthy habits.

- 🆘 **Emergency Assistant**  
  Securely store vital info such as blood type, allergies, and emergency contacts. Notifies users to contact help if needed.

---

## 🛠️ Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| **Frontend** | React.js, Tailwind CSS            |
| **Backend**  | Express.js (Node.js)              |
| **Database** | Firebase Firestore                |
| **Auth**     | Firebase Authentication           |
| **AI**       | Mistral AI                        |
| **Medical API** | MedlinePlus, National Library of Medicine (NLM) |

---

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/baymax-ai-health-companion.git
   cd baymax-ai-health-companion
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add your Firebase and Mistral API credentials in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_MISTRAL_API_KEY=your_mistral_key
   ```

4. Run the app locally:
   ```bash
   npm run dev
   ```

---

## 📚 Data & AI Sources

- [MedlinePlus API](https://medlineplus.gov/)
- [National Library of Medicine API](https://www.nlm.nih.gov/)
- [Mistral AI](https://mistral.ai)

These sources enhance the medical accuracy and reliability of the assistant’s responses.

---

## 📄 License

This project is for educational and personal portfolio purposes.  
**Not affiliated with Disney or Big Hero 6.**  
MIT License.
