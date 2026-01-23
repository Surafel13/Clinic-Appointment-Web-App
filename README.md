# 🏥 Clinic Appointment & Patient Management System

A full-stack web application for managing clinic appointments, patients, doctors, and medical records with a beautiful, modern UI and smooth animations.

## ✨ Features

### 🔐 Authentication
- JWT-based authentication
- Role-based access control (Admin, Doctor, Patient)
- Secure password hashing with bcrypt

### 👤 Patient Module
- Register and login
- Book appointments with doctors
- View appointment history
- View personal medical records
- Cancel appointments

### 👨‍⚕️ Doctor Module
- Login and profile management
- View assigned appointments
- Approve/reject appointments
- Mark appointments as completed
- Create and update medical records

### 👑 Admin Dashboard
- Manage all users (patients, doctors, admins)
- View comprehensive statistics
- Manage all appointments
- Beautiful charts and analytics

### 🎨 UI/UX Features
- Modern, responsive design (mobile, tablet, desktop)
- GSAP animations throughout
- Toast notifications
- Beautiful gradient cards
- Smooth transitions and hover effects

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **GSAP** - Animations
- **React Hot Toast** - Notifications
- **Recharts** - Charts
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <https://github.com/Surafel13/Clinic-Appointment-Web-App.git>
cd Clinic-Appointment-Web-App
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=clinic_appointment
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

### 3. Database Setup

1. Make sure MySQL is running
2. Run the SQL schema file:
```bash
mysql -u root -p < backend/config/dbSchema.sql
```

Or manually execute the SQL file in your MySQL client.

### 4. Frontend Setup

```bash
cd frontend
npm install
```

## 🏃 Running the Application

### Start Backend Server
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
Courser/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── dbSchema.sql
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   └── patientController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── patientRoutes.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Sidebar.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── admin/
    │   │   ├── doctor/
    │   │   ├── patient/
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

## 🔑 Default Admin Account

After running the database schema, you can create an admin account by registering with role "admin" or by manually inserting into the database.

**Note:** The default admin password in the schema is a placeholder. You should change it after first login.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Appointments
- `GET /api/appointments` - Get appointments (role-based)
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment (admin only)

### Patients
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile
- `GET /api/patients/medical-records` - Get medical records

### Doctors
- `GET /api/doctors/all` - Get all doctors (public)
- `GET /api/doctors/profile` - Get doctor profile
- `PUT /api/doctors/profile` - Update doctor profile
- `GET /api/doctors/appointments` - Get doctor appointments
- `POST /api/doctors/medical-records` - Create medical record
- `PUT /api/doctors/medical-records/:id` - Update medical record

### Admin
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/appointments` - Get all appointments

## 🎨 GSAP Animations

The application includes smooth GSAP animations:
- Page entrance animations (fade + slide)
- Staggered animations for lists and tables
- Button hover & click animations
- Modal open/close animations
- Dashboard card animations
- Loading animations

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- SQL injection prevention (parameterized queries)
- CORS configuration

## 📱 Responsive Design

The application is fully responsive and works on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Large screens (1920px+)

## 🚧 Future Enhancements

- [ ] Email notifications
- [ ] PDF medical report generation
- [ ] Dark mode toggle
- [ ] Appointment reminders
- [ ] Doctor availability calendar
- [ ] Video consultation integration
- [ ] Multi-language support


## 👥 Contributing

Contributions, issues, and feature requests are welcome!

---

Made with ❤️ using React, Node.js, and MySQL
