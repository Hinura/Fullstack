-- Fix subject_type enum to include all required values
-- The enum should have: 'math', 'english', 'science'

DO $$
BEGIN
    -- Check if subject_type enum exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subject_type') THEN
        -- Enum exists, check and add missing values

        -- Add 'math' if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'subject_type' AND e.enumlabel = 'math'
        ) THEN
            ALTER TYPE subject_type ADD VALUE 'math';
            RAISE NOTICE 'Added ''math'' to subject_type enum';
        END IF;

        -- Add 'english' if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'subject_type' AND e.enumlabel = 'english'
        ) THEN
            ALTER TYPE subject_type ADD VALUE 'english';
            RAISE NOTICE 'Added ''english'' to subject_type enum';
        END IF;

        -- Add 'science' if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'subject_type' AND e.enumlabel = 'science'
        ) THEN
            ALTER TYPE subject_type ADD VALUE 'science';
            RAISE NOTICE 'Added ''science'' to subject_type enum';
        END IF;

        RAISE NOTICE 'subject_type enum already exists and has been updated';
    ELSE
        -- Enum doesn't exist, create it
        CREATE TYPE subject_type AS ENUM ('math', 'english', 'science');
        RAISE NOTICE 'Created subject_type enum with values: math, english, science';
    END IF;
END $$;

-- Display current enum values for verification
SELECT
    'subject_type' as enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder as sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'subject_type'
ORDER BY e.enumsortorder;
