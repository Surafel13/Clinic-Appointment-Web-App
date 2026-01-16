# Setup Instructions

## Quick Start Guide

### 1. Database Setup

1. Make sure MySQL is installed and running
2. Open MySQL command line or MySQL Workbench
3. Run the schema file:
   ```bash
   mysql -u root -p < backend/config/dbSchema.sql
   ```
   Or manually execute the SQL commands in `backend/config/dbSchema.sql`

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=clinic_appointment
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
```

Start the backend:
```bash
npm start
# or for development
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Creating Your First Admin Account

Since there's no default admin account, you have two options:

### Option 1: Register through the UI
1. Go to http://localhost:3000/register
2. Fill in the registration form
3. Select "Doctor" as role (you can change it to admin in the database later)
4. Or modify the registration form to allow admin registration (for development only)

### Option 2: Create Admin via SQL
```sql
USE clinic_appointment;

-- Generate a bcrypt hash for your password (use online tool or Node.js)
-- For example, password "admin123" would be hashed
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@clinic.com', '$2a$10$YourGeneratedBcryptHashHere', 'admin');
```

To generate a bcrypt hash, you can use Node.js:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

## Testing the Application

1. Register a patient account
2. Register a doctor account
3. Login as patient and book an appointment
4. Login as doctor and approve the appointment
5. Create medical records as doctor
6. View medical records as patient

## Troubleshooting

### Database Connection Error
- Check MySQL is running: `mysql -u root -p`
- Verify database exists: `SHOW DATABASES;`
- Check `.env` file has correct credentials

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using the port

### CORS Errors
- Make sure backend is running on port 5000
- Check frontend proxy configuration in `vite.config.js`

### Module Not Found
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
