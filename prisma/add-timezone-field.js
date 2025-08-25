// Migration script to add timezone field to existing users
// Run this with: node prisma/add-timezone-field.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTimezoneField() {
  try {
    console.log('🚀 Starting timezone field migration...');
    
    // Get all users without timezone field
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    
    console.log(`📊 Found ${users.length} users to update`);
    
    let updatedCount = 0;
    let errors = 0;
    
    // Update each user to add timezone field
    for (const user of users) {
      try {
        // Update user to add timezone field with default value
        await prisma.user.update({
          where: { id: user.id },
          data: {
            timezone: 'Asia/Kolkata', // Default timezone
          },
        });
        
        console.log(`✅ Updated user: ${user.name} (${user.email}) - Added timezone: Asia/Kolkata`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to update user ${user.name}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 Migration completed:`);
    console.log(`   - Users processed: ${users.length}`);
    console.log(`   - Successfully updated: ${updatedCount}`);
    console.log(`   - Errors: ${errors}`);
    
    if (errors === 0) {
      console.log('🎉 All users now have timezone field!');
    } else {
      console.log('⚠️ Some users failed to update. Check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addTimezoneField();
