import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { connectToDatabase } from '@/lib/mongoose';
import NutritionModel from '@/lib/models/nutrition';
import { 
  format, 
  subDays, 
  subMonths, 
  differenceInDays, 
  addDays,
  parseISO
} from 'date-fns';

// Helper functions for stats calculation
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

// Main API route to get statistics data
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

    // Get time range from query params, default to week
    const timeRange = request.nextUrl.searchParams.get('timeRange') || 'week';
    const today = new Date();
    const endDate = today;
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = subDays(today, 6);
        break;
      case 'month':
        startDate = subDays(today, 29);
        break;
      case '3months':
        startDate = subMonths(today, 3);
        break;
      case '6months':
        startDate = subMonths(today, 6);
        break;
      case 'year':
        startDate = subMonths(today, 12);
        break;
      default:
        startDate = subDays(today, 6);
    }

    // Calculate key metrics
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

    // Calculate total entries
    const totalEntries = Object.values(dailyLogs).reduce((sum, log: any) => sum + (log.meals?.length || 0), 0);

    // Calculate calorie trend data based on time range
    const calorieTrendData = [];
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    
    // For week and month, show daily data
    if (timeRange === 'week' || timeRange === 'month') {
      for (let i = 0; i < daysDiff; i++) {
        const day = addDays(startDate, i);
        const formattedDate = format(day, 'yyyy-MM-dd');
        const dayLog = dailyLogs[formattedDate] || { totalCalories: 0 };
        
        calorieTrendData.push({
          date: formattedDate,
          name: format(day, timeRange === 'week' ? 'EEE' : 'dd MMM'),
          calories: dayLog.totalCalories || 0,
          goal: goals.calories
        });
      }
    } else {
      // For longer periods, aggregate by weeks or months
      const isLongPeriod = timeRange === 'year';
      const aggregationPeriod = isLongPeriod ? 30 : 7; // Month or week
      const periodsCount = Math.ceil(daysDiff / aggregationPeriod);
      
      for (let i = 0; i < periodsCount; i++) {
        const periodStart = addDays(startDate, i * aggregationPeriod);
        const periodLabel = format(periodStart, isLongPeriod ? 'MMM' : 'dd MMM');
        let totalCalories = 0;
        let daysWithData = 0;
        
        // Calculate average for this period
        for (let j = 0; j < aggregationPeriod && i * aggregationPeriod + j < daysDiff; j++) {
          const date = format(addDays(startDate, i * aggregationPeriod + j), 'yyyy-MM-dd');
          const dayLog = dailyLogs[date];
          
          if (dayLog && dayLog.totalCalories) {
            totalCalories += dayLog.totalCalories;
            daysWithData++;
          }
        }
        
        const avgCalories = daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0;
        
        calorieTrendData.push({
          date: format(periodStart, 'yyyy-MM-dd'),
          name: periodLabel,
          calories: avgCalories,
          goal: goals.calories
        });
      }
    }

    // Calculate nutrient distribution data
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    
    for (let i = 0; i < daysDiff; i++) {
      const date = format(addDays(startDate, i), 'yyyy-MM-dd');
      const dayLog = dailyLogs[date];
      
      if (dayLog) {
        totalProtein += dayLog.totalProtein || 0;
        totalFat += dayLog.totalFat || 0;
        totalCarbs += dayLog.totalCarbs || 0;
      }
    }
    
    const total = totalProtein + totalFat + totalCarbs;
    
    const nutrientDistribution = [
      { name: 'Protein', value: totalProtein, percentage: total > 0 ? Math.round((totalProtein / total) * 100) : 0 },
      { name: 'Fat', value: totalFat, percentage: total > 0 ? Math.round((totalFat / total) * 100) : 0 },
      { name: 'Carbs', value: totalCarbs, percentage: total > 0 ? Math.round((totalCarbs / total) * 100) : 0 },
    ];

    // Calculate meal distribution by time and type
    const mealTimeMapping = {
      breakfast: 'Morning',
      lunch: 'Afternoon',
      dinner: 'Evening',
      snack: 'Snack'
    };
    
    const mealsByType: Record<string, number> = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Snack: 0
    };
    
    const caloriesByType: Record<string, number> = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Snack: 0
    };
    
    for (let d = 0; d < daysDiff; d++) {
      const date = format(addDays(startDate, d), 'yyyy-MM-dd');
      const dayLog = dailyLogs[date];
      
      if (dayLog && dayLog.meals) {
        dayLog.meals.forEach((meal: any) => {
          const timeKey = mealTimeMapping[meal.mealType as keyof typeof mealTimeMapping] || mealTimeMapping.snack;
          mealsByType[timeKey] += 1;
          
          // Sum calories by meal type
          const mealCalories = meal.foodItem.calories * meal.quantity;
          caloriesByType[timeKey] += mealCalories;
        });
      }
    }
    
    // Calculate average calories per meal type
    Object.keys(caloriesByType).forEach(type => {
      if (mealsByType[type] > 0) {
        caloriesByType[type] = Math.round(caloriesByType[type] / mealsByType[type]);
      }
    });
    
    const mealDistribution = {
      byCount: Object.entries(mealsByType).map(([time, count]) => ({
        name: time,
        value: count
      })),
      byCalories: Object.entries(caloriesByType).map(([time, calories]) => ({
        name: time,
        value: calories
      }))
    };

    // Collect top foods
    const foodCounts: Record<string, { count: number, calories: number, name: string, icon: string }> = {};
    
    for (const date in dailyLogs) {
      const log = dailyLogs[date];
      if (log?.meals) {
        for (const meal of log.meals) {
          const foodName = meal.foodItem.name;
          if (!foodCounts[foodName]) {
            let icon = '🍽️'; // Default icon
            
            // Assign icons based on food category or name keywords
            const foodCategory = meal.foodItem.category;
            const nameLower = foodName.toLowerCase();
            
            if (foodCategory === 'protein' || nameLower.includes('chicken') || nameLower.includes('beef') || nameLower.includes('meat')) {
              icon = '🍗';
            } else if (foodCategory === 'vegetable' || nameLower.includes('salad') || nameLower.includes('vegetable')) {
              icon = '🥗';
            } else if (foodCategory === 'fruit' || nameLower.includes('fruit') || nameLower.includes('apple') || nameLower.includes('banana')) {
              icon = '🍎';
            } else if (foodCategory === 'grain' || nameLower.includes('rice') || nameLower.includes('bread') || nameLower.includes('pasta')) {
              icon = '🍚';
            } else if (foodCategory === 'dairy' || nameLower.includes('milk') || nameLower.includes('yogurt') || nameLower.includes('cheese')) {
              icon = '🥛';
            } else if (foodCategory === 'beverage' || nameLower.includes('water') || nameLower.includes('juice') || nameLower.includes('coffee')) {
              icon = '🥤';
            } else if (foodCategory === 'snack' || nameLower.includes('cookie') || nameLower.includes('chips') || nameLower.includes('snack')) {
              icon = '🍪';
            }
            
            foodCounts[foodName] = {
              count: 0,
              calories: meal.foodItem.calories,
              name: foodName,
              icon
            };
          }
          
          foodCounts[foodName].count += 1;
        }
      }
    }
    
    const topFoods = Object.values(foodCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate macronutrient balance data (protein, fat, carbs ratio over time)
    const macroBalanceData = [];
    
    // For simplicity, we'll show weekly averages regardless of time range
    const weeksCount = Math.ceil(daysDiff / 7);
    
    for (let i = 0; i < weeksCount; i++) {
      const weekStart = addDays(startDate, i * 7);
      let totalProtein = 0;
      let totalFat = 0;
      let totalCarbs = 0;
      let daysWithData = 0;
      
      // Calculate average for this week
      for (let j = 0; j < 7 && i * 7 + j < daysDiff; j++) {
        const date = format(addDays(startDate, i * 7 + j), 'yyyy-MM-dd');
        const dayLog = dailyLogs[date];
        
        if (dayLog && (dayLog.totalProtein || dayLog.totalFat || dayLog.totalCarbs)) {
          totalProtein += dayLog.totalProtein || 0;
          totalFat += dayLog.totalFat || 0;
          totalCarbs += dayLog.totalCarbs || 0;
          daysWithData++;
        }
      }
      
      // Only add data point if we have data for this week
      if (daysWithData > 0) {
        const total = totalProtein + totalFat + totalCarbs;
        macroBalanceData.push({
          date: format(weekStart, 'yyyy-MM-dd'),
          name: format(weekStart, 'dd MMM'),
          protein: total > 0 ? Math.round((totalProtein / total) * 100) : 0,
          fat: total > 0 ? Math.round((totalFat / total) * 100) : 0,
          carbs: total > 0 ? Math.round((totalCarbs / total) * 100) : 0,
        });
      }
    }

    // Calculate daily nutrition radar data
    const avgProtein = daysDiff > 0 ? Math.round(totalProtein / daysDiff) : 0;
    const avgFat = daysDiff > 0 ? Math.round(totalFat / daysDiff) : 0;
    const avgCarbs = daysDiff > 0 ? Math.round(totalCarbs / daysDiff) : 0;
    const avgCalories = daysDiff > 0 ? Math.round(Object.keys(dailyLogs)
      .filter(date => parseISO(date) >= startDate && parseISO(date) <= endDate)
      .reduce((sum, date) => sum + (dailyLogs[date]?.totalCalories || 0), 0) / daysDiff) : 0;
    
    // Calculate recommended values based on goals
    const recProtein = Math.round(((goals.protein || 30) / 100) * goals.calories / 4);
    const recFat = Math.round(((goals.fat || 30) / 100) * goals.calories / 9);
    const recCarbs = Math.round(((goals.carbs || 40) / 100) * goals.calories / 4);
    
    // Calculate percentage of goal achieved (capped at 100%)
    const proteinPct = Math.min(100, Math.round((avgProtein / recProtein) * 100));
    const fatPct = Math.min(100, Math.round((avgFat / recFat) * 100));
    const carbsPct = Math.min(100, Math.round((avgCarbs / recCarbs) * 100));
    const caloriesPct = Math.min(100, Math.round((avgCalories / goals.calories) * 100));
    
    const nutritionRadarData = [
      {
        subject: 'Protein',
        value: proteinPct,
        fullMark: 100,
        actual: avgProtein,
        recommended: recProtein
      },
      {
        subject: 'Fat',
        value: fatPct,
        fullMark: 100,
        actual: avgFat,
        recommended: recFat
      },
      {
        subject: 'Carbs',
        value: carbsPct,
        fullMark: 100,
        actual: avgCarbs,
        recommended: recCarbs
      },
      {
        subject: 'Calories',
        value: caloriesPct,
        fullMark: 100,
        actual: avgCalories,
        recommended: goals.calories
      }
    ];

    // Return compiled stats data
    return NextResponse.json({
      success: true,
      data: {
        keyStats: {
          currentStreak,
          totalEntries,
          mealConsistencyScore,
          achievementsCompleted: achievements.filter(a => a.complete).length,
          totalAchievements: achievements.length
        },
        achievements,
        nutrientDistribution,
        calorieTrendData,
        macroBalanceData,
        mealDistribution,
        nutritionRadarData,
        topFoods
      }
    });
  } catch (error) {
    console.error('Error fetching stats data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch stats data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 