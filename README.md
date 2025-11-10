# Event Planner & Collaboration Hub (Backend)

## Features Implemented

* User authentication & authorization (JWT-based)
* Role-based access control (Admin, Organizer, Participant)
* Event management (Create, Update, Delete, View)
* Event filters (Upcoming, Ongoing, Completed)
* Real-time chat using Socket.IO
* In-app & email notifications
* Background jobs (event reminders, daily digest)
* File/image upload using Cloudinary
* Pagination and search for events
* Integration-ready (Google Calendar / Slack / Analytics)
* Responsive API for frontend integration

---

## Technology Stack

* **Backend:** Node.js, Express.js, MongoDB, Mongoose
* **Realtime:** Socket.IO
* **Job Queue:** BullMQ with Redis
* **Authentication:** JWT & bcrypt
* **Email Service:** Nodemailer / SendGrid
* **File Uploads:** Cloudinary
* **Environment Management:** dotenv
## Setup Instructions

### 1. Prerequisites

* **Node.js** (v16+ recommended)
* **MongoDB Atlas**
* **Redis** (Render Redis add-on or Upstash)
* 
### 2. Installation Steps

# Clone repository
git clone https://github.com/ramya45r/EVENT_PLANNER_BACKEND.git

# Navigate to project
# Install dependencies
npm install

PORT=5000
REACT_PORT=3000
SOCKETPORT=5173
MONGO_URI=mongodb+srv://ramya45r_db_user:wYAnyyuuuJClXunS@cluster0.hwwqevz.mongodb.net/Eventplanner
# MONGO_URI=mongodb+srv://ramya45r_db_user:Ns16GsHRVC9uBPuZ@cluster0.ui1fulu.mongodb.net/

# MONGO_URI=mongodb://127.0.0.1:27017/Eventplanner

JWT_SECRET=supersecret_jwt_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=dn8krl0jy

CLOUDINARY_API_KEY=342261515112494

CLOUDINARY_API_SECRET=rgBzzatjkcKOVbYxiIkemrQef6Q	
REDIS_HOST=redis-12345.c12.us-east-1-4.ec2.cloud.redislabs.com
REDIS_PORT=6379
REDIS_PASSWORD=abcd1234abcd1234abcd1234

# Start backend (production)
npm start



