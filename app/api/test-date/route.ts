
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testDate } = body;

    console.log('=== DATE TEST ENDPOINT ===');
    console.log('Received date:', testDate);
    console.log('Type:', typeof testDate);

    const dateObj = new Date(testDate);
    console.log('Parsed Date Object:', dateObj.toISOString());
    console.log('Local Date String:', dateObj.toLocaleDateString('en-IN'));
    console.log('Year:', dateObj.getFullYear());
    console.log('Month:', dateObj.getMonth() + 1);
    console.log('Date:', dateObj.getDate());
    console.log('Hours:', dateObj.getHours());
    console.log('Minutes:', dateObj.getMinutes());
    console.log('Timezone Offset:', dateObj.getTimezoneOffset());
    console.log('========================');

    // Test normalization
    const normalizedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    console.log('Normalized Date:', normalizedDate.toISOString());
    console.log('Normalized Local Date:', normalizedDate.toLocaleDateString('en-IN'));

    return NextResponse.json({
      success: true,
      original: testDate,
      parsed: dateObj.toISOString(),
      localDate: dateObj.toLocaleDateString('en-IN'),
      normalized: normalizedDate.toISOString(),
      normalizedLocal: normalizedDate.toLocaleDateString('en-IN'),
      timezoneOffset: dateObj.getTimezoneOffset(),
    });

  } catch (error) {
    console.error('Date test error:', error);
    return NextResponse.json(
      { error: 'Date test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

