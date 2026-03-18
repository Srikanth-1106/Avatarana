import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qoqrbuqeipfiwtqbswkz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcXJidXFlaXBmaXd0cWJzd2t6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMyMzUyMSwiZXhwIjoyMDg4ODk5NTIxfQ.9TMQAO5B8zUBjQxl4hdMYYfuan-cSCLYd0LqFC13CBw';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testIndividual() {
  console.log('--- TESTING INDIVIDUAL REGISTRATION (ESM) ---');
  const record = {
    full_name: 'Repro Test Individual',
    phone: '1234567891',
    age: 30,
    region: 'udupi',
    category: 'Men',
    events: ['Housie Housie (Tambola) (General)']
  };

  const { data, error } = await supabase
    .from('registrations')
    .insert([record])
    .select();

  if (error) {
    console.error('FAILED:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCCESS:', data);
  }
}

testIndividual();
