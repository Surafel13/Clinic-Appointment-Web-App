# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup
```bash
# Make sure MySQL is running, then:
mysql -u root -p < backend/config/dbSchema.sql
```

### Step 2: Backend Setup
```bash
cd backend
npm install

# Create .env file (copy from .env.example)
# Edit .env with your MySQL credentials

npm start
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Step 4: Access Application
- Open http://localhost:3000
- Register a new account (Patient or Doctor)
- Start using the application!

## 🔑 Creating Admin Account

### Method 1: Generate Password Hash
```bash
cd backend
npm run generate-password admin123
# Copy the hash and use in SQL:
```

```sql
USE clinic_appointment;
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@clinic.com', 'PASTE_HASH_HERE', 'admin');
```

### Method 2: Register as Doctor, then Update
1. Register as Doctor through UI
2. Update role in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## 📱 User Roles

- **Patient**: Book appointments, view medical records
- **Doctor**: Manage appointments, create medical records
- **Admin**: Manage all users and appointments, view statistics

## 🎯 Common Tasks

### Book an Appointment (Patient)
1. Login as Patient
2. Go to "Book Appointment"
3. Select doctor, date, time
4. Submit

### Approve Appointment (Doctor)
1. Login as Doctor
2. Go to "Appointments"
3. Click "Approve" on pending appointments

### Create Medical Record (Doctor)
1. Login as Doctor
2. Go to "Appointments"
3. Click "Add Record" on approved appointments
4. Fill in diagnosis, prescription, notes
5. Submit

### View Medical Records (Patient)
1. Login as Patient
2. Go to "Medical Records"
3. View all your records

## 🐛 Troubleshooting

**Database Connection Error?**
- Check MySQL is running
- Verify .env credentials
- Ensure database exists

**Port Already in Use?**
- Change PORT in backend/.env
- Or kill process: `lsof -ti:5000 | xargs kill`

**Module Not Found?**
- Delete node_modules and package-lock.json
- Run `npm install` again

**CORS Errors?**
- Ensure backend is running on port 5000
- Check vite.config.js proxy settings

## 📚 Next Steps

- Read full README.md for detailed documentation
- Check SETUP.md for comprehensive setup instructions
- Explore the codebase to understand the architecture

Happy coding! 🎉
