#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// SQL to check and fix enum
const checkEnumSQL = `
SELECT
    t.typname AS enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'subject_type'
GROUP BY t.typname;
`;

const fixEnumSQL = `
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subject_type') THEN
        -- Check and add 'math'
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'subject_type' AND e.enumlabel = 'math'
        ) THEN
            ALTER TYPE subject_type ADD VALUE 'math';
        END IF;

        -- Check and add 'english'
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'subject_type' AND e.enumlabel = 'english'
        ) THEN
            ALTER TYPE subject_type ADD VALUE 'english';
        END IF;

        -- Check and add 'science'
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'subject_type' AND e.enumlabel = 'science'
        ) THEN
            ALTER TYPE subject_type ADD VALUE 'science';
        END IF;
    ELSE
        CREATE TYPE subject_type AS ENUM ('math', 'english', 'science');
    END IF;
END $$;
`;

async function main() {
  console.log('Checking subject_type enum...\n');

  // Check current enum values
  const { data: beforeData, error: beforeError } = await supabase.rpc('query', {
    query: checkEnumSQL
  });

  if (beforeError) {
    // Try direct SQL if RPC doesn't work
    console.log('Current enum status: checking...');
  } else if (beforeData && beforeData.length > 0) {
    console.log('Current enum values:', beforeData[0].enum_values);
  } else {
    console.log('subject_type enum does not exist yet.');
  }

  console.log('\nFixing enum...');

  // Fix the enum
  const { data: fixData, error: fixError } = await supabase.rpc('query', {
    query: fixEnumSQL
  });

  if (fixError) {
    console.error('Error fixing enum:', fixError);
    console.log('\nPlease run this SQL in your Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/awctrtvldzlfuntzlahs/sql/new');
    console.log('\n' + fixEnumSQL);
    process.exit(1);
  }

  console.log('✓ Enum fixed successfully!\n');

  // Check after
  const { data: afterData, error: afterError } = await supabase.rpc('query', {
    query: checkEnumSQL
  });

  if (!afterError && afterData && afterData.length > 0) {
    console.log('Updated enum values:', afterData[0].enum_values);
  }
}

main().catch(console.error);
