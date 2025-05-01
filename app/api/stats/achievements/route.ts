import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { connectToDatabase } from '@/lib/mongoose';
import NutritionModel from '@/lib/models/nutrition';
import { 
  format, 
  subDays, 
  differenceInDays, 
  addDays
} from 'date-fns';

// Helper functions for achievements calculation
function calculateCurrentStreak(dailyLogs: Record<string, any>) {
  const today = new Date();
  let streak = 0;
  let currentDate = today;
  
  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const log = dailyLogs[dateStr];
    
    if (log && (log.meals?.length > 0 || log.waterIntake > 0)) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateMealConsistencyScore(dailyLogs: Record<string, any>, startDate: Date, endDate: Date) {
  const totalDays = differenceInDays(endDate, startDate) + 1;
  let daysWithMeals = 0;
  let daysWithAllMeals = 0;
  
  for (let d = 0; d < totalDays; d++) {
    const date = format(addDays(startDate, d), 'yyyy-MM-dd');
    const log = dailyLogs[date];
    
    if (log && log.meals && log.meals.length > 0) {
      daysWithMeals++;
      
      // Check if user logged all major meal types (breakfast, lunch, dinner)
      const mealTypes = new Set(log.meals.map((meal: any) => meal.mealType));
      if (mealTypes.has('breakfast') && mealTypes.has('lunch') && mealTypes.has('dinner')) {
        daysWithAllMeals++;
      }
    }
  }
  
  // Weight: 60% for logging any meals, 40% for logging all major meals
  const consistencyScore = Math.round((daysWithMeals / totalDays) * 60 + (daysWithAllMeals / totalDays) * 40);
  return Math.min(100, consistencyScore);
}

function calculateWaterGoalStreak(dailyLogs: Record<string, any>, waterGoal: number) {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 30; i++) { // Check up to 30 days back
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    const log = dailyLogs[date];
    
    if (log && log.waterIntake >= waterGoal) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateProteinGoalDays(dailyLogs: Record<string, any>, proteinGoal: number) {
  const today = new Date();
  let daysHit = 0;
  
  for (let i = 0; i < 30; i++) { // Check up to 30 days back
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    const log = dailyLogs[date];
    
    if (log && log.totalProtein >= proteinGoal) {
      daysHit++;
    }
  }
  
  return daysHit;
}

function calculateWeightLoggingStreak(dailyLogs: Record<string, any>) {
  const today = new Date();
  let count = 0;
  let weekCount = 0;
  let lastWeekLogged = -1;
  
  for (let week = 0; week < 12; week++) { // Check for 12 weeks (3 months)
    let hasWeightThisWeek = false;
    
    for (let day = 0; day < 7; day++) {
      const dayOffset = week * 7 + day;
      const date = format(subDays(today, dayOffset), 'yyyy-MM-dd');
      const log = dailyLogs[date];
      
      if (log && log.weight) {
        hasWeightThisWeek = true;
        count++;
        break;
      }
    }
    
    if (hasWeightThisWeek) {
      weekCount++;
      
      // Check if weeks are consecutive
      if (lastWeekLogged === -1 || lastWeekLogged === week - 1) {
        lastWeekLogged = week;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  
  return { totalDays: count, consecutiveWeeks: weekCount };
}

// Main API route to get achievements data
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    await connectToDatabase();

    // Fetch user's nutrition data
    const nutritionData = await NutritionModel.findOne({ userId });
    if (!nutritionData) {
      return NextResponse.json(
        { success: false, message: 'User nutrition data not found' },
        { status: 404 }
      );
    }

    // Convert dailyLogs to JavaScript object
    const dailyLogs = nutritionData.dailyLogs instanceof Map
      ? Object.fromEntries(nutritionData.dailyLogs.entries())
      : nutritionData.dailyLogs || {};

    const goals = nutritionData.goals || {
      calories: 2000,
      protein: 120,
      carbs: 250,
      fat: 65,
      water: 2000
    };

    // Calculate key metrics for achievements
    const today = new Date();
    const endDate = today;
    const startDate = subDays(today, 30); // Look at last 30 days for general stats
    
    const currentStreak = calculateCurrentStreak(dailyLogs);
    const mealConsistencyScore = calculateMealConsistencyScore(dailyLogs, startDate, endDate);
    const waterStreak = calculateWaterGoalStreak(dailyLogs, goals.water);
    const proteinDaysHit = calculateProteinGoalDays(dailyLogs, goals.protein);
    const weightTracking = calculateWeightLoggingStreak(dailyLogs);

    // Calculate achievements
    const achievements = [
      {
        id: 'streak',
        title: 'Current Streak',
        description: `${currentStreak} days in a row`,
        type: 'STREAK',
        progress: Math.min(100, (currentStreak / 7) * 100),
        date: format(new Date(), 'yyyy-MM-dd'),
        complete: currentStreak >= 7,
      },
      {
        id: 'consistency',
        title: 'Meal Consistency',
        description: 'Regularly log all your meals',
        type: 'CONSISTENCY',
        progress: mealConsistencyScore,
        date: format(new Date(), 'yyyy-MM-dd'),
        complete: mealConsistencyScore >= 80,
      },
      {
        id: 'hydration',
        title: 'Hydration Master',
        description: 'Reach water goal 7 days in a row',
        type: 'WATER',
        progress: Math.min(100, (waterStreak / 7) * 100),
        date: format(subDays(new Date(), waterStreak > 0 ? 0 : 2), 'yyyy-MM-dd'),
        complete: waterStreak >= 7,
      },
      {
        id: 'protein',
        title: 'Protein Champion',
        description: 'Hit protein targets for 10 days',
        type: 'NUTRITION',
        progress: Math.min(100, (proteinDaysHit / 10) * 100),
        date: format(subDays(new Date(), proteinDaysHit >= 10 ? 0 : 5), 'yyyy-MM-dd'),
        complete: proteinDaysHit >= 10,
      },
      {
        id: 'weight',
        title: 'Weight Tracker',
        description: 'Log weight for 4 consecutive weeks',
        type: 'WEIGHT',
        progress: Math.min(100, (weightTracking.consecutiveWeeks / 4) * 100),
        date: format(subDays(new Date(), weightTracking.consecutiveWeeks >= 4 ? 0 : 7), 'yyyy-MM-dd'),
        complete: weightTracking.consecutiveWeeks >= 4,
      },
    ];

    // Return compiled achievements data
    return NextResponse.json({
      success: true,
      data: {
        achievements,
        stats: {
          currentStreak,
          mealConsistencyScore,
          waterStreak,
          proteinDaysHit,
          weightTracking,
          achievementsCompleted: achievements.filter(a => a.complete).length,
          totalAchievements: achievements.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching achievements data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch achievements data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 