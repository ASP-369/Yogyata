-- Yogyata Credential Management Tables
-- Run this in Supabase SQL Editor

-- Table for storing student credentials (simplified schema)
CREATE TABLE IF NOT EXISTS student_creds (
    id BIGINT PRIMARY KEY,  -- Credential ID from smart contract (returned by issueCredential)
    ipfs_hash TEXT,         -- IPFS/Pinata hash for credential data (NULL for now)
    aadhar BIGINT NOT NULL  -- Student's 12-digit Aadhar number
    verified BOOLEAN DEFAULT NULL,
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

-- Enable Row Level Security (optional)
-- ALTER TABLE student_creds ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE credential_votes ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON student_creds TO authenticated;
GRANT ALL ON credential_votes TO authenticated;
