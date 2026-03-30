# Admin Dashboard Setup Guide

## Overview
A comprehensive **Admin Dashboard** has been created for managing Avatarana registrations. This dashboard allows admins to view all participant details, filter by zone, search by name/phone, and export data to Excel.

---

## 🔐 Access Credentials

**Admin Login URL:** `http://localhost:5173/admin/login`

### Static Credentials:
- **Username:** `admin`
- **Password:** `Avatarana@2026`

---

## 📊 Dashboard Features

### 1. **View All Registrations**
- See all registered participants with complete details
- Real-time data fetched from Supabase
- Automatic sorting by registration date (newest first)

### 2. **Participant Details Displayed**
- Full Name
- Phone Number
- Age
- Zone/Region
- Category
- Events Registered
- Team Name (if applicable)
- Team Members (if applicable)
- Registration Date & Time

### 3. **Search & Filter**
- **Search Box:** Search by name, phone, or team name
- **Zone Filter:** Filter registrations by zone/region
- **Real-time Filtering:** Results update instantly as you type

### 4. **Export to Excel**
- One-click export to Excel file
- Exports all filtered results (or all if no filters applied)
- File format: `.xlsx`
- Automatic filename: `avatarana_registrations_YYYY-MM-DD.xlsx`

### 5. **Session Management**
- Secure logout button
- Sessions stored in localStorage
- Automatic redirect to login if not authenticated

---

## 🎯 How to Use

### Step 1: Login
1. Navigate to `http://localhost:5173/admin/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `Avatarana@2026`
3. Click "Login"

### Step 2: View Registrations
- Dashboard displays all registrations in a table format
- Shows total count and filtered count at the top
- Table is sortable and scrollable on mobile devices

### Step 3: Search & Filter
- Use the search box to find participants by:
  - First/Last Name
  - Phone Number
  - Team Name
- Use the zone dropdown to filter by region
- Combine both for precise filtering

### Step 4: Export Data
1. (Optional) Apply filters to narrow down results
2. Click the "Export to Excel" button
3. File downloads automatically with current date in filename
4. Open in Excel/Google Sheets for further analysis

### Step 5: Logout
- Click the "Logout" button to end the session
- You'll be redirected to the homepage

---

## 📁 File Structure

New files created:
```
src/
├── context/
│   └── AdminContext.tsx          # Admin authentication context
├── pages/
│   ├── AdminLogin.tsx            # Admin login page
│   └── AdminDashboard.tsx        # Main admin dashboard
└── App.tsx                       # Updated with admin routes
```

New routes:
- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard (protected)

---

## 🔄 Real-time Updates

The dashboard fetches data directly from your Supabase `registrations` table with the following columns:
- `id` (UUID)
- `user_id` (UUID)
- `full_name` (Text)
- `phone` (Text)
- `age` (Integer)
- `region` (Text)
- `category` (Text)
- `events` (Array)
- `team_name` (Text)
- `team_members` (JSONB)
- `created_at` (Timestamp)

---

## 🛡️ Security Notes

⚠️ **Important:**
- Static credentials are used for demo purposes. For production:
  1. Use environment variables (`.env`) for credentials
  2. Consider using email+password authentication via Supabase Auth
  3. Implement proper session management with expiration
  4. Add role-based access control (RBAC)
  5. Enable HTTPS only
  6. Log all admin actions

Current credentials are visible in:
- `src/context/AdminContext.tsx` - Change these before production!

---

## 📦 Dependencies Used

- **xlsx** - For Excel export functionality
- **framer-motion** - For animations
- **lucide-react** - For icons
- **supabase-js** - For database queries

---

## 🎨 UI/UX Features

- Responsive design (mobile-friendly)
- Dark theme matching Avatarana branding
- Smooth animations and transitions
- Loading states for better feedback
- Error handling with user-friendly messages
- Hover effects on table rows
- Search highlights and instant filtering

---

## 🚀 Next Steps / Enhancements

Consider adding:
1. **Export Options:** PDF, CSV, JSON formats
2. **Advanced Filters:** Date range, multiple zones, category
3. **Analytics:** Charts showing registration trends, zone analytics
4. **Email Templates:** Send bulk emails to participants
5. **Team Management:** View and manage team assignments
6. **Admin Settings:** Change password, manage multiple admins
7. **Audit Logs:** Track all admin actions
8. **Batch Operations:** Bulk update or delete registrations
9. **Report Generation:** Custom reports and statistics
10. **Two-Factor Authentication:** Enhanced security

---

## ✅ Testing Checklist

- [ ] Login works with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Dashboard displays all registrations
- [ ] Search functionality works
- [ ] Zone filtering works
- [ ] Combined search + filter works
- [ ] Excel export downloads correctly
- [ ] Excel file contains all data
- [ ] Logout redirects to login
- [ ] Mobile responsive layout works

---

## 📞 Support

For issues or questions:
1. Check Supabase connection in `src/lib/supabase.ts`
2. Verify RLS policies allow SELECT on registrations table
3. Check browser console for error messages
4. Ensure xlsx package is installed: `npm list xlsx`

---

**Last Updated:** March 30, 2026
**Version:** 1.0.0
