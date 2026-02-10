import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createLogger } from '@/lib/logger';

const log = createLogger('dev/seed');

// This endpoint is for development only
// It seeds the database with mock data for testing

const HOUSEHOLD_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const PATIENT_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
const CARE_CODE = '123456';

export async function POST() {
  // Only allow in development with explicit opt-in
  if (process.env.NODE_ENV === 'production' || !process.env.ENABLE_DEV_SEED) {
    return new NextResponse(null, { status: 404 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({
      error: 'SUPABASE_SERVICE_ROLE_KEY not set',
      instructions: 'Get your service role key from Supabase Dashboard > Settings > API and add it to .env'
    }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl!, serviceRoleKey, {
    auth: { persistSession: false }
  });

  try {
    // 1. Create household
    const { error: householdError } = await supabase
      .from('households')
      .upsert({
        id: HOUSEHOLD_ID,
        care_code: CARE_CODE,
        timezone: 'Europe/Bucharest',
        language: 'en',
        country: 'RO',
        subscription_status: 'plus'
      });

    if (householdError) throw householdError;

    // 2. Create patient
    const { error: patientError } = await supabase
      .from('patients')
      .upsert({
        id: PATIENT_ID,
        household_id: HOUSEHOLD_ID,
        name: 'Maria Johnson',
        date_of_birth: '1945-03-15',
        dementia_type: "Alzheimer's",
        stage: 'early',
        home_address_formatted: '123 Memory Lane, Bucharest, Romania',
        home_latitude: 44.4268,
        home_longitude: 26.1025,
        wake_time: '07:30',
        sleep_time: '21:00',
        emergency_number: '+40721234567'
      });

    if (patientError) throw patientError;

    // 3. Create care plan tasks
    const tasks = [
      { id: 'c3d4e5f6-a7b8-9012-cdef-123456789012', category: 'medication', title: 'Morning Medication', hint_text: 'Take with breakfast and a full glass of water', time: '08:00' },
      { id: 'd4e5f6a7-b8c9-0123-def0-234567890123', category: 'nutrition', title: 'Breakfast', hint_text: 'Oatmeal with berries and honey - your favorite!', time: '08:30' },
      { id: 'e5f6a7b8-c9d0-1234-ef01-345678901234', category: 'physical', title: 'Morning Walk', hint_text: 'Walk around the garden - look for the roses!', time: '10:00' },
      { id: 'f6a7b8c9-d0e1-2345-f012-456789012345', category: 'cognitive', title: 'Photo Album Time', hint_text: 'Look through the family album with grandchildren photos', time: '11:00' },
      { id: 'a7b8c9d0-e1f2-3456-0123-567890123456', category: 'nutrition', title: 'Lunch', hint_text: 'Soup and sandwich in the kitchen', time: '12:30' },
      { id: 'b8c9d0e1-f2a3-4567-1234-678901234567', category: 'medication', title: 'Afternoon Medication', hint_text: 'Blue pill with water - after lunch', time: '13:00' },
      { id: 'c9d0e1f2-a3b4-5678-2345-789012345678', category: 'social', title: 'Video Call with Ana', hint_text: 'Your daughter Ana will call on the tablet', time: '15:00' },
      { id: 'd0e1f2a3-b4c5-6789-3456-890123456789', category: 'nutrition', title: 'Dinner', hint_text: 'Light dinner - soup and bread', time: '18:30' },
      { id: 'e1f2a3b4-c5d6-7890-4567-901234567890', category: 'medication', title: 'Evening Medication', hint_text: 'Sleep aid - take 30 minutes before bed', time: '20:30' },
    ];

    for (const task of tasks) {
      await supabase.from('care_plan_tasks').upsert({
        ...task,
        household_id: HOUSEHOLD_ID,
        recurrence: 'daily',
        active: true
      });
    }

    // 4. Create task completions for today
    const today = new Date().toISOString().split('T')[0];
    const completions = [
      { task_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012', completed: true, completed_at: new Date(Date.now() - 6 * 3600000).toISOString() },
      { task_id: 'd4e5f6a7-b8c9-0123-def0-234567890123', completed: true, completed_at: new Date(Date.now() - 5 * 3600000).toISOString() },
      { task_id: 'e5f6a7b8-c9d0-1234-ef01-345678901234', completed: true, completed_at: new Date(Date.now() - 4 * 3600000).toISOString() },
      { task_id: 'f6a7b8c9-d0e1-2345-f012-456789012345', completed: false },
      { task_id: 'a7b8c9d0-e1f2-3456-0123-567890123456', completed: false },
      { task_id: 'b8c9d0e1-f2a3-4567-1234-678901234567', completed: false },
    ];

    for (const completion of completions) {
      await supabase.from('task_completions').upsert({
        ...completion,
        household_id: HOUSEHOLD_ID,
        date: today,
      }, { onConflict: 'task_id,date' });
    }

    // 5. Create daily check-in
    await supabase.from('daily_checkins').upsert({
      household_id: HOUSEHOLD_ID,
      date: today,
      mood: 4,
      sleep_quality: 3,
      submitted_at: new Date(Date.now() - 6 * 3600000).toISOString(),
      ai_summary: 'Maria had a good morning. She reported sleeping well and feeling cheerful.'
    }, { onConflict: 'household_id,date' });

    // 6. Create safe zones
    const safeZones = [
      { id: 'a9b0c1d2-e3f4-5678-2345-789012345678', name: 'Home', latitude: 44.4268, longitude: 26.1025, radius_meters: 100 },
      { id: 'b0c1d2e3-f4a5-6789-3456-890123456789', name: 'Garden Area', latitude: 44.4270, longitude: 26.1028, radius_meters: 50 },
      { id: 'c1d2e3f4-a5b6-7890-4567-901234567890', name: 'Park Nearby', latitude: 44.4290, longitude: 26.1050, radius_meters: 200 },
    ];

    for (const zone of safeZones) {
      await supabase.from('safe_zones').upsert({
        ...zone,
        household_id: HOUSEHOLD_ID,
        active: true
      });
    }

    // 7. Create location logs
    const locations = [
      { latitude: 44.4268, longitude: 26.1025, location_label: 'Home', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
      { latitude: 44.4269, longitude: 26.1026, location_label: 'Home', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
      { latitude: 44.4270, longitude: 26.1028, location_label: 'Garden Area', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
    ];

    for (const loc of locations) {
      await supabase.from('location_logs').insert({
        ...loc,
        patient_id: PATIENT_ID,
        household_id: HOUSEHOLD_ID,
        accuracy_meters: 10
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Mock data seeded successfully',
      careCode: CARE_CODE,
      householdId: HOUSEHOLD_ID,
      patientName: 'Maria Johnson'
    });

  } catch (error: unknown) {
    log.error('Seed failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json({
      error: 'Failed to seed data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  if (process.env.NODE_ENV === 'production' || !process.env.ENABLE_DEV_SEED) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json({
    message: 'Use POST to seed the database',
    instructions: [
      '1. Get your service role key from Supabase Dashboard > Settings > API',
      '2. Add SUPABASE_SERVICE_ROLE_KEY=your-key to your .env file',
      '3. Set ENABLE_DEV_SEED=1 in your .env file',
      '4. POST to this endpoint to seed mock data',
    ]
  });
}
