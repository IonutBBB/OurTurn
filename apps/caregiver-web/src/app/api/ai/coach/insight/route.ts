import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const householdId = request.nextUrl.searchParams.get('householdId');

    if (!householdId) {
      return NextResponse.json(
        { error: 'householdId is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user belongs to this household
    const { data: caregiver } = await supabase
      .from('caregivers')
      .select('id')
      .eq('id', user.id)
      .eq('household_id', householdId)
      .single();

    if (!caregiver) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the latest weekly insight
    const { data: insight } = await supabase
      .from('weekly_insights')
      .select('*')
      .eq('household_id', householdId)
      .order('week_end', { ascending: false })
      .limit(1)
      .single();

    if (!insight || !insight.insights || insight.insights.length === 0) {
      return NextResponse.json({ insight: null });
    }

    // Pick the most relevant insight (prefer positive, then suggestion, then attention)
    const priorityOrder = ['positive', 'suggestion', 'attention'];
    const sorted = [...insight.insights].sort(
      (a: any, b: any) => priorityOrder.indexOf(a.category) - priorityOrder.indexOf(b.category)
    );
    const topInsight = sorted[0];

    return NextResponse.json({
      insight: {
        text: topInsight.insight,
        suggestion: topInsight.suggestion,
        category: topInsight.category,
        weekStart: insight.week_start,
        weekEnd: insight.week_end,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch insight' },
      { status: 500 }
    );
  }
}
