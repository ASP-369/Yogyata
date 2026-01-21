-- Yogyata Credential Management Tables
-- Run this in Supabase SQL Editor

-- Table for storing student credentials (simplified schema)
CREATE TABLE IF NOT EXISTS student_creds (
    id BIGINT PRIMARY KEY,  -- Credential ID from smart contract (returned by issueCredential)
    ipfs_hash TEXT,         -- IPFS/Pinata hash for credential data (NULL for now)
    aadhar BIGINT NOT NULL,  -- Student's 12-digit Aadhar number
    verified BOOLEAN DEFAULT NULL
);

-- Table for storing verification votes
CREATE TABLE IF NOT EXISTS credential_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Vote Details
    credential_id BIGINT REFERENCES student_creds(id) ON DELETE CASCADE,
    voter_address VARCHAR(42) NOT NULL,  -- Verifier's Ethereum address
    vote BOOLEAN NOT NULL,  -- true = approve, false = reject
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate votes
    UNIQUE(credential_id, voter_address)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_student_creds_aadhar ON student_creds(aadhar);
CREATE INDEX IF NOT EXISTS idx_credential_votes_credential ON credential_votes(credential_id);
CREATE INDEX IF NOT EXISTS idx_credential_votes_voter ON credential_votes(voter_address);

-- IMPORTANT: Disable RLS or add permissive policies
-- Option 1: Disable RLS (simpler for development)
ALTER TABLE student_creds DISABLE ROW LEVEL SECURITY;
ALTER TABLE credential_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE student DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Teacher" DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want RLS enabled, create permissive policies
-- ALTER TABLE student_creds ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all access to student_creds" ON student_creds FOR ALL USING (true) WITH CHECK (true);
-- ALTER TABLE credential_votes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all access to credential_votes" ON credential_votes FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to both authenticated and anon roles
GRANT ALL ON student_creds TO authenticated;
GRANT ALL ON student_creds TO anon;
GRANT ALL ON credential_votes TO authenticated;
GRANT ALL ON credential_votes TO anon;
GRANT ALL ON student TO authenticated;
GRANT ALL ON student TO anon;
GRANT ALL ON "Teacher" TO authenticated;
GRANT ALL ON "Teacher" TO anon;
