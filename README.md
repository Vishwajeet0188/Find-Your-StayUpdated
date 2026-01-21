# 🏨 Find Your Stay — Hotel Booking Platform

A full-stack hotel booking application that enables users to browse properties, view details, authenticate, and manage bookings with a clean user interface and secure backend.

---

## 🚀 Features

- ✔ User Authentication (Local Strategy)
- ✔ MongoDB Atlas Integration
- ✔ Property Browsing & Filtering
- ✔ Detailed Property Pages (Amenities, Images, Pricing)
- ✔ Booking & Reservation System
- ✔ User Dashboard for Booking History
- ✔ Admin Panel for Property Management
- ✔ Cloudinary Image Uploads
- ✔ Session-based Login using MongoStore
- ✔ Responsive EJS Frontend
- ✔ Ready for Cloud Deployment (Vercel)

---

## 🛠 Tech Stack

### **Frontend**
- HTML / CSS / Bootstrap
- EJS Templates

### **Backend**
- Node.js / Express.js
- Passport.js (Local Strategy)
- bcrypt.js for hashing

### **Database**
- MongoDB Atlas
- connect-mongo (Session Store)

### **Cloud Services**
- Cloudinary (Asset Storage)
- Vercel / Render (Hosting)

---

## 📦 Installation & Setup (Local)

Clone the repository:
bash
git clone https://github.com/Vishwajeet0188/FindYourStay.git
cd FindYourStay
npm install 

## Create a .env file in the project root:

MONGO_URL=<your mongo atlas url>
SESSION_SECRET=<your session secret>
CLOUD_NAME=<cloudinary name>
CLOUD_API_KEY=<cloudinary key>
CLOUD_API_SECRET=<cloudinary secret>

##  Run the development server:  npm start

## Visit locally: http://localhost:8080




👤 Author

Vishwajeet Singh

GitHub: @Vishwajeet0188

##  Live Demo link : https://find-your-stay-updated.vercel.app/
