DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_plans' AND column_name = 'reporting_time') THEN
        ALTER TABLE daily_plans ADD COLUMN reporting_time TEXT;
    END IF;
END $$;
