import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if user has a household (completed onboarding)
        const { data: caregiver } = await supabase
          .from('caregivers')
          .select('household_id')
          .eq('id', user.id)
          .single();

        if (caregiver?.household_id) {
          // User has completed onboarding, go to dashboard
          return NextResponse.redirect(`${origin}${next}`);
        } else {
          // User needs to complete onboarding
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
