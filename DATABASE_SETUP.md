# Database Setup Guide - Multi-Timezone Reminder System

## 🚀 Quick Start

### 1. Update Database Schema
```bash
# Push the new schema with timezone support
npx prisma db push

# Generate the updated Prisma client
npx prisma generate
```

### 2. Clean Up Obsolete Data
```bash
# Option A: Clean up only (delete all data)
npm run cleanup

# Option B: Reset database completely and seed with fresh data
npm run db:reset
```

## 📋 Available Scripts

### Database Management
- **`npm run cleanup`** - Deletes all existing data (clean slate)
- **`npm run seed`** - Seeds database with fresh, properly structured data
- **`npm run db:reset`** - Complete database reset + seeding

### Development
- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run lint`** - Run ESLint

## 🌍 Multi-Timezone System

### How It Works
1. **User Timezone Storage**: Each user has a `timezone` field (e.g., "Asia/Kolkata")
2. **UTC Date Storage**: All reminders stored in UTC format
3. **Hourly Processing**: Cron job runs every hour (`0 * * * *`)
4. **Timezone-Specific Processing**: Each hour processes specific timezones

### Timezone Processing Schedule
| UTC Hour | Timezones | Local Time (Example) |
|----------|-----------|---------------------|
| 4 | Asia/Tokyo, Asia/Seoul | 1:00 PM JST |
| 8 | Asia/Kolkata, Asia/Colombo | 1:30 PM IST |
| 14 | Europe/London, Europe/Dublin | 2:00 PM GMT |
| 16 | America/New_York, America/Toronto | 11:00 AM EST |
| 19 | America/Los_Angeles, America/Vancouver | 11:00 AM PST |

## 🧪 Test Data

### Sample Users (All with password: `password123`)
- **John Doe** (john@example.com) - Asia/Kolkata (India)
- **Jane Smith** (jane@example.com) - America/New_York (US Eastern)
- **Yuki Tanaka** (yuki@example.com) - Asia/Tokyo (Japan)
- **Emma Wilson** (emma@example.com) - Europe/London (UK)

### Sample Data Created
- **Courses**: 5 courses across different users
- **Attendance**: Historical attendance records
- **Reminders**: Tomorrow's reminders for testing

## 🔧 Database Schema Changes

### New Fields Added
```prisma
model User {
  // ... existing fields
  timezone    String       @default("Asia/Kolkata")
}
```

### Reminder Storage
- **Before**: Dates stored with timezone confusion
- **After**: Dates stored in UTC, converted during processing

## 🚨 Important Notes

### Before Running Scripts
1. **Backup your data** if you have important information
2. **Ensure Prisma is up to date** (`npx prisma generate`)
3. **Check your database connection** in `.env`

### After Seeding
1. **Test login** with sample users
2. **Verify timezone handling** in the UI
3. **Check reminder creation** for different dates

## 🐛 Troubleshooting

### Common Issues
1. **Prisma Client Outdated**
   ```bash
   npx prisma generate
   ```

2. **Database Connection Failed**
   - Check `.env` file
   - Verify database is running
   - Check network connectivity

3. **Timezone Validation Error**
   - Ensure timezone strings are valid (e.g., "Asia/Kolkata")
   - Use standard IANA timezone names

### Reset Everything
```bash
# Complete reset
npm run db:reset

# Or step by step
npx prisma db push --force-reset
npm run seed
```

## 📊 Verification

### Check Database State
```bash
# View database in Prisma Studio
npx prisma studio

# Check specific tables
npx prisma studio --port 5555
```

### Expected Results
- ✅ 4 users with different timezones
- ✅ 5 courses distributed across users
- ✅ Sample attendance records
- ✅ Tomorrow's reminders for testing

## 🎯 Next Steps

1. **Deploy to Vercel** with updated cron configuration
2. **Test reminder system** with different timezones
3. **Add timezone selector** to user settings
4. **Monitor cron job logs** for proper execution

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your database connection and credentials
3. Ensure all environment variables are set correctly
4. Check Vercel function logs for cron job execution

---

**Happy coding! 🚀**
